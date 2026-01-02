# Dev Assistant

개인 개발 업무 정리 도우미입니다. 하루 동안 한 일을 자동으로 수집해서 개인 메시지로 알려줍니다.

## 빠른 시작

```bash
# 1. 환경 변수 설정 (~/.zshrc에 추가)
export JIRA_EMAIL="your-email@imagoworks.ai"
export JIRA_API_TOKEN="your-jira-api-token"
export PERSONAL_TEAMS_WEBHOOK="https://..."

# 2. Azure DevOps 로그인
az login

# 3. 프로젝트 폴더에서 Claude Code 실행
cd ~/Works/personal/dev-assistant
claude

# 4. 일일 요약 실행
/daily-summary
```

## 설정 가이드

### 1. Jira API 토큰 생성

1. https://id.atlassian.com/manage-profile/security/api-tokens 접속
2. **Create API token** 클릭
3. 라벨 입력 (예: "dev-assistant")
4. 생성된 토큰 복사
5. `~/.zshrc`에 추가:
   ```bash
   export JIRA_EMAIL="your-email@imagoworks.ai"
   export JIRA_API_TOKEN="복사한-토큰"
   ```

### 2. Teams 개인 웹훅 설정

**방법 A: Power Automate (추천)**

개인 채팅으로 메시지를 보내려면 Power Automate를 사용합니다.

1. https://make.powerautomate.com 접속
2. **Create** > **Instant cloud flow** 선택
3. 트리거: **When a HTTP request is received** 선택
4. 액션 추가: **Microsoft Teams** > **Post message in a chat or channel**
   - Post as: Flow bot
   - Post in: Chat with Flow bot
   - Message: `@{triggerBody()?['text']}`
5. **Save** 후 HTTP POST URL 복사
6. `~/.zshrc`에 추가:
   ```bash
   export PERSONAL_TEAMS_WEBHOOK="복사한-URL"
   ```

**방법 B: 개인 채널 + Incoming Webhook**

1. Teams에서 개인용 팀 생성 (예: "My Workspace")
2. 채널 생성 (예: "Daily Summary")
3. 채널 설정 > **Connectors** > **Incoming Webhook**
4. 이름 입력 후 **Create**
5. 웹훅 URL 복사
6. `~/.zshrc`에 추가:
   ```bash
   export PERSONAL_TEAMS_WEBHOOK="복사한-URL"
   ```

### 3. Azure DevOps 로그인

```bash
# 로그인 (브라우저 열림)
az login

# 확인
az account show
```

### 4. dentbird-solutions 저장소 경로 (선택)

기본값: `~/AzureRepos/dentbird-solutions`

다른 경로라면 설정:
```bash
export DENTBIRD_REPO="/path/to/dentbird-solutions"
```

## 사용법

```bash
# 일일 요약 생성 + Teams 전송
/daily-summary

# 요약만 생성 (전송 안함)
/daily-summary --dry-run
```

## 출력 예시

### reports/2026-01-02.md

```markdown
# 2026-01-02 (금) 업무 요약

## Git 커밋 (3건)
- `a1b2c3d` feat(cloud-desktop): 로그인 페이지 UI 개선
- `d4e5f6g` fix(embed-modules): 다이얼로그 닫힘 버그 수정
- `h7i8j9k` refactor: 불필요한 import 정리

## Jira 이슈 (2건)
| 키 | 제목 | 상태 |
|----|------|------|
| D1-1234 | 로그인 버그 수정 | 작업 완료 |
| D1-1235 | API 응답 포맷 변경 | 개발 단계 |

## PR 상태
### 내가 만든 PR (1건)
| ID | 제목 | 상태 |
|----|------|------|
| #28500 | feat: 로그인 개선 | 리뷰 대기 |

### 리뷰 요청받은 PR (2건)
| ID | 작성자 | 제목 |
|----|--------|------|
| #28510 | Sangmin | fix: API 버그 |
| #28511 | Adam | feat: 새 기능 |
```

### Teams 메시지

```
📊 2026-01-02 업무 요약

Git 커밋: 3건 | Jira: 2건 | PR: 1건 생성, 2건 리뷰 대기

✅ 완료: D1-1234 로그인 버그 수정
🔄 진행: D1-1235 API 응답 포맷 변경
⏳ 리뷰 대기: PR #28500
```

## 자동화 (선택)

매일 퇴근 시간에 자동 실행하려면:

### launchd (macOS)

`~/Library/LaunchAgents/com.dev-assistant.daily.plist`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.dev-assistant.daily</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>-c</string>
        <string>cd ~/Works/personal/dev-assistant && claude -p "/daily-summary"</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>18</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>
    <key>StandardOutPath</key>
    <string>/tmp/dev-assistant.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/dev-assistant.log</string>
</dict>
</plist>
```

등록:
```bash
launchctl load ~/Library/LaunchAgents/com.dev-assistant.daily.plist
```

## 확장 아이디어

- `/my-prs` - 내 PR 상태만 빠르게 확인
- `/weekly-summary` - 주간 요약 생성
- `/standup` - 스탠드업 미팅용 요약
