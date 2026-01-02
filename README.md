# Dev Assistant

개인 개발 업무 정리 도우미입니다. 하루 동안 한 일을 자동으로 수집해서 개인 메시지로 알려줍니다.

## 기능

- **Git 커밋 수집**: 오늘 작성한 커밋 목록
- **Jira 이슈 수집**: 오늘 업데이트된 담당 이슈
- **PR 상태 확인**: 내가 만든 PR + 리뷰 요청받은 PR
- **Slack 알림**: 요약을 Slack DM으로 전송

## 빠른 시작

```bash
# 1. 환경 변수 설정 (~/.zshrc에 추가)
export JIRA_EMAIL="your-email@your-company.com"
export JIRA_API_TOKEN="your-jira-api-token"
export SLACK_WEBHOOK="https://hooks.slack.com/services/..."

# 2. Azure DevOps 또는 GitHub 로그인
az login          # Azure DevOps
gh auth login     # GitHub

# 3. 프로젝트 폴더에서 Claude Code 실행
cd ~/path/to/dev-assistant
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
   export JIRA_EMAIL="your-email@your-company.com"
   export JIRA_API_TOKEN="복사한-토큰"
   ```

### 2. Slack Incoming Webhook 설정

1. https://api.slack.com/apps 접속
2. **Create New App** > **From scratch**
3. 앱 이름 입력, Workspace 선택
4. **Incoming Webhooks** > **Activate** → On
5. **Add New Webhook to Workspace** 클릭
6. 채널 선택 (Slackbot = 본인 DM)
7. Webhook URL 복사
8. `~/.zshrc`에 추가:
   ```bash
   export SLACK_WEBHOOK="복사한-URL"
   ```

### 3. Git 플랫폼 로그인

**Azure DevOps:**
```bash
az login
az account show  # 확인
```

**GitHub:**
```bash
gh auth login
gh auth status  # 확인
```

### 4. 프로젝트 저장소 경로 (선택)

```bash
export PROJECT_REPO="~/path/to/your-project"
```

## 사용법

```bash
# 일일 요약 생성 + Slack 전송
/daily-summary

# 요약만 생성 (전송 안함)
/daily-summary --dry-run
```

## 출력 예시

### reports/2026-01-02.md

```markdown
# 2026-01-02 (금) 업무 요약

## Git 커밋 (3건)
- `a1b2c3d` feat(module): 새 기능 추가
- `d4e5f6g` fix(component): 버그 수정
- `h7i8j9k` refactor: 코드 정리

## Jira 이슈 (2건)
| 키 | 제목 | 상태 |
|----|------|------|
| PROJ-1234 | 로그인 버그 수정 | 완료 |
| PROJ-1235 | API 응답 변경 | 진행 중 |

## PR 상태
### 내가 만든 PR (1건)
| ID | 제목 | 상태 |
|----|------|------|
| #123 | feat: 새 기능 | 리뷰 대기 |

### 리뷰 요청받은 PR (2건)
| ID | 작성자 | 제목 |
|----|--------|------|
| #456 | 동료A | fix: 버그 수정 |
| #789 | 동료B | feat: 기능 추가 |
```

### Slack 메시지

```
📊 2026-01-02 업무 요약

Git 커밋: 3건 | Jira: 2건 | PR: 1건 생성, 2건 리뷰 대기

✅ 완료: PROJ-1234 로그인 버그 수정
🔄 진행: PROJ-1235 API 응답 변경
⏳ 리뷰 대기: PR #123
```

## 자동화 (선택)

매일 퇴근 시간에 자동 실행하려면 `scripts/` 폴더의 launchd 설정을 사용하세요.

```bash
# plist 파일 경로 수정 후
ln -sf /path/to/dev-assistant/scripts/com.dev-assistant.daily.plist \
       ~/Library/LaunchAgents/com.dev-assistant.daily.plist

# 등록
launchctl load ~/Library/LaunchAgents/com.dev-assistant.daily.plist

# 확인
launchctl list | grep dev-assistant
```

## 커스터마이징

본인 환경에 맞게 수정이 필요합니다:

1. **SKILL.md**: Jira 프로젝트 키, URL, Git author 등
2. **plist**: 실행 시간, 스크립트 경로
3. **daily-summary.sh**: 환경 변수, 경로

자세한 내용은 `docs/concepts.md` 참조.

## 확장 아이디어

- `/my-prs` - 내 PR 상태만 빠르게 확인
- `/weekly-summary` - 주간 요약 생성
- `/standup` - 스탠드업 미팅용 요약

## 라이선스

MIT
