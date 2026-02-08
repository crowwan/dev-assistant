# Design: Resume Session Analyzer (이력서 세션 분석기)

> 최근 Claude Code 세션을 분석하여 이력서에 작성할 성과를 자동 식별하고 초안을 생성하는 기능

## 참조 문서
- Plan: `docs/01-plan/features/resume-session-analyzer.plan.md`
- 기존 스킬: `.claude/skills/resume-ref/SKILL.md`

---

## 1. 명령어 인터페이스

### 1.1 기존 스킬 확장

기존 `resume-ref` 스킬의 `generate --from-sessions` 옵션 구현

| 명령어 | 설명 | 예시 |
|--------|------|------|
| `/resume-ref generate --from-sessions` | 최근 30일 세션 분석 | 기본 |
| `/resume-ref generate --from-sessions --since="YYYY-MM-DD"` | 특정 날짜 이후 | `--since="2026-01-01"` |
| `/resume-ref generate --from-sessions --days=N` | 최근 N일 | `--days=60` |
| `/resume-ref generate --from-sessions --project=NAME` | 특정 프로젝트만 | `--project="dev-assistant"` |
| `/resume-ref analyze-sessions` | 분석만 (초안 생성 X) | 미리보기용 |

### 1.2 인자 파싱 규칙

```
/resume-ref generate --from-sessions [OPTIONS]

OPTIONS:
  --source=SOURCE       데이터 소스 (local|claude-mem, 기본: local)
  --since=YYYY-MM-DD    시작 날짜 지정
  --days=N              최근 N일 (기본: 30)
  --project=NAME        프로젝트 필터
  --dry-run             미리보기 (파일 생성 안 함)
```

### 1.3 데이터 소스 비교

| 소스 | 설명 | 장점 | 단점 |
|------|------|------|------|
| `local` (기본) | `~/.claude/projects/*.jsonl` 파일 직접 분석 | 풍부한 컨텍스트, 원본 대화 | 분석 필요 |
| `claude-mem` | claude-mem MCP 플러그인 | 이미 정제됨 (🟣, 🔴 등) | 요약본만 |

```bash
# 로컬 세션 파일 (기본, 권장)
/resume-ref generate --from-sessions

# claude-mem MCP 사용
/resume-ref generate --from-sessions --source=claude-mem
```

---

## 2. 데이터 모델

### 2.1 세션 분석 결과 (SessionAnalysis)

```typescript
interface SessionAnalysis {
  period: {
    start: string;  // ISO date
    end: string;
  };
  totalSessions: number;
  totalObservations: number;

  achievements: Achievement[];
  groups: AchievementGroup[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  type: 'feature' | 'bugfix' | 'optimization' | 'refactoring' | 'documentation';

  // 메타데이터
  date: string;
  project?: string;
  files: string[];

  // 정량적 수치 (추출된 경우)
  metrics?: {
    value: number;
    unit: string;
    context: string;  // "응답 시간 60% 단축"
  }[];

  // 원본 관찰 ID (claude-mem)
  sourceIds: number[];

  // 연관 점수 (그룹핑용)
  relatedTo?: { id: string; score: number }[];
}

interface AchievementGroup {
  id: string;
  title: string;  // 대표 제목
  period: { start: string; end: string };
  achievements: Achievement[];

  // 통합 메타데이터
  totalSessions: number;
  techStack: string[];
  summary: string;  // Reference 패턴 적용된 요약
}
```

### 2.2 이력서 초안 (ResumeDraft)

```typescript
interface ResumeDraft {
  generatedAt: string;
  analysisMetadata: {
    period: { start: string; end: string };
    sessionsAnalyzed: number;
    achievementsFound: number;
    groupsCreated: number;
  };

  sections: {
    summary: string;           // 한줄 요약
    achievements: DraftItem[]; // 주요 성과
    techStack: string[];       // 사용 기술
    nextSteps: string[];       // 검토 항목
  };
}

interface DraftItem {
  title: string;
  period: string;
  bullets: string[];     // Reference 패턴 적용된 문장
  techStack: string[];
  relatedSessions: number;
  needsReview: boolean;  // 정량적 수치 누락 시 true
  reviewHints?: string[];  // 보완 필요 항목
}
```

---

## 3. 처리 흐름

### 3.1 전체 아키텍처

