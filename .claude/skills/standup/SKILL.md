# standup

아침 스탠드업 메시지를 자동 생성해서 Slack으로 전송합니다.
수집된 정보를 분석하여 오늘의 작업 우선순위와 제약사항도 제안합니다.

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

---

## Part A: API 데이터 수집

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

#### 진행 중인 Jira 이슈 (상세 정보 포함)

**JQL:**
```
project = YOUR_PROJECT AND assignee = currentUser() AND status = "In Progress"
```

**API 호출 (상세 필드 포함):**
```bash
curl -s -X POST \
  "https://your-company.atlassian.net/rest/api/3/search/jql" \
  -H "Authorization: Basic $(printf '%s' "$JIRA_EMAIL:$JIRA_API_TOKEN" | base64)" \
  -H "Content-Type: application/json" \
  -d '{"jql":"project = YOUR_PROJECT AND assignee = currentUser() AND status = \"In Progress\"","fields":["key","summary","priority","created","updated","issuelinks"]}'
```

**파싱할 정보:**
- `key`: 이슈 키 (PROJ-XXX)
- `summary`: 제목
- `priority.name`: 우선순위 (Highest, High, Medium, Low, Lowest)
- `created`: 생성일 → 며칠째 진행 중인지 계산
- `issuelinks`: 연결된 이슈

**출력 형식:**
```
• <링크|PROJ-123> 이슈 제목 (🔴 High, 3일째)
  └ implements RELATED-456
```

#### 내가 만든 PR (리뷰 대기)

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

#### 내가 리뷰할 PR

**Azure DevOps:**
```bash
az repos pr list \
  --organization "https://dev.azure.com/YourOrg" \
  --project "your-project" \
  --status active \
  -o json | jq '.[] | select(.reviewers[]?.uniqueName == "your-email")'
```

**GitHub:**
```bash
gh pr list --search "review-requested:@me" --json number,title,author
```

---

## Part B: 휴가/부재 정보 수집 (선택사항)

### 4단계: 휴가/부재 정보 수집 (Chrome 연동)

Chrome 연동이 가능한 경우, 휴가/근태 시스템에서 오늘 부재자를 확인합니다.

```
1. 탭 컨텍스트 확인
   mcp__claude-in-chrome__tabs_context_mcp

2. 근태 시스템 홈 이동
   mcp__claude-in-chrome__navigate → https://your-hr-system.com

3. 대기 (로딩)
   mcp__claude-in-chrome__computer (wait: 3초)

4. 스크린샷으로 로그인 상태 확인
   mcp__claude-in-chrome__computer (screenshot)
   - 로그인 폼이 보이면 (이메일/비밀번호 입력란) → 로그인 안 됨
   - 홈 화면이 보이면 → 로그인 됨

5-A. 로그인 안 됨:
   - 휴가 정보 수집 스킵
   - 메시지에 표시: "👥 오늘 부재: (로그인 필요 - 수동 확인)"

5-B. 로그인 됨 → 구성원 근무 페이지로 이동:
   a. 왼쪽 메뉴에서 "근무" 클릭
      mcp__claude-in-chrome__find → "근무" 메뉴
      mcp__claude-in-chrome__computer (left_click)

   b. "구성원 근무" 클릭
      mcp__claude-in-chrome__find → "구성원 근무"
      mcp__claude-in-chrome__computer (left_click)

   c. 대기 (페이지 로딩)
      mcp__claude-in-chrome__computer (wait: 2초)

   d. 스크린샷
      mcp__claude-in-chrome__computer (screenshot)

   e. 휴가/부재 정보 파싱
      - "휴가", "연차", "반차", "외근", "재택" 등 상태
      - 팀원만 필터링
```

**출력 형식:**
```
👥 오늘 부재
• 홍길동 - 연차
• 김철수 - 오전 반차
```

**(로그인 안 됨 시):**
```
👥 오늘 부재: (로그인 필요 - 수동 확인)
```

---

## Part C: 조언 생성

### 5단계: 수집된 데이터 분석 및 조언 생성

수집된 정보를 바탕으로 오늘의 작업 우선순위와 제약사항을 분석합니다.

#### 분석 기준

| 분석 항목 | 조건 | 조언 |
|----------|------|------|
| **긴급 이슈** | priority = Highest/High | 🔴 오늘 우선 처리 필요 |
| **오래된 이슈** | 진행 중 5일 이상 | ⚠️ 블로커 확인 필요, 도움 요청 고려 |
| **부재 영향** | 부재자가 PR 리뷰어 | ⏳ 리뷰 지연 예상, 다른 리뷰어 지정 고려 |
| **빠른 작업** | PR 리뷰 1-2건만 남음 | ⚡ 리마인더 보내면 빨리 머지 가능 |
| **리뷰 대기** | 내 PR이 2일 이상 대기 | 📢 리뷰어에게 리마인더 필요 |
| **리뷰 요청** | 리뷰할 PR 있음 | 👀 먼저 리뷰하면 상호 리뷰 기대 |

#### 조언 생성 로직

