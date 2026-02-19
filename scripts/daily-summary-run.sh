#!/bin/bash
# daily-summary 실행 스크립트
# 오늘 하루 업무를 수집하고 요약합니다.

TODAY=$(TZ=Asia/Seoul date +%Y-%m-%d)
DAY_OF_WEEK=$(TZ=Asia/Seoul date +%A)
REPORT_DIR="$HOME/Works/personal/dev-assistant/reports"
REPORT_FILE="$REPORT_DIR/$TODAY.md"
TEMP_DIR=$(mktemp -d)

echo "=== Daily Summary: $TODAY ($DAY_OF_WEEK) ==="

# 한글 요일 변환
case "$DAY_OF_WEEK" in
  Monday) KR_DAY="월요일" ;;
  Tuesday) KR_DAY="화요일" ;;
  Wednesday) KR_DAY="수요일" ;;
  Thursday) KR_DAY="목요일" ;;
  Friday) KR_DAY="금요일" ;;
  Saturday) KR_DAY="토요일" ;;
  Sunday) KR_DAY="일요일" ;;
esac

mkdir -p "$REPORT_DIR"

# ── 1. Git 커밋 수집 ──
echo ""
echo "--- Git 커밋 수집 ---"
REPO_PATH="$HOME/Works/devops/dentbird-solutions"
GIT_COMMITS=$(git -C "$REPO_PATH" log --oneline \
  --since="$TODAY 00:00:00" --until="$TODAY 23:59:59" \
  --author="Jinwan\|jinwan\|김진완\|jwkim" \
  --format="%h %s" 2>/dev/null || echo "")
GIT_COUNT=$(echo "$GIT_COMMITS" | grep -c . 2>/dev/null || echo "0")
if [ -z "$GIT_COMMITS" ]; then GIT_COUNT=0; fi
echo "Git 커밋: ${GIT_COUNT}건"
echo "$GIT_COMMITS"

# ── 2. Jira 이슈 수집 ──
echo ""
echo "--- Jira 이슈 수집 ---"
JIRA_RESULT=""
if [ -n "$JIRA_EMAIL" ] && [ -n "$JIRA_API_TOKEN" ]; then
  AUTH=$(printf '%s' "$JIRA_EMAIL:$JIRA_API_TOKEN" | base64)
  JIRA_RESULT=$(curl -s -X POST \
    "https://imagoworks.atlassian.net/rest/api/3/search/jql" \
    -H "Authorization: Basic $AUTH" \
    -H "Content-Type: application/json" \
    -d '{"jql":"project = D1 AND assignee = currentUser() AND updated >= startOfDay()","fields":["key","summary","status"]}')
  echo "$JIRA_RESULT" > "$TEMP_DIR/jira.json"
  JIRA_COUNT=$(echo "$JIRA_RESULT" | jq -r '.total // 0')
  echo "Jira 이슈: ${JIRA_COUNT}건"
  echo "$JIRA_RESULT" | jq -r '.issues[]? | "\(.key) \(.fields.summary) (\(.fields.status.name))"'
else
  JIRA_COUNT=0
  echo "JIRA 환경변수 미설정 - 건너뜀"
fi

# ── 3. PR 상태 수집 ──
echo ""
echo "--- PR 상태 수집 ---"

# 오늘 머지된 PR
echo "[머지된 PR]"
MERGED_PRS=$(az repos pr list \
  --organization "https://dev.azure.com/ImagoWorks" \
  --project "dentbird-solutions" \
  --status completed -o json 2>/dev/null || echo "[]")
echo "$MERGED_PRS" > "$TEMP_DIR/merged_prs.json"
MERGED_TODAY=$(echo "$MERGED_PRS" | jq -r --arg today "$TODAY" \
  '[.[] | select(.closedDate >= $today and .createdBy.uniqueName == "jwkim@imagoworks.ai")] | length')
echo "오늘 머지된 PR: ${MERGED_TODAY:-0}건"
echo "$MERGED_PRS" | jq -r --arg today "$TODAY" \
  '.[] | select(.closedDate >= $today and .createdBy.uniqueName == "jwkim@imagoworks.ai") | "#\(.pullRequestId) \(.title)"'

# 내가 만든 활성 PR
echo ""
echo "[내가 만든 PR (리뷰 대기)]"
ACTIVE_PRS=$(az repos pr list \
  --organization "https://dev.azure.com/ImagoWorks" \
  --project "dentbird-solutions" \
  --status active -o json 2>/dev/null || echo "[]")
echo "$ACTIVE_PRS" > "$TEMP_DIR/active_prs.json"
MY_PRS=$(echo "$ACTIVE_PRS" | jq -r \
  '.[] | select(.createdBy.uniqueName == "jwkim@imagoworks.ai") | "#\(.pullRequestId) \(.title)"')
MY_PRS_COUNT=$(echo "$ACTIVE_PRS" | jq -r \
  '[.[] | select(.createdBy.uniqueName == "jwkim@imagoworks.ai")] | length')
echo "리뷰 대기 PR: ${MY_PRS_COUNT:-0}건"
echo "$MY_PRS"

