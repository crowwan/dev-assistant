#!/bin/bash
# 크론잡 공통 유틸리티

# 네트워크 연결 확인 (단일 체크)
check_network() {
  curl -sf --max-time 5 -o /dev/null "https://dns.google/resolve?name=google.com" 2>/dev/null
}

# exit code를 사람이 읽을 수 있는 설명으로 변환
describe_exit_code() {
  local code="$1"
  case "$code" in
    124) echo "timeout" ;;
    137) echo "SIGKILL" ;;
    143) echo "SIGTERM" ;;
    *)   echo "exit $code" ;;
  esac
}

# Slack 알림 전송 (실패 알림용)
# 사용법: send_slack_alert "제목" "메시지"
send_slack_alert() {
  local title="$1"
  local message="$2"

  # 웹훅 URL 없으면 로그만 남기고 리턴
  if [ -z "$SLACK_WEBHOOK" ]; then
    echo "SLACK_WEBHOOK 미설정 - Slack 알림 생략: $title" >&2
    return 0
  fi

  local payload
  payload=$(cat <<EOJSON
{
  "text": "*${title}*\n${message}"
}
EOJSON
)

  curl -sf --max-time 10 -X POST \
    -H "Content-Type: application/json" \
    -d "$payload" \
    "$SLACK_WEBHOOK" >/dev/null 2>&1
}
