# burnout-radar

주간 Git 커밋 패턴을 분석하여 번아웃 위험도를 측정하고 Slack으로 리포트를 전송합니다.

## 사용법

```bash
/burnout-radar              # 분석 + Slack 전송
/burnout-radar --dry-run    # 분석만 (전송 안함)
```

## 실행 단계

### 1단계: 분석 기간 설정

지난 주 월요일 ~ 일요일 기준으로 분석합니다.

```bash
# macOS date 명령어 사용
# 지난 주 월요일 (현재 날짜에서 1주 전 월요일)
LAST_MONDAY=$(date -v-1w -v-mon +%Y-%m-%d)
# 지난 주 일요일
LAST_SUNDAY=$(date -v-1w -v-sun +%Y-%m-%d)

# 주차 계산 (ISO week number)
WEEK_NUM=$(date -v-1w +%Y-W%V)

echo "분석 기간: $LAST_MONDAY ~ $LAST_SUNDAY ($WEEK_NUM)"
```

### 2단계: Git 커밋 수집

프로젝트 저장소에서 지난 주 커밋을 수집합니다.

```bash
# 저장소 경로 설정 (SKILL.local.md에서 정의)
REPO_PATH="${BURNOUT_REPO:-$HOME/path/to/your-project}"

# Git author 설정 (SKILL.local.md에서 정의)
GIT_AUTHOR="${GIT_AUTHOR:-Your Name}"

# 타임존 설정 (한국 시간 기준)
TIMEZONE="${TIMEZONE:-Asia/Seoul}"

# 커밋 조회 (로컬 타임존 기준, 해시, 날짜, 시간, 요일, 메시지)
TZ="$TIMEZONE" git -C "$REPO_PATH" log \
  --since="$LAST_MONDAY 00:00:00" \
  --until="$LAST_SUNDAY 23:59:59" \
  --author="$GIT_AUTHOR" \
  --format="%H|%ad|%s" --date=format-local:'%Y-%m-%d|%H:%M|%u'
```

**출력 형식:**
```
해시|날짜|시간|요일번호|커밋메시지
abc123|2026-01-27|21:30|1|feat: 새 기능 추가
def456|2026-01-31|14:00|5|fix: 버그 수정
```

- `%u`: 요일 (1=월요일, 7=일요일)

### 3단계: 지표별 점수 계산

#### 3-1. 야근 지표 (Late Night Score)

```
시간대별 가중치:
- 19:00 ~ 20:59: 1점/건
- 21:00 ~ 22:59: 2점/건
- 23:00 ~ 05:59: 3점/건

야근 점수 = SUM(각 야근 커밋 * 해당 시간대 가중치)
```

#### 3-2. 주말 작업 지표 (Weekend Score)

```
요일별 가중치:
- 토요일 (6): 2점/건
- 일요일 (7): 3점/건

주말 점수 = (토요일 커밋 수 * 2) + (일요일 커밋 수 * 3)
```

#### 3-3. 커밋 품질 지표 (Commit Quality Score)

```
메시지 길이 점수:
- 30자 이상: 0점
- 20~29자: 1점
- 20자 미만: 3점

fix/wip 비율 점수:
- 20% 이하: 0점
- 20~40%: 1점
- 40% 초과: 3점

품질 점수 = 메시지 길이 점수 + fix/wip 비율 점수
```

#### 3-4. 시간 분포 지표 (Time Distribution Score)

```
비정상 시간대 정의:
- 09시 이전
- 19시 이후
- 점심시간 (12:00~13:00)

분포 점수 = (비정상 시간대 커밋 비율) * 10
```

### 4단계: 종합 점수 및 경고 수준 결정

```
번아웃 점수 = 야근 점수 + 주말 점수 + 품질 점수 + 분포 점수

경고 수준:
- 0 ~ 5점: 녹색 (정상) - "건강한 업무 패턴입니다"
- 6 ~ 15점: 노란색 (주의) - "야근/주말 작업이 늘고 있어요"
- 16점 이상: 빨간색 (위험) - "번아웃 위험! 휴식이 필요합니다"
```

### 5단계: 리포트 생성

**reports/burnout/{YYYY-Wnn}.md 형식:**

```markdown
# Burnout Radar - {YYYY-Wnn}

**분석 기간**: {시작일} ~ {종료일}
**종합 점수**: {N}점 ({수준})

---

## 지표별 분석

### 야근 지표
- 19~21시: {N}건
- 21~23시: {N}건
- 23시~06시: {N}건
- **점수**: {N}점

### 주말 작업
- 토요일: {N}건
- 일요일: {N}건
- **점수**: {N}점

### 커밋 품질
- 평균 메시지 길이: {N}자
- fix/wip 비율: {N}%
- **점수**: {N}점

### 시간 분포
- 정상 시간대 (09~19시, 점심 제외): {N}%
- 비정상 시간대: {N}%
- **점수**: {N}점

---

## 상세 커밋 목록

| 날짜 | 시간 | 요일 | 메시지 |
|------|------|------|--------|
| {날짜} | {시간} | {요일} | {메시지} |

---

## 제안

{경고 수준에 따른 제안 메시지}

---
생성: {HH:MM}
```

### 6단계: Slack 웹훅 전송 (--dry-run이 아닌 경우)

**Slack Block Kit 메시지 포맷:**

```json
{
  "blocks": [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": "Burnout Radar - {YYYY-Wnn}"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*종합 점수*: {N}점 / {수준}\n*분석 기간*: {시작일} ~ {종료일}"
      }
    },
    {
      "type": "divider"
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*야근 지표*\n커밋 {N}건 (19시 이후)\n점수: {N}점"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*주말 작업*\n토요일: {N}건, 일요일: {N}건\n점수: {N}점"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*커밋 품질*\n평균 메시지 길이: {N}자\nfix/wip 비율: {N}%\n점수: {N}점"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*시간 분포*\n정상 시간대 비율: {N}%\n점수: {N}점"
      }
    },
    {
      "type": "divider"
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*제안*\n{경고 수준별 제안 메시지}"
      }
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "상세 리포트: `reports/burnout/{YYYY-Wnn}.md`"
        }
      ]
    }
  ]
}
```

**경고 수준별 제안 메시지:**

| 수준 | 제안 메시지 |
|------|-------------|
| 녹색 | 건강한 업무 패턴을 유지하고 있어요. 이대로 계속해주세요! |
| 노란색 | 이번 주 야근/주말 작업이 늘었어요. 다음 주는 정시 퇴근을 목표로 해보세요. |
| 빨간색 | 번아웃 위험 신호가 감지되었습니다. 충분한 휴식이 필요합니다. 연차 사용을 고려해보세요. |

**전송:**
```bash
curl -s -X POST "$SLACK_WEBHOOK" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d @webhook_payload.json
```

## 환경 변수

| 변수 | 필수 | 설명 |
|------|------|------|
| `SLACK_WEBHOOK` | O | Slack Incoming Webhook URL |
| `BURNOUT_REPO` | X | 분석 대상 저장소 경로 |
| `GIT_AUTHOR` | X | Git author 이름/이메일 패턴 |

## 출력

1. **reports/burnout/{YYYY-Wnn}.md** - 상세 주간 리포트
2. **Slack 메시지** - 요약 리포트 (본인 DM)

## 커스터마이징

이 스킬을 본인 환경에 맞게 수정하세요:

1. **저장소 경로**: `BURNOUT_REPO` 환경변수 또는 SKILL.local.md에서 설정
2. **Git author**: `GIT_AUTHOR` 환경변수 또는 SKILL.local.md에서 설정
3. **점수 임계값**: 팀/개인 상황에 맞게 조정
