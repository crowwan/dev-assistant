---
name: view
description: 마크다운 문서를 새 터미널 창에서 glow로 렌더링
---

# view

마크다운 문서를 **새 터미널 창**에서 glow로 렌더링합니다.

## 사용법

```bash
/view <path>              # 새 터미널에서 파일 열기
/view --last              # 마지막 수정된 문서 열기
/view --list              # 최근 문서 목록 (Claude Code에서 표시)
```

## 실행 단계

### 인자 파싱

- `--last`: 마지막 수정된 .md 파일 열기
- `--list`: 최근 문서 목록 표시 (새 터미널 안 열음)
- 그 외: 파일 경로로 간주

---

### Case 1: `--list` 옵션

최근 7일 내 수정된 마크다운 파일 목록을 Claude Code에서 표시합니다.

```bash
find . -name "*.md" -type f -not -path "*/node_modules/*" -not -path "*/.git/*" -mtime -7 2>/dev/null | \
  xargs ls -lt 2>/dev/null | head -10
```

테이블 형식으로 출력:
```markdown
## 최근 마크다운 문서 (7일)

| # | 파일 | 수정일 |
|---|------|--------|
| 1 | docs/report.md | 2분 전 |
| 2 | README.md | 1시간 전 |
```

---

### Case 2: `--last` 옵션

가장 최근 수정된 마크다운 파일을 찾아서 새 터미널에서 엽니다.

**Step 1**: 최근 .md 파일 찾기
```bash
LAST_FILE=$(find . -name "*.md" -type f -not -path "*/node_modules/*" -not -path "*/.git/*" -mmin -60 2>/dev/null | xargs ls -t 2>/dev/null | head -1)

# 없으면 범위 확장 (최근 24시간)
if [[ -z "$LAST_FILE" ]]; then
  LAST_FILE=$(find . -name "*.md" -type f -not -path "*/node_modules/*" -not -path "*/.git/*" -mtime -1 2>/dev/null | xargs ls -t 2>/dev/null | head -1)
fi
```

**Step 2**: 찾은 파일로 Case 3 진행

---

### Case 3: 파일 경로 지정 (핵심)

**새 터미널 창**을 열고 glow로 파일을 렌더링합니다.

**Step 1**: 파일 존재 확인 및 절대 경로 변환
```bash
FILE_PATH="$1"
if [[ ! "$FILE_PATH" = /* ]]; then
  FILE_PATH="$(pwd)/$FILE_PATH"
fi

if [[ ! -f "$FILE_PATH" ]]; then
  echo "❌ 파일을 찾을 수 없습니다: $1"
  exit 1
fi
```

**Step 2**: glow 설치 확인
```bash
if ! command -v glow &> /dev/null; then
  echo "❌ glow가 설치되어 있지 않습니다."
  echo "설치: brew install glow"
  exit 1
fi
```

**Step 3**: 새 터미널 창에서 glow 실행

**macOS Terminal.app 사용 시:**
```bash
osascript <<EOF
tell application "Terminal"
  do script "glow -p '$FILE_PATH'"
  activate
end tell

tell application "System Events"
  tell process "Terminal"
    set frontmost to true
  end tell
end tell
EOF
```

**iTerm2 사용 시:**
```bash
osascript <<EOF
tell application "iTerm"
  create window with default profile
  tell current session of current window
    write text "glow -p '$FILE_PATH'"
  end tell
  activate
end tell

tell application "System Events"
  tell process "iTerm2"
    set frontmost to true
  end tell
end tell
EOF
```

**Step 4**: 결과 메시지 출력
```
✅ 새 터미널에서 문서를 열었습니다: {파일명}
```

---

## 터미널 앱 감지 로직

iTerm2가 설치되어 있으면 iTerm2 사용, 아니면 Terminal.app 사용:

```bash
if [[ -d "/Applications/iTerm.app" ]]; then
  # iTerm2 사용
else
  # Terminal.app 사용
fi
```

---

## 에러 처리

| 상황 | 메시지 |
|------|--------|
| 파일 없음 | ❌ 파일을 찾을 수 없습니다: {path} |
| glow 미설치 | ❌ glow가 설치되어 있지 않습니다. 설치: brew install glow |
| --last 결과 없음 | ❌ 최근 수정된 마크다운 파일이 없습니다 |

---

## 예시

```bash
# 특정 파일 새 터미널에서 보기
/view docs/01-plan/features/markdown-viewer.plan.md

# 마지막 수정 문서 새 터미널에서 보기
/view --last

# 최근 문서 목록 확인
/view --list
```

## 요구사항

- **필수**: glow (`brew install glow`)
- **지원 터미널**: Terminal.app, iTerm2