```
1. 긴급 이슈 확인
   - Highest/High 우선순위 이슈가 있으면 → "🔴 {이슈}가 긴급 → 오늘 마무리 목표"

2. 오래된 이슈 확인
   - 5일 이상 진행 중인 이슈 → "⚠️ {이슈}가 {N}일째 → 블로커 있는지 확인"

3. 부재 영향 분석
   - 부재자 목록과 PR 리뷰어 매칭
   - 부재자가 리뷰어인 PR → "⏳ {부재자}님 휴가 → {PR} 리뷰 지연 예상"

4. 빠른 완료 가능 작업
   - 리뷰 1-2건만 남은 내 PR → "⚡ {PR} 리뷰 거의 완료 → 리마인더로 빨리 머지"
   - 작은 이슈 (제목에 fix, typo, minor 포함) → "✅ {이슈}는 간단 → 오전에 빠르게 처리"

5. 작업 순서 제안
   - 위 분석을 종합하여 추천 순서 생성:
     1순위: 긴급 이슈
     2순위: 빠르게 끝낼 수 있는 작업
     3순위: 리뷰할 PR (상호 리뷰 기대)
     4순위: 일반 이슈
```

#### 조언 출력 형식

```
💡 오늘의 제안

1. 🔴 PROJ-124가 High + 3일째 → 오늘 집중해서 마무리
2. ⚡ PR #46 리뷰 1건만 남음 → 리뷰어에게 리마인더
3. ⏳ 홍길동님 휴가 → PR #47 리뷰 내일로 지연 예상
4. ✅ PROJ-125 (typo fix)는 간단 → 오전에 빠르게 처리
5. 👀 PR #48 리뷰 먼저 하면 → 내 PR 리뷰도 빨리 받을 수 있음
```

---

## Part D: 메시지 생성 및 전송

### 6단계: Slack 메시지 전송

**메시지 포맷:**

```json
{
  "blocks": [
    {"type": "header", "text": {"type": "plain_text", "text": "Daily Standup - {YYYY-MM-DD}"}},
    {"type": "section", "text": {"type": "mrkdwn", "text": "*👥 오늘 부재*\n• ..."}},
    {"type": "divider"},
    {"type": "section", "text": {"type": "mrkdwn", "text": "*📅 Yesterday*\n• ..."}},
    {"type": "divider"},
    {"type": "section", "text": {"type": "mrkdwn", "text": "*📌 Today*\n*진행 중인 이슈:*\n• ...\n\n*내 PR:*\n• ...\n\n*리뷰할 PR:*\n• ..."}},
    {"type": "divider"},
    {"type": "section", "text": {"type": "mrkdwn", "text": "*💡 오늘의 제안*\n1. 🔴 ...\n2. ⚡ ...\n3. ⏳ ..."}}
  ]
}
```

**전송:**
```bash
curl -X POST "$SLACK_WEBHOOK" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d @standup_payload.json
```

---

## 환경 변수

| 변수 | 필수 | 설명 |
|------|------|------|
| `JIRA_EMAIL` | O | Jira 계정 이메일 |
| `JIRA_API_TOKEN` | O | Jira API 토큰 |
| `SLACK_WEBHOOK` | O | Slack Incoming Webhook URL |
| `PROJECT_REPO` | X | 프로젝트 저장소 경로 |

## 우선순위 이모지 매핑

| Priority | 이모지 |
|----------|--------|
| Highest | 🔴 |
| High | 🟠 |
| Medium | 🟡 |
| Low | 🟢 |
| Lowest | ⚪ |

## 출력 예시

```
Daily Standup - 2026-01-02

👥 오늘 부재
• 홍길동 - 연차

📅 Yesterday
• `a1b2c3d` feat: 사용자 프로필 API 추가
• PROJ-123 로그인 버그 수정 (완료)
• PR #45 머지됨

📌 Today
진행 중인 이슈:
• PROJ-124 회원가입 플로우 개선 (🟠 High, 3일째)
  └ implements RELATED-789
• PROJ-125 결제 연동 (🟡 Medium, 1일째)

내 PR (리뷰 대기):
• #46 feat: 결제 API

리뷰할 PR:
• #47 fix: 버그 수정 (김철수)

💡 오늘의 제안
1. 🔴 PROJ-124가 High + 3일째 → 오늘 집중해서 마무리
2. ⚡ PR #46 리뷰 1건만 남음 → 리마인더 보내기
3. ⏳ 홍길동님 휴가 → PR #47 리뷰 내일로 지연
4. ✅ PROJ-125는 간단 → 오전에 빠르게 처리
5. 👀 PR #47 먼저 리뷰 → 내 PR 리뷰도 빨리 받을 수 있음
```

## 커스터마이징

이 스킬을 본인 환경에 맞게 수정하세요:

1. **Jira 프로젝트 키**: `YOUR_PROJECT` → 실제 프로젝트 키
2. **Jira URL**: `your-company.atlassian.net` → 실제 URL
3. **Git author**: `Your Name` → 본인 이름/이메일
4. **Azure DevOps/GitHub**: 사용하는 플랫폼에 맞게 선택
5. **휴가 시스템**: 사용하는 HR 시스템 URL로 변경
6. **팀원 목록**: 본인 팀원 목록으로 수정
