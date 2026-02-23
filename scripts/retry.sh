#!/bin/bash
# 실패한 작업을 재등록하는 스크립트
# 사용법:
#   retry.sh          # 모든 실패 작업 재등록
#   retry.sh <job>    # 특정 작업만 재등록

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
QUEUE_DIR="$SCRIPT_DIR/queue"

# 특정 작업 재등록
retry_job() {
  local job_name="$1"
  local failed_file="$QUEUE_DIR/${job_name}.failed"

  if [ ! -f "$failed_file" ]; then
    echo "실패 기록 없음: $job_name"
    return 1
  fi

  # enqueue.sh로 재등록
  "$SCRIPT_DIR/enqueue.sh" "$job_name"
  local result=$?

  if [ $result -eq 0 ]; then
    rm -f "$failed_file"
    echo "재등록 완료: $job_name"
  else
    echo "재등록 실패: $job_name (enqueue exit $result)"
    return 1
  fi
}

# 인자가 있으면 특정 작업만 재등록
if [ -n "$1" ]; then
  retry_job "$1"
  exit $?
fi

# 인자 없으면 모든 실패 작업 재등록
FAILED_FILES=("$QUEUE_DIR"/*.failed)

# glob 매칭 실패 시 (파일 없음)
if [ ! -f "${FAILED_FILES[0]}" ]; then
  echo "재등록할 실패 작업이 없습니다."
  exit 0
fi

RETRY_COUNT=0
FAIL_COUNT=0

for failed_file in "${FAILED_FILES[@]}"; do
  [ -f "$failed_file" ] || continue
  job_name=$(basename "$failed_file" .failed)

  if retry_job "$job_name"; then
    RETRY_COUNT=$((RETRY_COUNT + 1))
  else
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
done

echo "---"
echo "재등록: ${RETRY_COUNT}개 성공, ${FAIL_COUNT}개 실패"
