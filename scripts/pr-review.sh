#!/bin/bash

# Dev Assistant - PR Review 스킬 실행 스クリプト
# 수동 실행용. 필요 시 launchd에 등록해서 주기적으로 돌릴 수도 있습니다.

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_FILE="$PROJECT_DIR/logs/pr-review.log"

mkdir -p "$PROJECT_DIR/logs"

# 환경 변수 로드 (~/.zshrc)
if [ -f ~/.zshrc ]; then
  # shellcheck disable=SC1090
  source ~/.zshrc 2>/dev/null || true
fi

log() {
  echo "[$(TZ=Asia/Seoul date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# 인자 파싱: --dry-run, --pr <id>
DRY=""
PR_ARG=""
while [ $# -gt 0 ]; do
  case "$1" in
    --dry-run)
      DRY="--dry-run"; shift ;;
    --pr)
      PR_ARG="$2"; shift 2 ;;
    *)
      echo "Unknown arg: $1"; exit 2 ;;
  esac
done

# 필수 ENV 확인
if [ -z "$SLACK_WEBHOOK" ] || [ -z "$AZDO_PAT" ]; then
  log "ERROR: SLACK_WEBHOOK 또는 AZDO_PAT이 설정되지 않았습니다. ~/.zshrc를 확인하세요."
  exit 1
fi

# 스킬 파일 선택
SKILL_FILE="$PROJECT_DIR/.claude/skills/pr-review/SKILL.local.md"
if [ ! -f "$SKILL_FILE" ]; then
  SKILL_FILE="$PROJECT_DIR/.claude/skills/pr-review/SKILL.md"
fi

if [ ! -f "$SKILL_FILE" ]; then
  log "ERROR: 스킬 파일을 찾을 수 없습니다."
  exit 1
fi

log "=== PR Review 스킬 시작 (codex) ==="

# PR_ID를 프롬프트 컨텍스트에 명시
CTX=""
if [ -n "$PR_ARG" ]; then
  export PR_ID="$PR_ARG"
  CTX="\n\n[Context]\nPR_ID=$PR_ID"
fi

cd "$PROJECT_DIR"

# Codex CLI 우선 사용, 없으면 Claude로 폴백
AI_BIN=${AI_BIN:-codex}
if ! command -v "$AI_BIN" >/dev/null 2>&1; then
  if command -v claude >/dev/null 2>&1; then
    AI_BIN=claude
    log "codex 명령을 찾을 수 없어 claude로 폴백합니다. (AI_BIN=claude)"
  else
    log "ERROR: codex/claude CLI를 찾을 수 없습니다. PATH를 확인하세요."
    exit 1
  fi
fi

PROMPT="아래 스킬을 실행해주세요.$CTX\n\n$(cat "$SKILL_FILE")"

if [ "$AI_BIN" = "codex" ]; then
  "$AI_BIN" exec --full-auto -C "$PROJECT_DIR" "$PROMPT" >> "$LOG_FILE" 2>&1
else
  COMMON_FLAGS=(--allowedTools "Bash(git:*)" "Bash(curl:*)" "Bash(jq:*)" "Bash(base64:*)" "Read" "Write" "Glob" --max-turns 60)
  "$AI_BIN" -p "$PROMPT" "${COMMON_FLAGS[@]}" >> "$LOG_FILE" 2>&1
fi

RESULT=$?
if [ $RESULT -eq 0 ]; then
  log "=== PR Review 완료 ==="
else
  log "ERROR: PR Review 스킬 실행 실패 (exit code: $RESULT)"
  # 에러 알림 슬랙 전송
  curl -s -X POST "$SLACK_WEBHOOK" -H "Content-Type: application/json; charset=utf-8" \
    -d '{"text":"⚠️ PR Review 스킬 실행 실패. logs/pr-review.log 를 확인하세요."}' \
    >> "$LOG_FILE" 2>&1 || true
fi

exit $RESULT
