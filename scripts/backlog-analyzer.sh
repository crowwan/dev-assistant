#!/bin/bash

# Dev Assistant - Backlog Analyzer 자동 실행 스크립트
# 매일 새벽 02:00에 launchd에 의해 실행됨

set -e

# 경로 설정
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_FILE="$PROJECT_DIR/logs/backlog-analyzer.log"

# 로그 디렉토리 생성
mkdir -p "$PROJECT_DIR/logs"

# 환경 변수 로드 (~/.zshrc에서)
if [ -f ~/.zshrc ]; then
  source ~/.zshrc 2>/dev/null || true
fi

log() {
  echo "[$(TZ=Asia/Seoul date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "=== Backlog Analyzer 시작 ==="

# 주말 체크 (선택사항 - 주말에도 실행하려면 이 블록 제거)
# DAY_OF_WEEK=$(TZ=Asia/Seoul date +%u)
# if [ "$DAY_OF_WEEK" -ge 6 ]; then
#   log "주말이므로 스킵"
#   exit 0
# fi

# 필수 환경 변수 체크
if [ -z "$SLACK_WEBHOOK" ]; then
  log "ERROR: SLACK_WEBHOOK 환경 변수가 설정되지 않음"
  exit 1
fi

if [ -z "$JIRA_API_TOKEN" ]; then
  log "ERROR: JIRA_API_TOKEN 환경 변수가 설정되지 않음"
  exit 1
fi

if [ -z "$JIRA_EMAIL" ]; then
  log "ERROR: JIRA_EMAIL 환경 변수가 설정되지 않음"
  exit 1
fi

# Claude Code 실행
log "Claude Code 실행 중..."
cd "$PROJECT_DIR"

# 스킬 파일 경로
SKILL_FILE="$PROJECT_DIR/.claude/skills/backlog-analyzer/SKILL.local.md"
if [ ! -f "$SKILL_FILE" ]; then
  SKILL_FILE="$PROJECT_DIR/.claude/skills/backlog-analyzer/SKILL.md"
fi

if [ ! -f "$SKILL_FILE" ]; then
  log "ERROR: 스킬 파일을 찾을 수 없음"
  exit 1
fi

# 스킬 내용을 프롬프트로 전달 (15분 timeout - 분석에 시간이 걸릴 수 있음)
TIMEOUT=900

claude -p "아래 스킬을 실행해주세요. dentbird-solutions 코드베이스 경로는 ~/Works/devops/dentbird-solutions 입니다.

$(cat "$SKILL_FILE")" \
  --allowedTools "Bash(curl:*)" "Bash(jq:*)" "Bash(grep:*)" "Bash(find:*)" "Read" "Write" "Glob" "Grep" \
  --max-turns 100 \
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
  sleep 10
done

# 정상 종료 시 결과 코드 수집
if [ $SECONDS -lt $TIMEOUT ]; then
  wait $CLAUDE_PID 2>/dev/null
  RESULT=$?
fi

if [ $RESULT -eq 0 ]; then
  log "=== Backlog Analyzer 완료 ==="
else
  log "ERROR: Claude Code 실행 실패 (exit code: $RESULT)"

  # 에러 알림 전송
  curl -s -X POST "$SLACK_WEBHOOK" \
    -H "Content-Type: application/json; charset=utf-8" \
    -d '{"text":"⚠️ Backlog Analyzer 실행 실패. 로그를 확인하세요."}' \
    >> "$LOG_FILE" 2>&1
fi

exit $RESULT
