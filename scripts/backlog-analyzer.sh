#!/bin/bash

# Dev Assistant - Backlog Analyzer 자동 실행 스크립트
# 매일 새벽 02:00에 launchd에 의해 실행됨

set -e

# 경로 설정
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_FILE="$PROJECT_DIR/logs/backlog-analyzer.log"
REPORT_DIR="$PROJECT_DIR/reports"
TODAY=$(TZ=Asia/Seoul date '+%Y-%m-%d')
REPORT_FILE="$REPORT_DIR/backlog-analysis-$TODAY.md"

# 로그 디렉토리 생성
mkdir -p "$PROJECT_DIR/logs"
mkdir -p "$REPORT_DIR"

# 환경 변수 로드 (~/.zshrc에서)
if [ -f ~/.zshrc ]; then
  source ~/.zshrc 2>/dev/null || true
fi

log() {
  echo "[$(TZ=Asia/Seoul date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Slack 알림 전송 함수
send_slack_alert() {
  local status="$1"
  local message="$2"
  local details="${3:-}"

  local emoji="⚠️"
  if [ "$status" = "success" ]; then
    emoji="✅"
  elif [ "$status" = "error" ]; then
    emoji="❌"
  fi

  local payload
  if [ -n "$details" ]; then
    payload=$(cat <<EOF
{
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "$emoji *Backlog Analyzer*\n$message"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "\`\`\`$details\`\`\`"
      }
    }
  ]
}
EOF
)
  else
    payload="{\"text\":\"$emoji $message\"}"
  fi

  curl -s -X POST "$SLACK_WEBHOOK" \
    -H "Content-Type: application/json; charset=utf-8" \
    -d "$payload" \
    >> "$LOG_FILE" 2>&1 || true
}

# 리포트 검증 함수
validate_report() {
  local report_path="$1"

  # 1. 파일 존재 확인
  if [ ! -f "$report_path" ]; then
    echo "FAIL:파일 미생성"
    return 1
  fi

  # 2. 파일 크기 확인 (최소 100바이트)
  local file_size=$(wc -c < "$report_path" | tr -d ' ')
  if [ "$file_size" -lt 100 ]; then
    echo "FAIL:파일 크기 부족 (${file_size}bytes)"
    return 1
  fi

  # 3. 필수 키워드 확인 ("Always" 또는 "해결 가능")
  if grep -q -E "(Always|해결 가능)" "$report_path"; then
    echo "OK"
    return 0
  else
    echo "FAIL:필수 키워드 없음 (Always 또는 '해결 가능')"
    return 1
  fi
}

# Claude 실행 함수 (재시도 지원)
run_claude() {
  local attempt=$1
  local skill_file="$2"
  local timeout=$3

  log "Claude 실행 시도 #$attempt..."

  # 이전 리포트 파일 삭제 (새로 생성되었는지 확인하기 위해)
  rm -f "$REPORT_FILE"

  claude -p "아래 스킬을 실행해주세요. dentbird-solutions 코드베이스 경로는 ~/Works/devops/dentbird-solutions 입니다.

$(cat "$skill_file")" \
    --allowedTools "Bash(curl:*)" "Bash(jq:*)" "Bash(grep:*)" "Bash(find:*)" "Read" "Write" "Glob" "Grep" \
    --max-turns 100 \
    >> "$LOG_FILE" 2>&1 &
  CLAUDE_PID=$!

  # Timeout 체크 루프
  SECONDS=0
  while kill -0 $CLAUDE_PID 2>/dev/null; do
    if [ $SECONDS -ge $timeout ]; then
      log "ERROR: Timeout (${timeout}s) - 프로세스 강제 종료"
      kill -9 $CLAUDE_PID 2>/dev/null
      wait $CLAUDE_PID 2>/dev/null
      return 124  # timeout exit code
    fi
    sleep 10
  done

  # 정상 종료 시 결과 코드 수집
  wait $CLAUDE_PID 2>/dev/null
  return $?
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

# Python fallback 스크립트 경로
PYTHON_FALLBACK="$SCRIPT_DIR/backlog_analyzer.py"

# 스킬 내용을 프롬프트로 전달 (15분 timeout - 분석에 시간이 걸릴 수 있음)
TIMEOUT=900
MAX_RETRIES=2
CLAUDE_SUCCESS=false

# Claude 실행 (최대 2회 시도)
for attempt in $(seq 1 $MAX_RETRIES); do
  run_claude $attempt "$SKILL_FILE" $TIMEOUT
  RESULT=$?

  if [ $RESULT -eq 0 ]; then
    # exit code 0이어도 리포트 검증 필요
    log "Claude 종료 (exit code: 0), 리포트 검증 중..."

    VALIDATION=$(validate_report "$REPORT_FILE")

    if [ "$VALIDATION" = "OK" ]; then
      log "리포트 검증 성공: $REPORT_FILE"
      CLAUDE_SUCCESS=true
      break
    else
      log "WARNING: 리포트 검증 실패 - $VALIDATION"
      if [ $attempt -lt $MAX_RETRIES ]; then
        log "재시도 예정 (attempt $((attempt+1))/$MAX_RETRIES)..."
        sleep 5
      fi
    fi
  else
    log "ERROR: Claude Code 실행 실패 (exit code: $RESULT)"
    if [ $attempt -lt $MAX_RETRIES ]; then
      log "재시도 예정 (attempt $((attempt+1))/$MAX_RETRIES)..."
      sleep 5
    fi
  fi
done

# 결과 처리
if [ "$CLAUDE_SUCCESS" = true ]; then
  log "=== Backlog Analyzer 완료 (Claude) ==="
  exit 0
fi

# Claude 실패 시 Python fallback 시도
if [ -f "$PYTHON_FALLBACK" ]; then
  log "Claude 2회 실패, Python fallback 실행 중..."

  # Python 스크립트 실행
  if python3 "$PYTHON_FALLBACK" >> "$LOG_FILE" 2>&1; then
    # Python 리포트도 검증
    VALIDATION=$(validate_report "$REPORT_FILE")

    if [ "$VALIDATION" = "OK" ]; then
      log "=== Backlog Analyzer 완료 (Python fallback) ==="
      send_slack_alert "warning" "Backlog Analyzer: Claude 실패로 Python fallback 사용" "리포트는 정상 생성됨"
      exit 0
    else
      log "ERROR: Python fallback 리포트 검증 실패 - $VALIDATION"
    fi
  else
    log "ERROR: Python fallback 실행 실패"
  fi
else
  log "WARNING: Python fallback 스크립트 없음: $PYTHON_FALLBACK"
fi

# 최종 실패 처리
log "ERROR: 모든 분석 시도 실패"

# 최근 로그 추출 (마지막 20줄)
RECENT_LOG=$(tail -20 "$LOG_FILE" 2>/dev/null | head -15 | sed 's/"/\\"/g' | tr '\n' '\\n' | sed 's/\\n$//')

# 상세 에러 알림 전송
send_slack_alert "error" "Backlog Analyzer 실행 실패" "Claude 2회 + Python fallback 모두 실패\\n\\n마지막 로그:\\n$RECENT_LOG"

exit 1
