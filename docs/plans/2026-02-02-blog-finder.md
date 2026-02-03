# blog-finder 스킬 구현 계획

**작성일**: 2026-02-02

## 1. 문제 정의

### AS-IS
- Claude Code 세션에서 유의미한 작업을 했지만, 블로그 소재로 정리하지 않고 넘어감
- 어떤 세션이 블로그 감인지 판단하기 어려움
- 블로그 초안 파일이 루트에 산발적으로 존재 (`blog-draft-*.md`)
- 초안 작성 시 매번 스타일 가이드를 수동으로 참고해야 함

### TO-BE
- 세션을 분석하여 블로그 소재 여부를 자동 판단
- 유망한 세션에서 블로그 초안까지 자동 생성
- 블로그 초안을 한 폴더에서 체계적으로 관리
- 기존 `blog-writing-guide.md` 스타일에 맞춘 초안 생성

---

## 2. 블로그 소재 판단 기준

### 블로그 감이 되는 세션 특성

| 유형 | 설명 | 예시 키워드/패턴 |
|------|------|------------------|
| **삽질/회고** | 실패 후 방향 전환, 오버엔지니어링 | "포기", "결국", "삽질", 2회 이상 접근법 변경 |
| **자동화** | 반복 작업을 자동화한 경험 | "자동화", "스킬", "스크립트", Slack/Jira 연동 |
| **새 기술 적용** | TDD, DDD, 패턴 적용 | "TDD", "리팩토링", "도메인 모델", "패턴" |
| **문제 해결** | 복잡한 버그 수정, 디버깅 | "원인", "해결", "디버깅", 에러 메시지 포함 |
| **아키텍처 결정** | 설계 선택, 트레이드오프 | "설계", "아키텍처", "vs", 옵션 비교 |

### 블로그 감이 아닌 세션

- 단순 설정 변경 (린트 수정, 패키지 업데이트)
- 문서 작성만 한 세션
- 짧은 질의응답 세션 (프롬프트 3개 미만)
- 비즈니스 로직 구현 (회사 기밀 관련)

### 점수화 시스템 (10점 만점)

```
흥미도(0-3):     독자가 공감할 만한 상황인가?
학습가치(0-3):   다른 개발자에게 도움되는 내용인가?
스토리(0-2):     시행착오/여정이 있는가?
적용가능성(0-2): 따라할 수 있는 내용인가?
```

- **7점 이상**: 블로그 소재로 적합
- **4-6점**: 조건부 적합 (각색 필요)
- **3점 이하**: 부적합

---

## 3. 폴더 구조 설계

```
dev-assistant/
├── .claude/
│   ├── blog-writing-guide.md          # 기존 스타일 가이드
│   └── skills/
│       └── blog-finder/
│           ├── SKILL.md               # 스킬 정의 (메인)
│           ├── SKILL.local.md         # 로컬 설정 (git 제외)
│           ├── analyze-criteria.md    # 소재 판단 기준 상세
│           └── draft-template.md      # 초안 템플릿
│
├── blog-drafts/                       # 블로그 초안 폴더 (NEW)
│   ├── .gitkeep                       # 폴더 유지용
│   └── YYYY-MM-DD-{주제}.md           # 생성된 초안들
│
└── .gitignore                         # blog-drafts/*.md 추가
```

### .gitignore 추가 내용

```gitignore
# Blog drafts (개인 초안, git 제외)
blog-drafts/*.md
!blog-drafts/.gitkeep
```

---

## 4. 커맨드 설계

### 4.1 `/blog find [--days N]`

**목적**: 최근 세션에서 블로그 소재 후보 찾기

**동작**:
1. 최근 N일(기본 7일) 세션 파일 목록 조회
2. 각 세션을 서브에이전트로 병렬 분석
3. 점수 기반 소재 후보 목록 출력

