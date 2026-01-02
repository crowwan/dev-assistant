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

## 로컬 설정 (본인 환경에 맞게 커스터마이징)

이 저장소는 **템플릿**입니다. 실제 사용하려면 로컬 설정 파일을 만들어야 합니다.

### 왜 로컬 파일이 필요한가?

| 파일 | GitHub (템플릿) | 로컬 (실제 사용) |
|------|----------------|-----------------|
| SKILL.md | `your-company.atlassian.net` | 실제 Jira URL |
| plist | `/path/to/dev-assistant` | 실제 경로 |

로컬 파일은 `.local` 접미사를 붙이면 자동으로 gitignore됩니다.

### 설정 방법

#### 1. 스킬 로컬 버전 생성

```bash
# 템플릿 복사
cp .claude/skills/daily-summary/SKILL.md \
   .claude/skills/daily-summary/SKILL.local.md

# 본인 환경에 맞게 수정
# - Jira URL: your-company.atlassian.net → 실제 URL
# - 프로젝트 키: YOUR_PROJECT → 실제 프로젝트 키
# - Git author: Your Name → 본인 이름/이메일
# - Azure DevOps/GitHub 설정
```

#### 2. settings.local.json 생성

```bash
# .claude/settings.local.json 생성 (이미 gitignore됨)
cat > .claude/settings.local.json << 'EOF'
{
  "skills": {
    "daily-summary": {
      "type": "prompt",
      "path": ".claude/skills/daily-summary/SKILL.local.md",
      "description": "하루 업무 요약 (user)"
    }
  }
}
EOF
```

#### 3. launchd 로컬 버전 생성 (자동화 사용 시)

```bash
# 템플릿 복사
cp scripts/com.dev-assistant.daily.plist \
   scripts/com.dev-assistant.daily.local.plist

# 경로 수정
# - /path/to/dev-assistant → 실제 경로
# - /Users/your-username → 실제 홈 디렉토리

# launchd에 로컬 버전으로 등록
ln -sf $(pwd)/scripts/com.dev-assistant.daily.local.plist \
       ~/Library/LaunchAgents/com.dev-assistant.daily.plist

launchctl load ~/Library/LaunchAgents/com.dev-assistant.daily.plist
```

### 파일 구조 (설정 후)

```
dev-assistant/
├── .claude/
│   ├── settings.local.json          # ← 로컬 (gitignore)
│   └── skills/daily-summary/
│       ├── SKILL.md                  # 템플릿 (GitHub)
│       └── SKILL.local.md            # ← 로컬 (gitignore)
├── scripts/
│   ├── com.dev-assistant.daily.plist       # 템플릿 (GitHub)
│   └── com.dev-assistant.daily.local.plist # ← 로컬 (gitignore)
└── reports/                          # ← 로컬 (gitignore)
```

### gitignore 패턴

```
*.local.md
*.local.plist
*.local.sh
reports/
.claude/settings.local.json
```

자세한 내용은 `docs/concepts.md` 참조.

## 확장 아이디어

- `/my-prs` - 내 PR 상태만 빠르게 확인
- `/weekly-summary` - 주간 요약 생성
- `/standup` - 스탠드업 미팅용 요약

## 라이선스

MIT
