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
# KST 기준 오늘 날짜
TODAY=$(TZ=Asia/Seoul date +%Y-%m-%d)
echo "오늘: $TODAY"
```

### 2단계: Git 커밋 수집

dentbird-solutions 저장소에서 오늘 내 커밋을 수집합니다.

```bash
# dentbird-solutions 저장소 경로
REPO_PATH="${DENTBIRD_REPO:-$HOME/Works/devops/dentbird-solutions}"

cd "$REPO_PATH"

# 오늘 내 커밋 조회 (author 이름은 환경에 맞게)
git log --oneline --since="$TODAY 00:00:00" --until="$TODAY 23:59:59" \
  --author="Jinwan\|jinwan\|김진완" \
  --format="%h %s"
```

**출력 예시:**
```
a1b2c3d feat(cloud-desktop): 로그인 페이지 UI 개선
d4e5f6g fix(embed-modules): 다이얼로그 닫힘 버그 수정
```

### 3단계: Jira 이슈 수집

오늘 내가 작업한 D1 이슈를 조회합니다.

**JQL 쿼리:**
```
project = D1 AND assignee = currentUser() AND updated >= startOfDay()
```

**API 호출:**
```bash
curl -s -X GET \
  "https://imagoworks.atlassian.net/rest/api/3/search" \
  -H "Authorization: Basic $(echo -n "$JIRA_EMAIL:$JIRA_API_TOKEN" | base64)" \
  -H "Content-Type: application/json" \
  --data-urlencode "jql=project = D1 AND assignee = currentUser() AND updated >= startOfDay()" \
  --data-urlencode "fields=key,summary,status"
```

**응답 파싱:**
- `issues[].key` - 이슈 키 (D1-1234)
- `issues[].fields.summary` - 제목
- `issues[].fields.status.name` - 상태

### 4단계: PR 상태 수집

Azure DevOps에서 내 PR 상태를 조회합니다.

**내가 만든 PR:**
```bash
az repos pr list \
  --organization "https://dev.azure.com/ImagoWorks" \
  --project "dentbird-solutions" \
  --creator "$(az account show --query user.name -o tsv)" \
  --status all \
  --query "[?createdDate >= '$TODAY']" \
  -o json
```

**내가 리뷰할 PR:**
```bash
az repos pr list \
  --organization "https://dev.azure.com/ImagoWorks" \
  --project "dentbird-solutions" \
  --reviewer "$(az account show --query user.name -o tsv)" \
  --status active \
  -o json
```

### 5단계: 요약 생성

수집한 정보를 바탕으로 일일 요약을 생성합니다.

**reports/{YYYY-MM-DD}.md 형식:**

```markdown
# {YYYY-MM-DD} ({요일}) 업무 요약

## Git 커밋 ({N}건)
- `a1b2c3d` feat(cloud-desktop): 로그인 페이지 UI 개선
- `d4e5f6g` fix(embed-modules): 다이얼로그 닫힘 버그 수정

## Jira 이슈 ({N}건)
| 키 | 제목 | 상태 |
|----|------|------|
| [D1-1234](https://imagoworks.atlassian.net/browse/D1-1234) | 로그인 버그 수정 | 개발 단계 |
| [D1-1235](https://imagoworks.atlassian.net/browse/D1-1235) | API 응답 포맷 변경 | 작업 완료 |

## PR 상태
### 내가 만든 PR
| ID | 제목 | 상태 |
|----|------|------|
| [#28500](https://dev.azure.com/...) | feat: 로그인 개선 | 리뷰 대기 |

### 리뷰 요청받은 PR
| ID | 작성자 | 제목 |
|----|--------|------|
| [#28510](https://dev.azure.com/...) | Sangmin | fix: API 버그 |

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
        "text": "*Git 커밋*: {N}건 | *Jira*: {N}건 | *PR*: {N}건"
      }
    },
    {
      "type": "divider"
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*커밋*\n• `a1b2c3d` feat: 로그인 개선\n• `d4e5f6g` fix: 버그 수정"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Jira*\n• <https://imagoworks.atlassian.net/browse/D1-1234|D1-1234> 로그인 버그 수정 (작업 완료)\n• <https://imagoworks.atlassian.net/browse/D1-1235|D1-1235> API 변경 (개발 단계)"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*PR*\n• 생성: #28500 리뷰 대기\n• 리뷰 요청: #28510 (Sangmin)"
      }
    }
  ]
}
```

**전송:**
```bash
curl -X POST "$SLACK_WEBHOOK" \
  -H "Content-Type: application/json" \
  -d @webhook_payload.json
```

## 환경 변수

| 변수 | 필수 | 설명 |
|------|------|------|
| `JIRA_EMAIL` | O | Jira 계정 이메일 |
| `JIRA_API_TOKEN` | O | Jira API 토큰 |
| `SLACK_WEBHOOK` | O | Slack Incoming Webhook URL |
| `DENTBIRD_REPO` | X | dentbird-solutions 경로 (기본: ~/AzureRepos/dentbird-solutions) |

## 출력

1. **reports/{YYYY-MM-DD}.md** - 상세 요약 파일
2. **Slack 메시지** - 간략한 요약 (본인 DM)

## 주의사항

- Azure DevOps는 `az login` 상태여야 합니다
- Jira API 토큰은 https://id.atlassian.com/manage-profile/security/api-tokens 에서 생성
- Slack 웹훅 설정: https://api.slack.com/apps → Incoming Webhooks