```
┌─────────────────────────────────────────────────────────────────────────┐
│ /resume-ref generate --from-sessions                                    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Step 1: 세션 데이터 수집                                                 │
│                                                                         │
│   claude-mem MCP                                                        │
│   ├── search(type="🟣", dateStart, dateEnd)  → feature observations    │
│   ├── search(type="🔴", dateStart, dateEnd)  → bugfix observations     │
│   ├── search(type="⚖️", dateStart, dateEnd)  → decision observations   │
│   └── search(type="✅", dateStart, dateEnd)  → change observations     │
│                                                                         │
│   결과: Observation[] (ID, title, type, files, date)                   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Step 2: 이력서 적합성 필터링                                              │
│                                                                         │
│   필터 조건:                                                             │
│   ├── 타입: 🟣 feature, 🔴 bugfix, ⚖️ decision, ✅ change              │
│   ├── 키워드: 구현, 개발, 최적화, 설계, 마이그레이션, 자동화 등            │
│   └── 제외: 단순 조회, 질문, 리서치만 한 세션                             │
│                                                                         │
│   결과: Achievement[] (적합한 성과만)                                    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Step 3: 연관성 분석 & 그룹핑                                              │
│                                                                         │
│   연관 점수 계산:                                                        │
│   ├── 파일 경로 공유 (0.4) - 같은 폴더/파일 다룸                          │
│   ├── 키워드 유사도 (0.3) - 제목/설명 키워드 일치                         │
│   ├── 시간 근접성 (0.2) - 연속 날짜 작업                                  │
│   └── 명시적 연결 (0.1) - 이전 작업 언급                                  │
│                                                                         │
│   그룹핑 (threshold >= 0.5):                                            │
│   ├── Union-Find로 연결된 성과 그룹화                                    │
│   └── 각 그룹에 대표 제목 생성                                           │
│                                                                         │
│   결과: AchievementGroup[]                                              │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Step 4: Reference 패턴 적용                                              │
│                                                                         │
│   Reference 문서 로드:                                                   │
│   ├── sentence-patterns.md → 문장 구조 템플릿                           │
│   ├── action-verbs.md → 약한 동사 → 강한 동사 변환                      │
│   └── metrics-examples.md → 정량화 표현 패턴                            │
│                                                                         │
│   변환 예시:                                                             │
│   "resume-ref 스킬 구현 완료"                                            │
│   → "Claude Code 기반 이력서 자동 생성 스킬을 설계/구현하여              │
│      개발자 이력서 작성 효율화"                                          │
│                                                                         │
│   결과: DraftItem[] (패턴 적용된 문장)                                   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Step 5: 대화형 보완 (선택적)                                              │
│                                                                         │
│   정량적 수치 누락 시 AskUserQuestion:                                   │
│   ├── "이 작업의 정량적 성과가 있나요?"                                  │
│   ├── "작업 시간/비용 절감 효과는?"                                      │
│   └── "팀/비즈니스 임팩트는?"                                           │
│                                                                         │
│   사용자 응답 반영하여 문장 보완                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Step 6: 초안 파일 생성                                                   │
│                                                                         │
│   출력 경로: ./resume-drafts/session-analysis-YYYY-MM-DD.md             │
│                                                                         │
│   파일 구조:                                                             │
│   ├── 메타 정보 (분석 기간, 세션 수, 성과 수)                            │
│   ├── 주요 성과 (그룹별)                                                │
│   ├── 기술 스택 요약                                                    │
│   └── 다음 단계 (검토 항목)                                             │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. 상세 알고리즘

### 4.1 이력서 적합성 필터링

```
function filterForResume(observations: Observation[]): Achievement[] {
  const RESUME_KEYWORDS = [
    // 개발/구현
    '구현', '개발', '설계', '구축', '도입', '적용',
    // 개선/최적화
    '최적화', '개선', '리팩토링', '고도화',
    // 마이그레이션
    '마이그레이션', '전환', '이관',
    // 자동화/인프라
    '자동화', 'CI/CD', '파이프라인', '배포',
    // 문서화
    '문서화', '가이드', '스킬'
  ];

  const EXCLUDE_KEYWORDS = [
    '조회', '확인', '검색', '질문', '리서치', '탐색'
  ];

  return observations.filter(obs => {
    // 타입 체크
    const validTypes = ['🟣', '🔴', '⚖️', '✅'];
    if (!validTypes.some(t => obs.type.includes(t))) return false;

    // 키워드 체크
    const text = obs.title + ' ' + obs.description;
    const hasResumeKeyword = RESUME_KEYWORDS.some(k => text.includes(k));
    const hasExcludeKeyword = EXCLUDE_KEYWORDS.some(k => text.includes(k));

    return hasResumeKeyword && !hasExcludeKeyword;
  }).map(obs => toAchievement(obs));
}
```

### 4.2 연관 점수 계산

```
function calculateRelationScore(a: Achievement, b: Achievement): number {
  let score = 0;

  // 1. 파일 경로 공유 (0.4)
  const sharedFiles = a.files.filter(f =>
    b.files.some(bf =>
      bf.startsWith(f.split('/').slice(0, -1).join('/')) ||
      f.startsWith(bf.split('/').slice(0, -1).join('/'))
    )
  );
  if (sharedFiles.length > 0) {
    score += 0.4 * Math.min(sharedFiles.length / Math.max(a.files.length, b.files.length), 1);
  }

  // 2. 키워드 유사도 (0.3)
  const aWords = extractKeywords(a.title + ' ' + a.description);
  const bWords = extractKeywords(b.title + ' ' + b.description);
  const commonWords = aWords.filter(w => bWords.includes(w));
  if (commonWords.length > 0) {
    score += 0.3 * (commonWords.length / Math.max(aWords.length, bWords.length));
  }

  // 3. 시간 근접성 (0.2)
  const daysDiff = Math.abs(daysBetween(a.date, b.date));
  if (daysDiff <= 1) score += 0.2;
  else if (daysDiff <= 3) score += 0.15;
  else if (daysDiff <= 7) score += 0.1;

  // 4. 명시적 연결 (0.1)
  // b의 설명에 a의 제목 키워드가 언급되면
  if (bWords.some(w => a.title.includes(w))) {
    score += 0.1;
  }

  return score;
}
```

### 4.3 그룹핑 (Union-Find)

```
function groupAchievements(achievements: Achievement[], threshold = 0.5): AchievementGroup[] {
  const n = achievements.length;
  const parent = achievements.map((_, i) => i);

  function find(x: number): number {
    if (parent[x] !== x) parent[x] = find(parent[x]);
    return parent[x];
  }

  function union(x: number, y: number): void {
    parent[find(x)] = find(y);
  }

  // 점수 >= threshold 인 쌍 연결
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const score = calculateRelationScore(achievements[i], achievements[j]);
      if (score >= threshold) {
        union(i, j);
      }
    }
  }

  // 그룹별 취합
  const groups = new Map<number, Achievement[]>();
  for (let i = 0; i < n; i++) {
    const root = find(i);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root)!.push(achievements[i]);
  }

  return Array.from(groups.values()).map(items => ({
    id: generateId(),
    title: generateGroupTitle(items),
    period: {
      start: minDate(items.map(i => i.date)),
      end: maxDate(items.map(i => i.date))
    },
    achievements: items,
    totalSessions: items.length,
    techStack: extractTechStack(items),
    summary: generateSummary(items)
  }));
}
```

### 4.4 Reference 패턴 적용

```
function applyReferencePatterns(achievement: Achievement): string[] {
  // Reference 문서 로드
  const patterns = loadPatterns('sentence-patterns.md');
  const verbs = loadVerbs('action-verbs.md');
  const metrics = loadMetrics('metrics-examples.md');

  const bullets: string[] = [];

  // 1. 기본 문장 생성 (패턴 적용)
  // 패턴: [동사] + [대상] + [방법] + [결과]
  let sentence = achievement.title;

  // 2. 약한 동사 → 강한 동사 변환
  for (const [weak, strong] of Object.entries(verbs.weakToStrong)) {
    sentence = sentence.replace(weak, strong);
  }

  // 3. 정량적 수치가 있으면 추가
  if (achievement.metrics && achievement.metrics.length > 0) {
    sentence += `, ${achievement.metrics[0].context}`;
  }

  bullets.push(sentence);

  // 4. 추가 상세 정보
  if (achievement.files.length > 0) {
    const mainPath = extractMainPath(achievement.files);
    bullets.push(`${mainPath} 모듈 중심으로 작업 수행`);
  }

  return bullets;
}
```

---

## 5. SKILL.md 확장

### 5.1 추가할 Case 정의

```markdown
### Case 7: `generate --from-sessions` - 세션 기반 생성

