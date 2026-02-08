# resume-publish

이력서 초안을 resume 프로젝트에 동기화하고 PDF 빌드를 트리거하는 스킬

## 사용법

```bash
/resume-publish sync      # resume-final.md -> resume 프로젝트 반영
/resume-publish diff      # 현재 이력서 vs 초안 차이 확인
/resume-publish push      # resume 프로젝트 커밋 + 푸시 (PDF 빌드 트리거)
/resume-publish status    # resume 프로젝트 현재 상태 확인
```

## 경로 설정

```
SOURCE: resume-drafts/resume-final.md          # dev-assistant 프로젝트 내 최종 이력서
TARGET: ~/Works/personal/resume/resume.md      # resume 프로젝트의 이력서 파일
RESUME_PROJECT: ~/Works/personal/resume        # resume 프로젝트 루트
```

## 실행 단계

### 인자 파싱

- `sync`: 이력서 동기화
- `diff`: 차이 확인
- `push`: 커밋 + 푸시
- `status`: 프로젝트 상태 확인

---

### Case 1: `sync` - 이력서 동기화

**Step 1**: 소스 파일 확인

```bash
SOURCE="resume-drafts/resume-final.md"
if [[ ! -f "$SOURCE" ]]; then
  echo "파일을 찾을 수 없습니다: $SOURCE"
  exit 1
fi
```

**Step 2**: resume-ref Reference 패턴 적용하여 최종 검토

1. `.claude/skills/resume-ref/reference/` 디렉토리의 Reference 문서 로드:
   - `action-verbs.md`: 강한 동사 사전
   - `sentence-patterns.md`: 문장 패턴
   - `metrics-examples.md`: 정량적 성과 표현

2. resume-final.md 내용을 Reference 기준으로 검토:
   - 약한 동사 사용 여부 확인
   - 정량적 성과 포함 여부 확인
   - 문장 패턴 적용 여부 확인

3. 검토 결과를 사용자에게 보여주고, 개선 제안이 있으면 표시

**Step 3**: 타겟 파일에 반영

```bash
TARGET="$HOME/Works/personal/resume/resume.md"
cp "$SOURCE" "$TARGET"
```

**Step 4**: 결과 출력

```
sync 완료
  소스: resume-drafts/resume-final.md
  타겟: ~/Works/personal/resume/resume.md
  상태: 반영 완료

다음 단계: /resume-publish diff 로 변경사항 확인
```

---

### Case 2: `diff` - 차이 확인

**Step 1**: 두 파일 비교

```bash
SOURCE="resume-drafts/resume-final.md"
TARGET="$HOME/Works/personal/resume/resume.md"
```

**Step 2**: diff 실행

```bash
diff "$SOURCE" "$TARGET"
```

또는 resume 프로젝트의 git diff 확인:

```bash
cd ~/Works/personal/resume && git diff resume.md
```

**Step 3**: 변경 사항 요약 출력

섹션별로 변경된 내용을 요약하여 출력:

```markdown
## 변경 사항 요약

### 추가된 항목
- ...

### 수정된 항목
- ...

### 삭제된 항목
- ...
```

---

### Case 3: `push` - 커밋 + 푸시

**Step 1**: resume 프로젝트로 이동

```bash
cd ~/Works/personal/resume
```

**Step 2**: 변경 사항 확인

```bash
git status
git diff --stat
```

**Step 3**: 사용자 확인 요청

변경 사항을 보여주고 커밋 메시지를 제안:

```
커밋 메시지 제안: "docs: 이력서 업데이트 (YYYY-MM-DD)"
이 내용으로 커밋하고 푸시할까요?
```

**Step 4**: 커밋 + 푸시

사용자 승인 후:

```bash
git add resume.md
git commit -m "docs: 이력서 업데이트 (YYYY-MM-DD)"
git push origin main
```

**Step 5**: GitHub Actions 빌드 상태 안내

```
push 완료
  커밋: abc1234
  브랜치: main
  GitHub Actions에서 PDF 자동 빌드가 시작됩니다.
  확인: https://github.com/{user}/{repo}/actions
```

---

### Case 4: `status` - 프로젝트 상태 확인

**Step 1**: resume 프로젝트 상태 확인

```bash
cd ~/Works/personal/resume

# git 상태
git status

# 최근 커밋
git log --oneline -5

# 원격 동기화 상태
git fetch origin
git status -sb
```

**Step 2**: 결과 출력

```markdown
## Resume 프로젝트 상태

- 브랜치: main
- 상태: clean / 변경사항 있음
- 최근 커밋: {hash} {message} ({date})
- 원격 동기화: up-to-date / behind / ahead
```

---

## 에러 처리

| 상황 | 메시지 |
|------|--------|
| resume-final.md 없음 | 소스 파일을 찾을 수 없습니다. 먼저 이력서 초안을 생성하세요. |
| resume 프로젝트 없음 | ~/Works/personal/resume 프로젝트를 찾을 수 없습니다. |
| git 변경사항 없음 | 변경사항이 없습니다. sync를 먼저 실행하세요. |
| push 실패 | 원격 저장소에 push할 수 없습니다. 네트워크를 확인하세요. |

## 예시

```bash
# 전체 워크플로우
/resume-publish status    # 1. 현재 상태 확인
/resume-publish sync      # 2. 이력서 동기화
/resume-publish diff      # 3. 변경사항 확인
/resume-publish push      # 4. 커밋 + 푸시 (PDF 빌드)
```
