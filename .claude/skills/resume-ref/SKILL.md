# resume-ref

이력서 문장 패턴 참고 및 자동 생성 스킬

## 사용법

```bash
# Reference 문서 관리
/resume-ref analyze           # Rallit 이력서 분석 → Reference 생성 (수동)

# Reference 문서 보기
/resume-ref patterns          # 문장 패턴 보기
/resume-ref verbs             # 동사 사전 보기
/resume-ref metrics           # 정량적 성과 표현 보기

# 이력서 생성
/resume-ref generate          # 대화형 이력서 생성
/resume-ref generate --from-git   # Git 커밋 기반 생성
/resume-ref generate --from-sessions   # 세션 기반 생성

# 기존 이력서 개선
/resume-ref improve <path>    # 문장 개선 제안
```

## 실행 단계

### 인자 파싱

- `analyze`: Rallit 이력서 병렬 분석 → Reference 생성 (수동)
- `patterns`: sentence-patterns.md 내용 출력
- `verbs`: action-verbs.md 내용 출력
- `metrics`: metrics-examples.md 내용 출력
- `generate`: 대화형 이력서 생성
- `generate --from-git`: Git 기반 생성
- `generate --from-sessions`: 세션 기반 생성
- `improve <path>`: 기존 이력서 개선

---

### Case 0: `analyze` - Reference 문서 생성 (수동)

Rallit 인기 이력서를 분석하여 Reference 문서를 생성합니다.

**주의: 이 작업은 수동으로만 실행합니다.**

**실행 방법**:
1. 사용자가 `/resume-ref analyze` 요청
2. 메인 Claude가 Rallit URL 5개 수집 (인기순 개발자 이력서)
3. 서브에이전트 병렬 호출 없이, 단순화된 분석 진행:
   - URL을 하나씩 읽고 패턴 추출
   - 공통 패턴 정리
4. Reference 문서 4개 생성/갱신:
   - `sentence-patterns.md`
   - `action-verbs.md`
   - `metrics-examples.md`
   - `section-guidelines.md`

**Reference 갱신 안내**:
```markdown
Reference 문서가 오래되었거나 없다면:
1. /resume-ref analyze 실행
2. Rallit 이력서 5개 분석
3. Reference 문서 자동 생성
```

---

### Case 1: `patterns` - 문장 패턴 보기

Reference 폴더의 sentence-patterns.md 파일을 읽어서 출력합니다.

```bash
SKILL_DIR="$(dirname "$0")"
cat "$SKILL_DIR/reference/sentence-patterns.md"
```

---

### Case 2: `verbs` - 동사 사전 보기

```bash
SKILL_DIR="$(dirname "$0")"
cat "$SKILL_DIR/reference/action-verbs.md"
```

---

### Case 3: `metrics` - 정량적 성과 표현 보기

```bash
SKILL_DIR="$(dirname "$0")"
cat "$SKILL_DIR/reference/metrics-examples.md"
```

---

### Case 4: `generate` - 대화형 이력서 생성

**Step 1**: 기본 정보 수집 (AskUserQuestion)
```
Q: 직군이 무엇인가요?
   - 백엔드 개발자
   - 프론트엔드 개발자
   - 풀스택 개발자
   - 데브옵스/인프라

Q: 경력 연차는?
   - 1~3년 (주니어)
   - 4~7년 (미드레벨)
   - 8년 이상 (시니어)

Q: 주력 기술 스택은? (자유 입력)
```

**Step 2**: 경력/프로젝트 정보 수집
```
Q: 현재/이전 회사와 담당 업무를 알려주세요.
   (자유 형식으로 입력, AI가 구조화)

Q: 가장 임팩트 있었던 프로젝트나 성과가 있다면?
```

**Step 3**: Reference 문서 참조하여 문장 생성
- `sentence-patterns.md` 패턴 적용
- `action-verbs.md` 강한 동사 사용
- `metrics-examples.md` 정량화 제안

**Step 4**: 이력서 md 파일 생성
```bash
OUTPUT_FILE="./resume-draft-$(date +%Y-%m-%d).md"
```

---

### Case 5: `generate --from-git` - Git 기반 생성

**Step 1**: Git 히스토리 수집
```bash
# 최근 6개월 커밋
git log --oneline --since="6 months ago" --author="$(git config user.name)"

# 커밋 메시지 분석
# feat: → 새 기능 개발
# fix: → 버그 수정/개선
# refactor: → 코드 품질 개선
# perf: → 성능 최적화
```

**Step 2**: 프로젝트별 그룹핑
- 저장소명으로 프로젝트 분류
- 주요 성과 추출

**Step 3**: Reference 패턴 적용
```
입력: "fix: 정산 쿼리 N+1 문제 해결"
출력: "정산 쿼리의 N+1 문제를 Batch Fetching으로 해결하여 API 응답 시간 60% 단축"
```

**Step 4**: 이력서 md 파일 생성

---

### Case 6: `improve <path>` - 이력서 개선

**Step 1**: 기존 이력서 파싱
```bash
FILE_PATH="$1"
if [[ ! -f "$FILE_PATH" ]]; then
  echo "❌ 파일을 찾을 수 없습니다: $FILE_PATH"
  exit 1
fi
```

**Step 2**: 문장 분석
- 약한 동사 감지 (만들었다, 했다, 고쳤다)
- 정량적 성과 누락 감지
- 패턴 일치 여부 확인

**Step 3**: 개선 제안 출력
```markdown
## 이력서 개선 제안

### 1. 자기소개 섹션

| 현재 | 개선안 | 이유 |
|------|--------|------|
| "로그인 기능을 개발했습니다" | "JWT 기반 인증 시스템을 설계/구축" | 약한 동사 → 강한 동사 |

### 2. 정량적 성과 추가 권장
- "API 개발" → "일 100만 요청 처리하는 API 개발"
```

---

## Reference 문서 위치

```
.claude/skills/resume-ref/
├── SKILL.md (이 파일)
└── reference/
    ├── sentence-patterns.md    # 문장 패턴 모음
    ├── action-verbs.md         # 동사/표현 사전
    ├── metrics-examples.md     # 정량적 성과 표현
    └── section-guidelines.md   # 섹션별 가이드
```

## 에러 처리

| 상황 | 메시지 |
|------|--------|
| Reference 없음 | ⚠️ Reference 문서가 없습니다. 먼저 분석을 실행해주세요. |
| Git 없음 | ⚠️ Git 저장소가 아닙니다. --from-git 옵션을 사용할 수 없습니다. |
| 파일 없음 | ❌ 파일을 찾을 수 없습니다: {path} |

## 예시

```bash
# 문장 패턴 참고
/resume-ref patterns

# 대화형으로 이력서 생성
/resume-ref generate

# Git 커밋 기반 이력서 생성
/resume-ref generate --from-git

# 기존 이력서 개선
/resume-ref improve ~/resume.md
```