**Step 1**: 분석 기간 파싱
- `--since`: 시작 날짜
- `--days`: 최근 N일 (기본 30)
- `--project`: 프로젝트 필터

**Step 2**: claude-mem에서 세션 데이터 수집
- search(type, dateStart, dateEnd) 호출
- 타입별 병렬 조회: 🟣 feature, 🔴 bugfix, ⚖️ decision, ✅ change

**Step 3**: 이력서 적합성 필터링
- 키워드 매칭으로 적합한 성과만 추출
- 단순 조회/질문 세션 제외

**Step 4**: 연관성 분석 & 그룹핑
- 파일 경로, 키워드, 시간 기반 연관 점수 계산
- threshold >= 0.5 그룹핑

**Step 5**: Reference 패턴 적용
- sentence-patterns.md, action-verbs.md 적용
- 정량적 수치 추출 및 추가

**Step 6**: 대화형 보완 (선택)
- 정량적 수치 누락 시 AskUserQuestion으로 질문
- 사용자 응답 반영

**Step 7**: 초안 파일 생성
- 출력: `./resume-drafts/session-analysis-YYYY-MM-DD.md`
```

### 5.2 에러 처리 추가

| 상황 | 메시지 |
|------|--------|
| claude-mem 미연결 | ⚠️ claude-mem MCP가 연결되어 있지 않습니다. |
| 세션 데이터 없음 | ⚠️ 분석 기간 내 세션 데이터가 없습니다. |
| 적합한 성과 없음 | ⚠️ 이력서에 작성할 만한 성과를 찾지 못했습니다. |

---

## 6. 출력 형식

### 6.1 초안 파일 템플릿

```markdown
# 이력서 초안 (세션 분석 기반)

