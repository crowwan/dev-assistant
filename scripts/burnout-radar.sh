#!/bin/bash

# Dev Assistant - Burnout Radar 자동 실행 스크립트
# 매주 월요일 09:00에 launchd에 의해 실행됨

set -e

# 경로 설정
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_FILE="$PROJECT_DIR/logs/burnout-radar.log"

# 로그 디렉토리 생성
mkdir -p "$PROJECT_DIR/logs"

# 환경 변수 로드 (~/.zshrc에서)
if [ -f ~/.zshrc ]; then
  source ~/.zshrc 2>/dev/null || true
fi

log() {
  echo "[$(TZ=Asia/Seoul date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "=== Burnout Radar 시작 ==="

# 필수 환경 변수 체크
if [ -z "$SLACK_WEBHOOK" ]; then
  log "ERROR: SLACK_WEBHOOK 환경 변수가 설정되지 않음"
  exit 1
fi

# Claude Code 실행
log "Claude Code 실행 중..."
cd "$PROJECT_DIR"

# 스킬 파일 경로
SKILL_FILE="$PROJECT_DIR/.claude/skills/burnout-radar/SKILL.local.md"
if [ ! -f "$SKILL_FILE" ]; then
  SKILL_FILE="$PROJECT_DIR/.claude/skills/burnout-radar/SKILL.md"
fi

if [ ! -f "$SKILL_FILE" ]; then
  log "ERROR: 스킬 파일을 찾을 수 없음"
  exit 1
fi

# 스킬 내용을 프롬프트로 전달 (10분 timeout)
TIMEOUT=600

claude -p "아래 스킬을 실행해주세요.

$(cat "$SKILL_FILE")" \
  --allowedTools "Bash(git:*)" "Bash(curl:*)" "Bash(date:*)" "Bash(jq:*)" "Read" "Write" "Glob" \
  --max-turns 50 \
  >> "$LOG_FILE" 2>&1 &
CLAUDE_PID=$!

# Timeout 체크 루프
SECONDS=0
while kill -0 $CLAUDE_PID 2>/dev/null; do
  if [ $SECONDS -ge $TIMEOUT ]; then
    log "ERROR: Timeout (${TIMEOUT}s) - 프로세스 강제 종료"
    kill -9 $CLAUDE_PID 2>/dev/null
    wait $CLAUDE_PID 2>/dev/null
    RESULT=124  # timeout exit code
    break
  fi
  sleep 5
done

# 정상 종료 시 결과 코드 수집
if [ $SECONDS -lt $TIMEOUT ]; then
  wait $CLAUDE_PID 2>/dev/null
  RESULT=$?
fi

if [ $RESULT -eq 0 ]; then
  log "=== Burnout Radar 완료 ==="
else
  log "ERROR: Claude Code 실행 실패 (exit code: $RESULT)"

  # 에러 알림 전송
  curl -s -X POST "$SLACK_WEBHOOK" \
    -H "Content-Type: application/json; charset=utf-8" \
    -d '{"text":"Burnout Radar 실행 실패. 로그를 확인하세요."}' \
    >> "$LOG_FILE" 2>&1
fi

exit $RESULT
