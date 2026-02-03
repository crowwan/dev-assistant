# Burnout Radar - 주간 번아웃 감지 리포트

**작성일**: 2026-02-03

## 문제 정의

### AS-IS
- 야근, 주말 작업이 누적되어도 인지하지 못함
- 번아웃 징후를 객관적으로 파악할 방법이 없음
- 스스로 쉬어야 할 타이밍을 놓침

### TO-BE
- Git 커밋 패턴 분석으로 번아웃 지표 자동 감지
- 매주 월요일 아침 Slack DM으로 주간 리포트 수신
- 경고 수준에 따른 시각적 알림 및 휴식 제안

---

## 감지 지표 설계

### 1. 야근 지표 (Late Night Score)

| 시간대 | 가중치 | 설명 |
|--------|--------|------|
| 19:00 ~ 20:59 | 1 | 약간의 야근 |
| 21:00 ~ 22:59 | 2 | 늦은 야근 |
| 23:00 ~ 05:59 | 3 | 심야 작업 (위험) |

**산출 방식**:
```
야근 점수 = SUM(각 야근 커밋 * 해당 시간대 가중치)
```

### 2. 주말 작업 지표 (Weekend Score)

| 구분 | 점수 | 설명 |
|------|------|------|
| 토요일 커밋 | 2점/건 | 주말 작업 |
| 일요일 커밋 | 3점/건 | 휴일 작업 (더 심각) |

**산출 방식**:
```
주말 점수 = (토요일 커밋 수 * 2) + (일요일 커밋 수 * 3)
```

### 3. 커밋 품질 지표 (Commit Quality)

| 측정 항목 | 정상 범위 | 경고 신호 |
|-----------|-----------|-----------|
| 평균 메시지 길이 | 30자 이상 | 20자 미만 (급하게 작업) |
| "fix", "wip" 비율 | 20% 이하 | 40% 이상 (응급 패치 반복) |

**산출 방식**:
```
품질 점수 = (평균 메시지 길이 점수) + (fix/wip 비율 점수)
- 메시지 길이: 30자+ = 0점, 20~29자 = 1점, 20자 미만 = 3점
- fix/wip 비율: 20% 이하 = 0점, 20~40% = 1점, 40% 이상 = 3점
```

### 4. 작업 시간 분포 (Time Distribution)

| 측정 항목 | 정상 | 경고 |
|-----------|------|------|
| 집중 시간대 | 10:00~18:00 | 비정상 시간대 비율 높음 |
| 점심시간 커밋 | 없음 | 12:00~13:00 커밋 있음 |

**산출 방식**:
```
분포 점수 = (비정상 시간대 커밋 비율 * 10)
- 비정상 시간대: 09시 이전, 19시 이후, 점심시간
```

---

## 종합 점수 및 경고 수준

### 종합 점수 계산
```
번아웃 점수 = 야근 점수 + 주말 점수 + 품질 점수 + 분포 점수
```

### 경고 수준

| 점수 범위 | 수준 | 표시 | 메시지 |
|-----------|------|------|--------|
| 0 ~ 5 | 정상 | 녹색 | 건강한 업무 패턴입니다 |
| 6 ~ 15 | 주의 | 노란색 | 야근/주말 작업이 늘고 있어요 |
| 16+ | 위험 | 빨간색 | 번아웃 위험! 휴식이 필요합니다 |

---

## 폴더/파일 구조

```
dev-assistant/
├── .claude/skills/
│   └── burnout-radar/
│       ├── SKILL.md              # 스킬 정의 (공개용 템플릿)
│       └── SKILL.local.md        # 로컬 설정 (개인 정보 포함)
├── scripts/
│   ├── burnout-radar.sh          # 자동 실행 스크립트
│   └── com.dev-assistant.burnout.plist  # launchd 설정
└── reports/
    └── burnout/                  # 주간 리포트 저장
        └── 2026-W05.md           # 주차별 파일
```

---

## Slack 메시지 포맷

### Block Kit 구조

```json
{
  "blocks": [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": "Burnout Radar - 2026-W05"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*종합 점수*: 8점 / 녹색\n*분석 기간*: 2026-01-27 ~ 2026-02-02"
      }
    },
    {
      "type": "divider"
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*야근 지표*\n커밋 3건 (21시 이후)\n└ 점수: 4점"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*주말 작업*\n토요일: 1건, 일요일: 0건\n└ 점수: 2점"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*커밋 품질*\n평균 메시지 길이: 42자\nfix/wip 비율: 15%\n└ 점수: 0점"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*시간 분포*\n정상 시간대 비율: 78%\n└ 점수: 2점"
      }
    },
    {
      "type": "divider"
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*제안*\n이번 주 야근이 3회 있었어요. 다음 주는 정시 퇴근을 목표로 해보세요."
      }
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "상세 리포트: `reports/burnout/2026-W05.md`"
        }
      ]
    }
  ]
}
```