> 생성일: {{generatedAt}}
> 분석 기간: {{period.start}} ~ {{period.end}}
> 분석 세션: {{sessionsAnalyzed}}개
> 식별된 성과: {{achievementsFound}}개 ({{groupsCreated}}개 그룹)

---

## 주요 성과

{{#each groups}}
### {{index}}. {{title}}
**기간**: {{period.start}} ~ {{period.end}}
**관련 세션**: {{totalSessions}}개

{{#each bullets}}
- {{this}}
{{/each}}

**기술 스택**: {{techStack}}

{{#if needsReview}}
> 💡 **보완 권장**: {{reviewHints}}
{{/if}}

---
{{/each}}

## 기술 스택 요약

{{techStackSummary}}

---

## 다음 단계

1. [ ] 각 성과의 정량적 수치 보완
2. [ ] 약한 표현 → 강한 표현 재검토
3. [ ] 실제 이력서에 반영

---

> 이 초안은 Claude Code 세션 분석을 기반으로 자동 생성되었습니다.
> Reference 패턴이 적용되었으나, 최종 검토 후 사용하세요.
```

---

## 7. 구현 체크리스트

### Phase 1: MVP (기본 세션 분석)
- [ ] SKILL.md에 `generate --from-sessions` Case 추가
- [ ] claude-mem search 호출 로직
- [ ] 이력서 적합성 필터링
- [ ] 기본 초안 생성 (그룹핑 없이)

### Phase 2: 연관성 분석
- [ ] 연관 점수 계산 함수
- [ ] Union-Find 그룹핑
- [ ] 그룹 대표 제목 생성

### Phase 3: Reference 패턴 적용
- [ ] Reference 문서 로드
- [ ] 약한 동사 → 강한 동사 변환
- [ ] 정량적 수치 추출 및 적용

### Phase 4: 대화형 보완
- [ ] 정량적 수치 누락 감지
- [ ] AskUserQuestion으로 보완 질문
- [ ] 사용자 응답 반영

---

## 8. 테스트 시나리오

| 시나리오 | 입력 | 예상 결과 |
|----------|------|-----------|
| 기본 실행 | `/resume-ref generate --from-sessions` | 최근 30일 분석, 초안 생성 |
| 기간 지정 | `--since="2026-01-01"` | 해당 날짜 이후만 분석 |
| 프로젝트 필터 | `--project="dev-assistant"` | 해당 프로젝트만 |
| 세션 없음 | 빈 기간 | 에러 메시지 |
| 그룹핑 테스트 | 연관 세션 3개 | 1개 그룹으로 통합 |

---

생성일: 2026-02-04
상태: Ready for Implementation
