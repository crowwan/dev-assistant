# Dev Assistant - 개인 개발 업무 도우미

## 사용자 정보

- **이름**: Your Name
- **회사**: Your Company
- **팀**: Your Team
- **역할**: Developer

## 개요

**개인 업무 정리 도우미** - 하루 동안 한 일을 자동으로 수집하고 정리해서 개인 메시지로 알려줍니다.

## 핵심 기능

1. **일일 요약** - Git 커밋, Jira 이슈, PR 상태를 수집해서 요약
2. **개인 알림** - Slack DM으로 메시지 전송

## 스킬

### daily-summary (핵심)
```bash
/daily-summary              # 오늘 업무 요약 생성 + Slack 전송
/daily-summary --dry-run    # 요약만 생성 (전송 안함)
```

**수집 항목:**
- 오늘 내 Git 커밋 (프로젝트 저장소)
- 오늘 변경된 내 Jira 이슈
- 내 PR 상태 (생성/머지/리뷰)

## 환경 변수

```bash
# Jira API (필수)
export JIRA_EMAIL="your-email@your-company.com"
export JIRA_API_TOKEN="your-api-token"

# Slack 웹훅 (필수)
export SLACK_WEBHOOK="https://hooks.slack.com/services/..."

# Azure DevOps (az login으로 인증)
# 또는 GitHub (gh auth login으로 인증)

# 프로젝트 저장소 경로 (선택)
export PROJECT_REPO="~/path/to/your-project"
```

## 디렉토리

| 디렉토리 | 설명 |
|----------|------|
| `.claude/skills/` | Claude Code 스킬 정의 |
| `reports/` | 생성된 일일 요약 저장 |

## 링크 형식 (환경에 맞게 수정)

- **Jira**: `https://your-company.atlassian.net/browse/{KEY}`
- **PR (Azure DevOps)**: `https://dev.azure.com/YourOrg/your-project/_git/your-project/pullrequest/{ID}`
- **PR (GitHub)**: `https://github.com/your-org/your-project/pull/{ID}`

## 저장소 경로

- **프로젝트 저장소**: 환경변수 `PROJECT_REPO` 또는 스킬에서 직접 수정