# 리뷰 요청받은 PR
echo ""
echo "[리뷰 요청받은 PR]"
REVIEW_PRS=$(echo "$ACTIVE_PRS" | jq -r \
  '.[] | select(.reviewers[]?.uniqueName == "jwkim@imagoworks.ai") | "#\(.pullRequestId) \(.title) (\(.createdBy.displayName))"')
REVIEW_PRS_COUNT=$(echo "$ACTIVE_PRS" | jq -r \
  '[.[] | select(.reviewers[]?.uniqueName == "jwkim@imagoworks.ai")] | length')
echo "리뷰 요청: ${REVIEW_PRS_COUNT:-0}건"
echo "$REVIEW_PRS"

# ── 4. 리포트 파일 생성 ──
echo ""
echo "--- 리포트 생성 ---"

{
  echo "# $TODAY ($KR_DAY) 업무 요약"
  echo ""

  # Git 커밋
  echo "## Git 커밋 (${GIT_COUNT}건)"
  if [ "$GIT_COUNT" -gt 0 ] 2>/dev/null; then
    echo "$GIT_COMMITS" | while IFS= read -r line; do
      hash=$(echo "$line" | cut -d' ' -f1)
      msg=$(echo "$line" | cut -d' ' -f2-)
      echo "- \`$hash\` $msg"
    done
  else
    echo "- 없음"
  fi
  echo ""

  # Jira 이슈
  echo "## Jira 이슈 (${JIRA_COUNT:-0}건)"
  if [ "${JIRA_COUNT:-0}" -gt 0 ] 2>/dev/null; then
    echo "| 키 | 제목 | 상태 |"
    echo "|----|------|------|"
    echo "$JIRA_RESULT" | jq -r '.issues[]? | "| [\(.key)](https://imagoworks.atlassian.net/browse/\(.key)) | \(.fields.summary) | \(.fields.status.name) |"'
  else
    echo "- 없음"
  fi
  echo ""

  # PR 상태
  echo "## PR 상태"
  echo ""

  echo "### 오늘 머지된 PR (${MERGED_TODAY:-0}건)"
  if [ "${MERGED_TODAY:-0}" -gt 0 ] 2>/dev/null; then
    echo "| ID | 제목 |"
    echo "|----|------|"
    echo "$MERGED_PRS" | jq -r --arg today "$TODAY" \
      '.[] | select(.closedDate >= $today and .createdBy.uniqueName == "jwkim@imagoworks.ai") | "| [#\(.pullRequestId)](https://dev.azure.com/ImagoWorks/dentbird-solutions/_git/dentbird-solutions/pullrequest/\(.pullRequestId)) | \(.title) |"'
  else
    echo "- 없음"
  fi
  echo ""

  echo "### 내가 만든 PR (리뷰 대기) (${MY_PRS_COUNT:-0}건)"
  if [ "${MY_PRS_COUNT:-0}" -gt 0 ] 2>/dev/null; then
    echo "| ID | 제목 |"
    echo "|----|------|"
    echo "$ACTIVE_PRS" | jq -r \
      '.[] | select(.createdBy.uniqueName == "jwkim@imagoworks.ai") | "| [#\(.pullRequestId)](https://dev.azure.com/ImagoWorks/dentbird-solutions/_git/dentbird-solutions/pullrequest/\(.pullRequestId)) | \(.title) |"'
  else
    echo "- 없음"
  fi
  echo ""

  echo "### 리뷰 요청받은 PR (${REVIEW_PRS_COUNT:-0}건)"
  if [ "${REVIEW_PRS_COUNT:-0}" -gt 0 ] 2>/dev/null; then
    echo "| ID | 작성자 | 제목 |"
    echo "|----|--------|------|"
    echo "$ACTIVE_PRS" | jq -r \
      '.[] | select(.reviewers[]?.uniqueName == "jwkim@imagoworks.ai") | "| [#\(.pullRequestId)](https://dev.azure.com/ImagoWorks/dentbird-solutions/_git/dentbird-solutions/pullrequest/\(.pullRequestId)) | \(.createdBy.displayName) | \(.title) |"'
  else
    echo "- 없음"
  fi
  echo ""

  echo "---"
  echo "생성: $(TZ=Asia/Seoul date +%H:%M)"
} > "$REPORT_FILE"

echo "리포트 저장: $REPORT_FILE"

# ── 5. Slack Block Kit 메시지 생성 ──

# Git 커밋 텍스트
GIT_TEXT="*커밋*\n"
if [ "$GIT_COUNT" -gt 0 ] 2>/dev/null; then
  while IFS= read -r line; do
    hash=$(echo "$line" | cut -d' ' -f1)
    msg=$(echo "$line" | cut -d' ' -f2-)
    GIT_TEXT="${GIT_TEXT}• \`$hash\` $msg\n"
  done <<< "$GIT_COMMITS"
else
  GIT_TEXT="${GIT_TEXT}• 없음"
fi

