#!/bin/bash

# Dev Assistant - Daily Summary 자동 실행 스크립트
# 매일 18:00에 launchd에 의해 실행됨

set -e

# 경로 설정
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_FILE="$PROJECT_DIR/logs/daily-summary.log"

# 로그 디렉토리 생성
mkdir -p "$PROJECT_DIR/logs"

# 환경 변수 로드 (~/.zshrc에서)
if [ -f ~/.zshrc ]; then
  source ~/.zshrc 2>/dev/null || true
fi

log() {
  echo "[$(TZ=Asia/Seoul date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "=== Daily Summary 시작 ==="

# 주말 체크
DAY_OF_WEEK=$(TZ=Asia/Seoul date +%u)
if [ "$DAY_OF_WEEK" -ge 6 ]; then
  log "주말이므로 스킵"
  exit 0
fi

# 필수 환경 변수 체크
if [ -z "$SLACK_WEBHOOK" ]; then
  log "ERROR: SLACK_WEBHOOK 환경 변수가 설정되지 않음"
  exit 1
fi

if [ -z "$JIRA_API_TOKEN" ]; then
  log "ERROR: JIRA_API_TOKEN 환경 변수가 설정되지 않음"
  exit 1
fi

# Claude Code 실행
log "Claude Code 실행 중..."
cd "$PROJECT_DIR"

# 스킬 파일 경로
SKILL_FILE="$PROJECT_DIR/.claude/skills/daily-summary/SKILL.local.md"
if [ ! -f "$SKILL_FILE" ]; then
  SKILL_FILE="$PROJECT_DIR/.claude/skills/daily-summary/SKILL.md"
fi

if [ ! -f "$SKILL_FILE" ]; then
  log "ERROR: 스킬 파일을 찾을 수 없음"
  exit 1
fi

# 스킬 내용을 프롬프트로 전달
claude -p "아래 스킬을 실행해주세요.

$(cat "$SKILL_FILE")" \
  --allowedTools "Bash(git:*)" "Bash(curl:*)" "Bash(az:*)" "Bash(jq:*)" "Read" "Write" "Glob" \
  --max-turns 50 \
  >> "$LOG_FILE" 2>&1

RESULT=$?

if [ $RESULT -eq 0 ]; then
  log "=== Daily Summary 완료 ==="
else
  log "ERROR: Claude Code 실행 실패 (exit code: $RESULT)"

  # 에러 알림 전송
  curl -s -X POST "$SLACK_WEBHOOK" \
    -H "Content-Type: application/json; charset=utf-8" \
    -d '{"text":"⚠️ Daily Summary 실행 실패. 로그를 확인하세요."}' \
    >> "$LOG_FILE" 2>&1
fi

exit $RESULT
