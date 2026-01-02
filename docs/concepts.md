# Dev Assistant 개념 가이드

이 문서는 dev-assistant 프로젝트에서 사용된 기술과 개념을 설명합니다.

---

## 목차

1. [전체 구조](#1-전체-구조)
2. [Claude Code 스킬](#2-claude-code-스킬)
3. [launchd (macOS 스케줄러)](#3-launchd-macos-스케줄러)
4. [웹훅 (Webhook)](#4-웹훅-webhook)
5. [환경 변수](#5-환경-변수)
6. [자동화 흐름](#6-자동화-흐름)
7. [확장 방법](#7-확장-방법)

---

## 1. 전체 구조

```
dev-assistant/
├── .claude/                      # Claude Code 설정
│   ├── settings.local.json       # 스킬 등록 설정
│   └── skills/                   # 스킬 정의 폴더
│       └── daily-summary/
│           └── SKILL.md          # 스킬 실행 가이드
│
├── scripts/                      # 자동화 스크립트
│   ├── daily-summary.sh          # 실행 스크립트
│   └── com.dev-assistant.daily.plist  # launchd 설정
│
├── reports/                      # 생성된 보고서
│   └── 2026-01-02.md
│
├── logs/                         # 실행 로그
│   ├── daily-summary.log
│   └── launchd.log
│
├── CLAUDE.md                     # 프로젝트 컨텍스트
└── README.md                     # 사용 가이드
```

### 각 폴더의 역할

| 폴더 | 역할 | 누가 사용? |
|------|------|-----------|
| `.claude/` | Claude Code가 읽는 설정 | Claude Code |
| `scripts/` | 자동 실행 스크립트 | macOS (launchd) |
| `reports/` | 생성된 일일 보고서 | 사용자 |
| `logs/` | 실행 기록 | 디버깅용 |

---

## 2. Claude Code 스킬

### 스킬이란?

**스킬 = Claude Code에게 가르치는 "명령어"**

`/daily-summary`라고 입력하면 Claude Code가 SKILL.md 파일을 읽고 그 안의 지침대로 작업을 수행합니다.

### 스킬 구조

```
.claude/
├── settings.local.json      # 스킬 목록 등록
└── skills/
    └── daily-summary/
        └── SKILL.md         # 실행 방법 정의
```

### settings.local.json

```json
{
  "skills": {
    "daily-summary": {
      "type": "prompt",
      "path": ".claude/skills/daily-summary/SKILL.md",
      "description": "하루 업무 요약 (user)"
    }
  }
}
```

| 필드 | 설명 |
|------|------|
| `type` | `"prompt"` = 텍스트 기반 스킬 |
| `path` | SKILL.md 파일 경로 |
| `description` | 스킬 설명 (어디서 정의했는지: user/project/managed) |

### SKILL.md 작성법

SKILL.md는 Claude Code에게 "이렇게 해라"라고 알려주는 문서입니다.

```markdown
# 스킬 이름

스킬 설명

## 사용법
/스킬이름 [옵션]

## 실행 단계

### 1단계: 무엇을 한다
설명...

### 2단계: 다음에 무엇을 한다
설명...

## 환경 변수
필요한 환경 변수 목록
```

**핵심**: Claude Code는 이 문서를 읽고 "아, 이렇게 하면 되는구나" 하고 이해합니다. 코드가 아니라 **자연어 지침**입니다.

---

## 3. launchd (macOS 스케줄러)

### launchd란?

**launchd = macOS의 작업 스케줄러**

Windows의 "작업 스케줄러", Linux의 "cron"과 같은 역할입니다.
"매일 18시에 이 스크립트를 실행해라"라고 설정하면 자동으로 실행해줍니다.

### 구성 요소

```
[plist 파일] ──등록──> [launchd] ──실행──> [스크립트]
     │                    │
     │                    └── macOS 시스템 서비스
     │
     └── XML 형식의 설정 파일
```

### plist 파일 구조

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" ...>
<plist version="1.0">
<dict>
    <!-- 고유 이름 (필수) -->
    <key>Label</key>
    <string>com.dev-assistant.daily</string>

    <!-- 실행할 명령 -->
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>/경로/daily-summary.sh</string>
    </array>

    <!-- 실행 시간 (매일 18:00) -->
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>18</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>

    <!-- 로그 파일 -->
    <key>StandardOutPath</key>
    <string>/경로/logs/launchd.log</string>
</dict>
</plist>
```

### 주요 설정 옵션

| 키 | 설명 | 예시 |
|----|------|------|
| `Label` | 작업 고유 이름 | `com.dev-assistant.daily` |
| `ProgramArguments` | 실행할 명령 | `["/bin/bash", "script.sh"]` |
| `StartCalendarInterval` | 실행 시간 | `Hour: 18, Minute: 0` |
| `StartInterval` | N초마다 실행 | `3600` (1시간) |
| `RunAtLoad` | 등록 시 즉시 실행 | `true/false` |
| `StandardOutPath` | stdout 로그 경로 | `/path/to/log` |

### launchd 명령어

```bash
# 등록 (활성화)
launchctl load ~/Library/LaunchAgents/com.dev-assistant.daily.plist

# 해제 (비활성화)
launchctl unload ~/Library/LaunchAgents/com.dev-assistant.daily.plist

# 목록 확인
launchctl list | grep dev-assistant

# 즉시 실행 (테스트)
launchctl start com.dev-assistant.daily
```

### 파일 위치

| 위치 | 용도 |
|------|------|
| `~/Library/LaunchAgents/` | 사용자 로그인 시 실행 (개인용) |
| `/Library/LaunchAgents/` | 모든 사용자용 |
| `/Library/LaunchDaemons/` | 시스템 부팅 시 실행 (root) |

우리는 `~/Library/LaunchAgents/`에 심볼릭 링크로 등록했습니다.

---

## 4. 웹훅 (Webhook)

### 웹훅이란?

**웹훅 = "이 URL로 데이터를 보내면 알림이 간다"**

일반적인 API 호출과 반대 방향입니다:
- 일반 API: 내가 서버에 "데이터 줘" 요청
- 웹훅: 내가 서버에 "이 데이터 받아" 전송 → 서버가 알림 처리

```
[내 스크립트] ──POST 요청──> [Slack 웹훅 URL] ──> [Slack 채널에 메시지]
```

### Slack Incoming Webhook

```bash
# 웹훅 URL 형식
https://hooks.slack.com/services/T.../B.../...
                         │      │   │
                         │      │   └── 비밀 토큰
                         │      └── 봇 ID
                         └── 팀 ID

# 메시지 전송
curl -X POST "$SLACK_WEBHOOK" \
  -H "Content-Type: application/json" \
  -d '{"text": "안녕하세요!"}'
```

### 메시지 형식

**단순 텍스트:**
```json
{
  "text": "메시지 내용"
}
```

**블록 형식 (리치 메시지):**
```json
{
  "blocks": [
    {
      "type": "header",
      "text": {"type": "plain_text", "text": "제목"}
    },
    {
      "type": "section",
      "text": {"type": "mrkdwn", "text": "*굵게* _기울임_"}
    }
  ]
}
```

### 다른 서비스의 웹훅

| 서비스 | 웹훅 형식 |
|--------|----------|
| Slack | Incoming Webhook |
| Teams | Incoming Webhook (채널만), Power Automate (DM) |
| Discord | Webhook URL |
| Telegram | Bot API |

---

## 5. 환경 변수

### 환경 변수란?

**환경 변수 = 프로그램에 전달하는 설정값**

비밀번호, API 키 같은 민감한 정보를 코드에 직접 쓰지 않고 환경 변수로 분리합니다.

```bash
# 설정
export SLACK_WEBHOOK="https://hooks.slack.com/..."

# 사용
curl -X POST "$SLACK_WEBHOOK" ...
```

### ~/.zshrc에 설정하는 이유

```
[터미널 시작] ──> [~/.zshrc 실행] ──> [환경 변수 로드됨]
```

`~/.zshrc`는 터미널(zsh)이 시작될 때 자동으로 실행되는 파일입니다.
여기에 환경 변수를 설정하면 항상 사용할 수 있습니다.

### 이 프로젝트에서 사용하는 환경 변수

| 변수 | 용도 | 예시 |
|------|------|------|
| `SLACK_WEBHOOK` | Slack 알림 전송 | `https://hooks.slack.com/...` |
| `JIRA_EMAIL` | Jira API 인증 | `user@company.com` |
| `JIRA_API_TOKEN` | Jira API 인증 | `ATATT3x...` |

### 환경 변수 확인 방법

```bash
# 특정 변수 확인
echo $SLACK_WEBHOOK

# 설정 여부만 확인
echo ${SLACK_WEBHOOK:+설정됨}

# 모든 환경 변수 보기
env | grep SLACK
```

---

## 6. 자동화 흐름

### 전체 흐름도

```
[매일 18:00]
     │
     ▼
[launchd가 감지]
     │
     ▼
[daily-summary.sh 실행]
     │
     ├── 1. ~/.zshrc에서 환경 변수 로드
     │
     ├── 2. 주말인지 체크 → 주말이면 종료
     │
     ├── 3. Claude Code 실행
     │        │
     │        ▼
     │   [Claude Code가 /daily-summary 스킬 실행]
     │        │
     │        ├── Git 커밋 조회
     │        ├── Jira API 호출
     │        ├── Azure DevOps API 호출
     │        ├── reports/YYYY-MM-DD.md 생성
     │        └── Slack 웹훅으로 메시지 전송
     │
     └── 4. 결과 로깅
              │
              ▼
         [logs/daily-summary.log]
```

### 각 단계 설명

#### 1단계: launchd가 스크립트 실행

```xml
<key>StartCalendarInterval</key>
<dict>
    <key>Hour</key><integer>18</integer>
    <key>Minute</key><integer>0</integer>
</dict>
```

매일 18:00이 되면 launchd가 `daily-summary.sh`를 실행합니다.

#### 2단계: 스크립트가 환경 준비

```bash
# 환경 변수 로드
source ~/.zshrc

# 주말 체크
DAY_OF_WEEK=$(date +%u)
if [ "$DAY_OF_WEEK" -ge 6 ]; then
  exit 0  # 주말이면 종료
fi
```

#### 3단계: Claude Code 실행

```bash
claude -p "/daily-summary" \
  --allowedTools "Bash(git:*)" "Bash(curl:*)" ... \
  --max-turns 50
```

| 옵션 | 설명 |
|------|------|
| `-p "명령"` | 비대화형 모드로 명령 실행 |
| `--allowedTools` | 승인 없이 사용할 수 있는 도구 |
| `--max-turns` | 최대 실행 횟수 |

#### 4단계: 결과 전송

Claude Code가 Slack 웹훅으로 요약 메시지를 전송합니다.

---

## 7. 확장 방법

### 새 스킬 추가하기

1. **폴더 생성**
```bash
mkdir -p .claude/skills/my-new-skill
```

2. **SKILL.md 작성**
```markdown
# my-new-skill

설명...

## 실행 단계
### 1단계: ...
```

3. **settings.local.json에 등록**
```json
{
  "skills": {
    "my-new-skill": {
      "type": "prompt",
      "path": ".claude/skills/my-new-skill/SKILL.md",
      "description": "새 스킬 설명"
    }
  }
}
```

4. **테스트**
```bash
claude
/my-new-skill
```

### 실행 시간 변경하기

`scripts/com.dev-assistant.daily.plist` 수정:

```xml
<!-- 오전 9시로 변경 -->
<key>StartCalendarInterval</key>
<dict>
    <key>Hour</key>
    <integer>9</integer>
    <key>Minute</key>
    <integer>0</integer>
</dict>
```

변경 후 재등록:
```bash
launchctl unload ~/Library/LaunchAgents/com.dev-assistant.daily.plist
launchctl load ~/Library/LaunchAgents/com.dev-assistant.daily.plist
```

### 여러 시간에 실행하기

```xml
<!-- 9시, 18시 두 번 실행 -->
<key>StartCalendarInterval</key>
<array>
    <dict>
        <key>Hour</key><integer>9</integer>
        <key>Minute</key><integer>0</integer>
    </dict>
    <dict>
        <key>Hour</key><integer>18</integer>
        <key>Minute</key><integer>0</integer>
    </dict>
</array>
```

### 다른 알림 채널 추가

**macOS 알림 추가:**
```bash
# terminal-notifier 설치
brew install terminal-notifier

# 스크립트에 추가
terminal-notifier -title "업무 요약" -message "Slack으로 전송 완료"
```

**이메일 추가:**
```bash
# macOS 기본 mail 명령
echo "요약 내용" | mail -s "업무 요약" your@email.com
```

---

## 용어 정리

| 용어 | 설명 |
|------|------|
| Claude Code | Anthropic의 CLI AI 도구 |
| 스킬 (Skill) | Claude Code에 정의하는 커스텀 명령어 |
| launchd | macOS의 시스템 작업 스케줄러 |
| plist | Property List, macOS 설정 파일 형식 (XML) |
| 웹훅 (Webhook) | URL로 데이터를 보내 알림을 트리거하는 방식 |
| 환경 변수 | 프로그램에 전달하는 설정값 |
| API 토큰 | API 인증에 사용하는 비밀 키 |

---

## 문제 해결

### 자동 실행이 안 될 때

```bash
# 1. launchd 등록 확인
launchctl list | grep dev-assistant

# 2. 로그 확인
cat ~/Works/personal/dev-assistant/logs/launchd.log
cat ~/Works/personal/dev-assistant/logs/daily-summary.log

# 3. 수동 테스트
~/Works/personal/dev-assistant/scripts/daily-summary.sh
```

### 환경 변수가 인식 안 될 때

launchd는 ~/.zshrc를 자동으로 로드하지 않습니다.
스크립트에서 명시적으로 `source ~/.zshrc`를 해야 합니다.

### Slack 메시지가 안 갈 때

```bash
# 웹훅 테스트
curl -X POST "$SLACK_WEBHOOK" \
  -H "Content-Type: application/json" \
  -d '{"text":"테스트"}'

# 응답이 "ok"면 정상
# "invalid_payload"면 JSON 형식 확인
```