# Jira 텍스트
JIRA_TEXT="*Jira*\n"
if [ "${JIRA_COUNT:-0}" -gt 0 ] 2>/dev/null; then
  JIRA_ITEMS=$(echo "$JIRA_RESULT" | jq -r '.issues[]? | "• <https://imagoworks.atlassian.net/browse/\(.key)|\(.key)> \(.fields.summary) (\(.fields.status.name))"')
  JIRA_TEXT="${JIRA_TEXT}${JIRA_ITEMS}"
else
  JIRA_TEXT="${JIRA_TEXT}• 없음"
fi

# 머지된 PR 텍스트
MERGED_TEXT="*오늘 머지된 PR*\n"
if [ "${MERGED_TODAY:-0}" -gt 0 ] 2>/dev/null; then
  MERGED_ITEMS=$(echo "$MERGED_PRS" | jq -r --arg today "$TODAY" \
    '.[] | select(.closedDate >= $today and .createdBy.uniqueName == "jwkim@imagoworks.ai") | "• <https://dev.azure.com/ImagoWorks/dentbird-solutions/_git/dentbird-solutions/pullrequest/\(.pullRequestId)|#\(.pullRequestId)> \(.title)"')
  MERGED_TEXT="${MERGED_TEXT}${MERGED_ITEMS}"
else
  MERGED_TEXT="${MERGED_TEXT}• 없음"
fi

# 리뷰 대기 PR 텍스트
MY_PR_TEXT="*리뷰 대기 PR*\n"
if [ "${MY_PRS_COUNT:-0}" -gt 0 ] 2>/dev/null; then
  MY_PR_ITEMS=$(echo "$ACTIVE_PRS" | jq -r \
    '.[] | select(.createdBy.uniqueName == "jwkim@imagoworks.ai") | "• <https://dev.azure.com/ImagoWorks/dentbird-solutions/_git/dentbird-solutions/pullrequest/\(.pullRequestId)|#\(.pullRequestId)> \(.title)"')
  MY_PR_TEXT="${MY_PR_TEXT}${MY_PR_ITEMS}"
else
  MY_PR_TEXT="${MY_PR_TEXT}• 없음"
fi

# 리뷰 요청 PR 텍스트
REVIEW_TEXT="*리뷰 요청받은 PR*\n"
if [ "${REVIEW_PRS_COUNT:-0}" -gt 0 ] 2>/dev/null; then
  REVIEW_ITEMS=$(echo "$ACTIVE_PRS" | jq -r \
    '.[] | select(.reviewers[]?.uniqueName == "jwkim@imagoworks.ai") | "• <https://dev.azure.com/ImagoWorks/dentbird-solutions/_git/dentbird-solutions/pullrequest/\(.pullRequestId)|#\(.pullRequestId)> \(.title) (\(.createdBy.displayName))"')
  REVIEW_TEXT="${REVIEW_TEXT}${REVIEW_ITEMS}"
else
  REVIEW_TEXT="${REVIEW_TEXT}• 없음"
fi

# JSON 이스케이프를 위해 jq 사용
SLACK_PAYLOAD=$(jq -n \
  --arg header "📊 $TODAY ($KR_DAY) 업무 요약" \
  --arg summary "*Git*: ${GIT_COUNT}건 | *Jira*: ${JIRA_COUNT:-0}건 | *머지된 PR*: ${MERGED_TODAY:-0}건" \
  --arg git_text "$GIT_TEXT" \
  --arg jira_text "$JIRA_TEXT" \
  --arg merged_text "$MERGED_TEXT" \
  --arg my_pr_text "$MY_PR_TEXT" \
  --arg review_text "$REVIEW_TEXT" \
  '{
    "blocks": [
      {"type": "header", "text": {"type": "plain_text", "text": $header}},
      {"type": "section", "text": {"type": "mrkdwn", "text": $summary}},
      {"type": "divider"},
      {"type": "section", "text": {"type": "mrkdwn", "text": $git_text}},
      {"type": "section", "text": {"type": "mrkdwn", "text": $jira_text}},
      {"type": "section", "text": {"type": "mrkdwn", "text": $merged_text}},
      {"type": "section", "text": {"type": "mrkdwn", "text": $my_pr_text}},
      {"type": "section", "text": {"type": "mrkdwn", "text": $review_text}}
    ]
  }')

echo "$SLACK_PAYLOAD" > "$TEMP_DIR/slack_payload.json"

# ── 6. Slack 전송 ──
if [ "$1" = "--dry-run" ]; then
  echo ""
  echo "=== DRY RUN - Slack 전송 건너뜀 ==="
  echo "Slack 메시지 미리보기:"
  echo "$SLACK_PAYLOAD" | jq .
else
  echo ""
  echo "--- Slack 전송 ---"
  if [ -n "$SLACK_WEBHOOK" ]; then
    SLACK_RESPONSE=$(curl -s -X POST "$SLACK_WEBHOOK" \
      -H "Content-Type: application/json; charset=utf-8" \
      -d "$SLACK_PAYLOAD")
    echo "Slack 응답: $SLACK_RESPONSE"
  else
    echo "SLACK_WEBHOOK 미설정 - 전송 건너뜀"
  fi
fi

# 정리
rm -rf "$TEMP_DIR"

echo ""
echo "=== 완료 ==="
