#!/bin/bash
# Usage: enqueue.sh <job-name>
# 큐 디렉토리에 .pending 파일 생성

JOB_NAME="$1"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
QUEUE_DIR="$SCRIPT_DIR/queue"
LOG_FILE="$(dirname "$SCRIPT_DIR")/logs/dispatcher.log"

mkdir -p "$QUEUE_DIR"
mkdir -p "$(dirname "$LOG_FILE")"

TIMESTAMP=$(TZ=Asia/Seoul date '+%Y-%m-%d %H:%M:%S')

# 유효성 체크
if [ -z "$JOB_NAME" ]; then
  echo "[$TIMESTAMP] ERROR: job name required" >> "$LOG_FILE"
  exit 1
fi

# 해당 스크립트가 실제로 존재하는지 확인
if [ ! -f "$SCRIPT_DIR/${JOB_NAME}.sh" ]; then
  echo "[$TIMESTAMP] ERROR: $SCRIPT_DIR/${JOB_NAME}.sh not found" >> "$LOG_FILE"
  exit 1
fi

# 이미 pending이면 스킵
if [ -f "$QUEUE_DIR/${JOB_NAME}.pending" ]; then
  echo "[$TIMESTAMP] $JOB_NAME already pending, skipping" >> "$LOG_FILE"
  exit 0
fi

# 현재 실행 중이면 스킵
if [ -f "$QUEUE_DIR/${JOB_NAME}.running" ]; then
  echo "[$TIMESTAMP] $JOB_NAME already running, skipping" >> "$LOG_FILE"
  exit 0
fi

# 큐에 등록
echo "$TIMESTAMP" > "$QUEUE_DIR/${JOB_NAME}.pending"
echo "[$TIMESTAMP] Enqueued: $JOB_NAME" >> "$LOG_FILE"