**출력 예시**:
```markdown
## 블로그 소재 후보 (최근 7일)

| 순위 | 점수 | 날짜 | 프로젝트 | 소재 요약 |
|------|------|------|----------|-----------|
| 1 | 9/10 | 01-30 | dentbird | E2E 테스트 자동화 - Qase 연동 |
| 2 | 7/10 | 01-28 | dev-assistant | standup 스킬 삽질기 |
| 3 | 6/10 | 01-25 | solutions | Docker EKS 오버엔지니어링 |

상세 분석을 원하면: /blog analyze <세션ID>
초안 생성을 원하면: /blog draft <세션ID>
```

---

### 4.2 `/blog analyze <SESSION_ID>`

**목적**: 특정 세션의 블로그 소재 가치 상세 분석

**동작**:
1. 세션에서 프롬프트 추출 (claude-coach의 extract 로직 활용)
2. 세션 흐름 분석 (시작 -> 문제 -> 해결 -> 결론)
3. 블로그 포인트 추출

**출력 예시**:
```markdown
## 세션 분석: E2E 테스트 자동화

### 점수: 9/10
- 흥미도: 3/3 - 많은 팀이 겪는 E2E 관리 문제
- 학습가치: 3/3 - Claude 스킬 활용법 공유
- 스토리: 2/2 - 수동 -> 자동화 전환 여정
- 적용가능성: 1/2 - 특정 도구(Qase) 의존

### 핵심 포인트
1. 문제 정의: 30분 -> 5분으로 단축
2. 해결책: MCP 서버 + 스킬 조합
3. 인사이트: TC 상태 관리의 중요성

### 추천 제목
- "E2E 테스트, 아직도 수동으로 관리하고 있나요?"
- "Claude Code 스킬로 테스트 자동화한 이야기"

초안 생성: /blog draft 2026-01-30-dentbird
```

---

### 4.3 `/blog draft <SESSION_ID> [--title "제목"]`

**목적**: 세션 기반 블로그 초안 생성

**동작**:
1. 세션 분석 (analyze와 동일)
2. `blog-writing-guide.md` 스타일에 맞춰 초안 생성
3. `blog-drafts/YYYY-MM-DD-{주제}.md`에 저장

**생성 규칙**:
- 글 유형 자동 판단 (삽질기/자동화/개념설명)
- 이모지 헤딩 자동 적용
- TL;DR 자동 생성
- 코드 예시 포함 (세션에서 추출)

**출력 예시**:
```markdown
초안 생성 완료!

파일: blog-drafts/2026-01-30-e2e-automation.md
유형: 기술 실용 글
글자수: 약 2,500자

다음 단계:
1. 초안 검토: Read blog-drafts/2026-01-30-e2e-automation.md
2. 발행: /velog-publish blog-drafts/2026-01-30-e2e-automation.md
```

---

### 4.4 `/blog list`

**목적**: 현재 초안 목록 확인

**동작**:
1. `blog-drafts/` 폴더 스캔
2. 각 파일의 제목, 상태, 생성일 표시

**출력 예시**:
```markdown
## 블로그 초안 목록

| 파일 | 제목 | 생성일 | 글자수 |
|------|------|--------|--------|
| e2e-automation.md | E2E 테스트 자동화 | 01-30 | 2,500자 |
| standup-skill.md | 스탠드업 자동화 | 01-25 | 1,800자 |

발행: /velog-publish blog-drafts/<파일명>
```

---

## 5. 파일별 역할 및 내용 개요

### 5.1 SKILL.md (메인 스킬 정의)

```markdown
---
name: blog-finder
description: Claude Code 세션을 분석하여 블로그 소재를 찾고 초안 생성
---

# blog-finder

## Commands
- find: 소재 후보 찾기
- analyze: 특정 세션 상세 분석
- draft: 초안 생성
- list: 초안 목록

## Configuration
- Sessions Directory: ~/.claude/projects
- Drafts Directory: ./blog-drafts

## 실행 단계 (각 커맨드별)
...
```

### 5.2 analyze-criteria.md (분석 기준)

