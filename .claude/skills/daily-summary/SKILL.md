# daily-summary

오늘 하루 업무를 자동으로 수집하고 요약해서 Slack DM으로 전송합니다.

## 사용법

```bash
/daily-summary              # 요약 생성 + Slack 전송
/daily-summary --dry-run    # 요약만 생성 (전송 안함)
```

## 실행 단계

### 1단계: 오늘 날짜 확인

```bash
# KST 기준 오늘 날짜 (타임존은 환경에 맞게 수정)
TODAY=$(TZ=Asia/Seoul date +%Y-%m-%d)
echo "오늘: $TODAY"
```

### 2단계: Git 커밋 수집

프로젝트 저장소에서 오늘 내 커밋을 수집합니다.

```bash
# 프로젝트 저장소 경로 (환경에 맞게 수정)
REPO_PATH="${PROJECT_REPO:-$HOME/path/to/your-project}"

cd "$REPO_PATH"

# 오늘 내 커밋 조회 (author 이름은 환경에 맞게 수정)
git log --oneline --since="$TODAY 00:00:00" --until="$TODAY 23:59:59" \
  --author="Your Name\|your-email" \
  --format="%h %s"
```

**출력 예시:**
```
a1b2c3d feat(module): 새 기능 추가
d4e5f6g fix(component): 버그 수정
```

### 3단계: Jira 이슈 수집

오늘 내가 작업한 이슈를 조회합니다.

**JQL 쿼리:**
```
project = YOUR_PROJECT AND assignee = currentUser() AND updated >= startOfDay()
```

**API 호출:**
```bash
curl -s -X POST \
  "https://your-company.atlassian.net/rest/api/3/search/jql" \
  -H "Authorization: Basic $(printf '%s' "$JIRA_EMAIL:$JIRA_API_TOKEN" | base64)" \
  -H "Content-Type: application/json" \
  -d '{"jql":"project = YOUR_PROJECT AND assignee = currentUser() AND updated >= startOfDay()","fields":["key","summary","status"]}'
```

**응답 파싱:**
- `issues[].key` - 이슈 키 (PROJ-1234)
- `issues[].fields.summary` - 제목
- `issues[].fields.status.name` - 상태

### 4단계: PR 상태 수집

#### Azure DevOps 사용 시:

**오늘 머지된 내 PR:**
```bash
az repos pr list \
  --organization "https://dev.azure.com/YourOrg" \
  --project "your-project" \
  --status completed \
  -o json | jq -r --arg today "$TODAY" '.[] | select(.closedDate >= $today and .createdBy.uniqueName == "your-email") | "#\(.pullRequestId) \(.title)"'
```

**내가 만든 PR (리뷰 대기):**
```bash
az repos pr list \
  --organization "https://dev.azure.com/YourOrg" \
  --project "your-project" \
  --creator "$(az account show --query user.name -o tsv)" \
  --status active \
  -o json
```

**내가 리뷰할 PR:**
```bash
az repos pr list \
  --organization "https://dev.azure.com/YourOrg" \
  --project "your-project" \
  --reviewer "$(az account show --query user.name -o tsv)" \
  --status active \
  -o json
```

#### GitHub 사용 시:

**오늘 머지된 내 PR:**
```bash
gh pr list --author @me --state merged --json number,title,mergedAt \
  --jq ".[] | select(.mergedAt >= \"${TODAY}T00:00:00Z\")"
```

**내가 만든 PR (리뷰 대기):**
```bash
gh pr list --author @me --state open --json number,title,state
```

**내가 리뷰할 PR:**
```bash
gh pr list --search "review-requested:@me" --json number,title,author
```

### 5단계: 요약 생성

수집한 정보를 바탕으로 일일 요약을 생성합니다.

**reports/{YYYY-MM-DD}.md 형식:**

```markdown
# {YYYY-MM-DD} ({요일}) 업무 요약

## Git 커밋 ({N}건)
- `a1b2c3d` feat(module): 새 기능 추가
- `d4e5f6g` fix(component): 버그 수정

## Jira 이슈 ({N}건)
| 키 | 제목 | 상태 |
|----|------|------|
| [PROJ-1234](https://your-company.atlassian.net/browse/PROJ-1234) | 이슈 제목 | 진행 중 |

## PR 상태
### 오늘 머지된 PR ({N}건)
| ID | 제목 |
|----|------|
| #123 | feat: 새 기능 |

### 내가 만든 PR (리뷰 대기)
| ID | 제목 |
|----|------|
| #789 | feat: 다른 기능 |

### 리뷰 요청받은 PR
| ID | 작성자 | 제목 |
|----|--------|------|
| #456 | 동료이름 | fix: 버그 수정 |

---
생성: {HH:MM}
```

### 6단계: Slack 웹훅 전송 (--dry-run이 아닌 경우)

**메시지 포맷 (Slack Block Kit):**

```json
{
  "blocks": [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": "📊 {YYYY-MM-DD} 업무 요약"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Git 커밋*: {N}건 | *Jira*: {N}건 | *머지된 PR*: {N}건"
      }
    },
    {
      "type": "divider"
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*커밋*\n• `a1b2c3d` feat: 새 기능\n• `d4e5f6g` fix: 버그 수정"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Jira*\n• <https://your-company.atlassian.net/browse/PROJ-1234|PROJ-1234> 이슈 제목 (진행 중)"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*오늘 머지된 PR*\n• #123 feat: 새 기능\n• #456 fix: 버그 수정"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*리뷰 대기 PR*\n• #789 feat: 다른 기능"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*리뷰 요청받은 PR*\n• #101 (동료이름)"
      }
    }
  ]
}
```

**전송:**
```bash
curl -X POST "$SLACK_WEBHOOK" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d @webhook_payload.json
```

## 환경 변수

| 변수 | 필수 | 설명 |
|------|------|------|
| `JIRA_EMAIL` | O | Jira 계정 이메일 |
| `JIRA_API_TOKEN` | O | Jira API 토큰 |
| `SLACK_WEBHOOK` | O | Slack Incoming Webhook URL |
| `PROJECT_REPO` | X | 프로젝트 저장소 경로 |

## 출력

1. **reports/{YYYY-MM-DD}.md** - 상세 요약 파일
2. **Slack 메시지** - 간략한 요약 (본인 DM)

## 주의사항

- Azure DevOps: `az login` 필요
- GitHub: `gh auth login` 필요
- Jira API 토큰: https://id.atlassian.com/manage-profile/security/api-tokens 에서 생성
- Slack 웹훅: https://api.slack.com/apps → Incoming Webhooks

## 커스터마이징

이 스킬을 본인 환경에 맞게 수정하세요:

1. **Jira 프로젝트 키**: `YOUR_PROJECT` → 실제 프로젝트 키
2. **Jira URL**: `your-company.atlassian.net` → 실제 URL
3. **Git author**: `Your Name` → 본인 이름/이메일
4. **Azure DevOps/GitHub**: 사용하는 플랫폼에 맞게 선택
