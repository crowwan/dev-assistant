# standup

아침 스탠드업 메시지를 자동 생성해서 Slack으로 전송합니다.

## 사용법

```bash
/standup              # 스탠드업 생성 + Slack 전송
/standup --dry-run    # 생성만 (전송 안함)
```

## 실행 단계

### 1단계: 날짜 확인

```bash
# KST 기준
TODAY=$(TZ=Asia/Seoul date +%Y-%m-%d)
YESTERDAY=$(TZ=Asia/Seoul date -v-1d +%Y-%m-%d)
echo "어제: $YESTERDAY, 오늘: $TODAY"
```

### 2단계: 어제 한 일 수집

#### Git 커밋 (어제)

```bash
REPO_PATH="${PROJECT_REPO:-$HOME/path/to/your-project}"
cd "$REPO_PATH"

git log --oneline --since="$YESTERDAY 00:00:00" --until="$YESTERDAY 23:59:59" \
  --author="Your Name\|your-email" \
  --format="%h %s"
```

#### Jira 완료 이슈 (어제)

**JQL:**
```
project = YOUR_PROJECT AND assignee = currentUser() AND status changed to "Done" on -1d
```

**API 호출:**
```bash
curl -s -X POST \
  "https://your-company.atlassian.net/rest/api/3/search/jql" \
  -H "Authorization: Basic $(printf '%s' "$JIRA_EMAIL:$JIRA_API_TOKEN" | base64)" \
  -H "Content-Type: application/json" \
  -d '{"jql":"project = YOUR_PROJECT AND assignee = currentUser() AND status changed to \"Done\" on -1d","fields":["key","summary"]}'
```

#### 머지된 PR (어제)

**Azure DevOps:**
```bash
az repos pr list \
  --organization "https://dev.azure.com/YourOrg" \
  --project "your-project" \
  --creator "$(az account show --query user.name -o tsv)" \
  --status completed \
  --query "[?closedDate >= '$YESTERDAY']" \
  -o json
```

**GitHub:**
```bash
gh pr list --author @me --state merged --json number,title,mergedAt \
  --jq ".[] | select(.mergedAt >= \"${YESTERDAY}T00:00:00Z\")"
```

### 3단계: 오늘 할 일 수집

#### 진행 중인 Jira 이슈

**JQL:**
```
project = YOUR_PROJECT AND assignee = currentUser() AND status = "In Progress"
```

**API 호출:**
```bash
curl -s -X POST \
  "https://your-company.atlassian.net/rest/api/3/search/jql" \
  -H "Authorization: Basic $(printf '%s' "$JIRA_EMAIL:$JIRA_API_TOKEN" | base64)" \
  -H "Content-Type: application/json" \
  -d '{"jql":"project = YOUR_PROJECT AND assignee = currentUser() AND status = \"In Progress\"","fields":["key","summary"]}'
```

#### 열린 PR (리뷰 대기)

**Azure DevOps:**
```bash
az repos pr list \
  --organization "https://dev.azure.com/YourOrg" \
  --project "your-project" \
  --creator "$(az account show --query user.name -o tsv)" \
  --status active \
  -o json
```

**GitHub:**
```bash
gh pr list --author @me --state open --json number,title,reviewDecision
```

### 4단계: Slack 메시지 전송

**메시지 포맷:**

```json
{
  "blocks": [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": "Daily Standup - {YYYY-MM-DD}"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Yesterday*\n• `a1b2c3d` feat: 새 기능 추가\n• <https://your-company.atlassian.net/browse/PROJ-123|PROJ-123> 완료\n• PR #45 머지됨"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Today*\n• <https://your-company.atlassian.net/browse/PROJ-124|PROJ-124> 진행 중\n• PR #46 리뷰 대기"
      }
    }
  ]
}
```

**전송:**
```bash
curl -X POST "$SLACK_WEBHOOK" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d @standup_payload.json
```

## 환경 변수

| 변수 | 필수 | 설명 |
|------|------|------|
| `JIRA_EMAIL` | O | Jira 계정 이메일 |
| `JIRA_API_TOKEN` | O | Jira API 토큰 |
| `SLACK_WEBHOOK` | O | Slack Incoming Webhook URL |
| `PROJECT_REPO` | X | 프로젝트 저장소 경로 |

## 출력 예시

```
Daily Standup - 2026-01-02

Yesterday
• `a1b2c3d` feat: 사용자 프로필 API 추가
• PROJ-123 로그인 버그 수정 (완료)
• PR #45 머지됨

Today
• PROJ-124 회원가입 플로우 개선 (진행 중)
• PR #46 리뷰 대기
```

## 커스터마이징

이 스킬을 본인 환경에 맞게 수정하세요:

1. **Jira 프로젝트 키**: `YOUR_PROJECT` → 실제 프로젝트 키
2. **Jira URL**: `your-company.atlassian.net` → 실제 URL
3. **Git author**: `Your Name` → 본인 이름/이메일
4. **Azure DevOps/GitHub**: 사용하는 플랫폼에 맞게 선택