### 경고 수준별 헤더 이모지

| 수준 | 헤더 |
|------|------|
| 녹색 | `Burnout Radar - 2026-W05` |
| 노란색 | `Burnout Radar - 2026-W05` |
| 빨간색 | `Burnout Radar - 2026-W05` |

---

## 구현 계획

### 영향 범위
- 신규 파일 생성 (기존 파일 수정 없음)
- 기존 환경변수 활용: `SLACK_WEBHOOK`
- 기존 launchd 패턴 참고: `com.dev-assistant.daily.plist`

### 구현 단계

#### Phase 1: 스킬 정의 (SKILL.md)
1. [x] `.claude/skills/burnout-radar/SKILL.md` 생성
   - 사용법 문서화
   - Git 분석 명령어 정의
   - 점수 산출 로직 명세
   - Slack 메시지 포맷 정의

2. [x] `.claude/skills/burnout-radar/SKILL.local.md` 생성
   - 분석 대상: `/Users/kimjin-wan/Works/devops/dentbird-solutions`
   - Git author 설정

#### Phase 2: 자동화 스크립트
3. [x] `scripts/burnout-radar.sh` 생성
   - 환경변수 로드
   - Claude Code 호출
   - 에러 처리 및 로깅

4. [x] `scripts/com.dev-assistant.burnout.plist` 생성
   - 매주 월요일 09:00 실행
   - 로그 경로 설정
   - 환경변수 전달

#### Phase 3: 리포트 저장소
5. [x] `reports/burnout/` 디렉토리 구조 설정
   - `.gitkeep` 파일 생성
   - 리포트 형식 정의

#### Phase 4: 문서화
6. [x] `CLAUDE.md` 업데이트
   - burnout-radar 스킬 추가
   - 디렉토리 설명 추가

---

## 완료 조건 (Definition of Done)

- [x] `/burnout-radar` 명령으로 수동 실행 가능
- [x] `/burnout-radar --dry-run` 명령으로 전송 없이 분석 가능
- [x] 매주 월요일 09:00 자동 실행 (launchd) - plist 파일 준비됨
- [x] Slack Block Kit 형식으로 메시지 전송 - 스킬에 정의됨
- [x] `reports/burnout/YYYY-Wnn.md` 파일 생성 - 스킬에 정의됨
- [x] dentbird-solutions 저장소 분석 - SKILL.local.md에 설정됨

---

## Git 분석 명령어 참고

### 지난 주 커밋 조회
```bash
# 지난 주 월요일 ~ 일요일 기준
LAST_MONDAY=$(date -v-1w -v-monday +%Y-%m-%d)
LAST_SUNDAY=$(date -v-1w -v-sunday +%Y-%m-%d)

git log --oneline \
  --since="$LAST_MONDAY 00:00:00" \
  --until="$LAST_SUNDAY 23:59:59" \
  --author="Your Name" \
  --format="%H %ad %s" --date=format:'%Y-%m-%d %H:%M %u'
```

### 출력 형식 설명
- `%H`: 전체 커밋 해시
- `%ad`: 작성 날짜 (--date 형식 적용)
- `%s`: 커밋 메시지
- `%u`: 요일 (1=월요일, 7=일요일)

### 시간대별 커밋 수 집계
```bash
git log --since="$LAST_MONDAY" --until="$LAST_SUNDAY" \
  --author="Your Name" \
  --format="%ad" --date=format:'%H' | \
  sort | uniq -c | sort -k2 -n
```

---

## 구현 완료

**완료일**: 2026-02-03

### 생성된 파일
- `.claude/skills/burnout-radar/SKILL.md` - 공개용 스킬 정의
- `.claude/skills/burnout-radar/SKILL.local.md` - 로컬 설정 (dentbird-solutions)
- `scripts/burnout-radar.sh` - 자동 실행 스크립트
- `scripts/com.dev-assistant.burnout.plist` - launchd 설정
- `reports/burnout/.gitkeep` - 리포트 저장소

### launchd 등록 방법
```bash
# plist 파일의 경로를 실제 경로로 수정 후:
cp scripts/com.dev-assistant.burnout.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.dev-assistant.burnout.plist
```