```markdown
# 블로그 소재 분석 기준

## 점수화 시스템
...

## 세션 유형 판단
...

## 프롬프트 패턴 분석
...
```

### 5.3 draft-template.md (초안 템플릿)

```markdown
# 초안 템플릿: {글_유형}

## 삽질기/회고 글
{인용구 도입부}
{시작: 계획/동기}
{n일차: 시도들}
{현타/전환점}
{배운 것들}
{TL;DR}

## 기술 실용 글
{문제 상황}
{해결책 소개}
{구현 상세}
{결과}
```

---

## 6. 구현 순서

### Phase 1: 기반 구조 (Day 1)

```
1. [ ] blog-drafts/ 폴더 생성 및 .gitignore 업데이트
2. [ ] blog-finder 스킬 폴더 구조 생성
3. [ ] SKILL.md 기본 틀 작성 (커맨드 정의)
4. [ ] analyze-criteria.md 작성 (판단 기준)
```

### Phase 2: find 커맨드 (Day 2)

```
5. [ ] 세션 파일 목록 조회 로직 (claude-coach에서 차용)
6. [ ] 서브에이전트 분석 프롬프트 작성
7. [ ] 점수 집계 및 출력 형식 정의
8. [ ] find 커맨드 테스트
```

### Phase 3: analyze/draft 커맨드 (Day 3)

```
9. [ ] analyze 커맨드 상세 로직
10. [ ] draft-template.md 작성
11. [ ] draft 커맨드 구현 (blog-writing-guide.md 연동)
12. [ ] list 커맨드 구현
```

### Phase 4: 통합 테스트 (Day 4)

```
13. [ ] 실제 세션으로 find -> analyze -> draft 플로우 테스트
14. [ ] velog-publish와 연동 테스트
15. [ ] 엣지 케이스 처리 (빈 세션, 짧은 세션 등)
```

---

## 7. 완료 조건 (Definition of Done)

### 기능 요건
- [ ] `/blog find` - 최근 세션에서 소재 후보 3개 이상 추출
- [ ] `/blog analyze` - 특정 세션 점수화 및 핵심 포인트 추출
- [ ] `/blog draft` - blog-writing-guide.md 스타일에 맞는 초안 생성
- [ ] `/blog list` - 현재 초안 목록 표시

### 비기능 요건
- [ ] blog-drafts/*.md가 git에 포함되지 않음
- [ ] 세션 분석 시 서브에이전트 사용 (메인 컨텍스트 보호)
- [ ] 기존 스킬(claude-coach, velog-publish)과 일관된 구조

### 통합 테스트
- [ ] 실제 세션 1개로 find -> analyze -> draft 전체 플로우 성공
- [ ] 생성된 초안을 `/velog-publish`로 발행 가능

---

## 8. 참고 자료

### 기존 스킬 참조
- `/Users/kimjin-wan/Works/devops/dentbird-solutions/.claude/skills/claude-coach/` - 세션 분석 로직
- `/Users/kimjin-wan/Works/personal/dev-assistant/.claude/skills/velog-publish/` - 발행 연동
- `/Users/kimjin-wan/Works/personal/dev-assistant/.claude/blog-writing-guide.md` - 스타일 가이드

### 세션 파일 위치
- `~/.claude/projects/` - Claude Code 세션 JSONL 파일

### 기존 블로그 초안 (이전 형태)
- `/Users/kimjin-wan/Works/personal/dev-assistant/blog-draft-*.md` - 마이그레이션 대상

---

## 다음 단계

사용자 승인 후 executor 에이전트로 구현을 시작합니다.

**질문 사항:**
1. 블로그 초안 폴더를 `blog-drafts/`로 할지, 다른 이름으로 할지?
2. 기존 `blog-draft-*.md` 파일들을 새 폴더로 마이그레이션할지?
3. 회사 관련 내용 필터링이 필요한지? (특정 프로젝트 제외)
