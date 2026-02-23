#!/bin/bash
# 5분마다 실행. 네트워크 확인 후 대기 중인 작업 실행

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
QUEUE_DIR="$SCRIPT_DIR/queue"
LOG_FILE="$PROJECT_DIR/logs/dispatcher.log"

mkdir -p "$QUEUE_DIR"
mkdir -p "$(dirname "$LOG_FILE")"

log() {
  echo "[$(TZ=Asia/Seoul date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

source "$SCRIPT_DIR/common.sh"

# 만료된 pending/running/failed 파일 정리 (24시간 이상)
find "$QUEUE_DIR" -name "*.pending" -mmin +1440 -exec rm -f {} \; 2>/dev/null
find "$QUEUE_DIR" -name "*.running" -mmin +1440 -exec rm -f {} \; 2>/dev/null
find "$QUEUE_DIR" -name "*.failed" -mmin +1440 -exec rm -f {} \; 2>/dev/null

# 대기 중인 작업 확인
PENDING_COUNT=$(ls "$QUEUE_DIR"/*.pending 2>/dev/null | wc -l | tr -d ' ')
if [ "$PENDING_COUNT" -eq 0 ]; then
  exit 0  # 대기 작업 없음
fi

# 네트워크 체크
if ! check_network; then
  log "네트워크 미연결 - 대기 중인 작업 ${PENDING_COUNT}개 보류"
  exit 0
fi

# 대기 중인 작업 실행
for pending_file in "$QUEUE_DIR"/*.pending; do
  [ -f "$pending_file" ] || continue

  JOB_NAME=$(basename "$pending_file" .pending)
  SCRIPT="$SCRIPT_DIR/${JOB_NAME}.sh"

  if [ ! -f "$SCRIPT" ]; then
    log "WARNING: 스크립트 없음 - $SCRIPT, pending 삭제"
    rm -f "$pending_file"
    continue
  fi

  # pending -> running (동시 실행 방지)
  mv "$pending_file" "$QUEUE_DIR/${JOB_NAME}.running"

  log "실행 시작: $JOB_NAME"

  # 백그라운드로 실행, 완료 후 .running 삭제
  (
    /bin/bash "$SCRIPT"
    EXIT_CODE=$?
    TIMESTAMP=$(TZ=Asia/Seoul date '+%Y-%m-%d %H:%M:%S')
    rm -f "$QUEUE_DIR/${JOB_NAME}.running"
    if [ $EXIT_CODE -eq 0 ]; then
      echo "[$TIMESTAMP] 실행 완료: $JOB_NAME (성공)" >> "$LOG_FILE"
    else
      echo "[$TIMESTAMP] 실행 완료: $JOB_NAME (실패: exit $EXIT_CODE)" >> "$LOG_FILE"

      # .failed 파일 생성 (retry.sh에서 사용)
      echo "exit_code=$EXIT_CODE timestamp=$TIMESTAMP" > "$QUEUE_DIR/${JOB_NAME}.failed"

      # Slack 실패 알림 전송
      code_desc=$(describe_exit_code "$EXIT_CODE")
      send_slack_alert \
        "⚠️ 크론잡 실패" \
        "• 작업: ${JOB_NAME}\n• 종료 코드: ${EXIT_CODE} (${code_desc})\n• 시각: ${TIMESTAMP}\n\n재실행: ${SCRIPT_DIR}/enqueue.sh ${JOB_NAME}"
    fi
  ) &
done

log "디스패처: ${PENDING_COUNT}개 작업 시작됨, 완료 대기 중..."

# 모든 백그라운드 작업이 끝날 때까지 대기
# (launchd는 부모 프로세스 종료 시 자식도 kill하므로 wait 필수)
wait

log "디스패처 완료 - 모든 작업 종료"
