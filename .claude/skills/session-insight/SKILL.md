# session-insight

하루 동안의 Claude Code 세션을 분석하여 **작업 내용**, **문제 해결 접근법**, **핵심 고민/인사이트**를 추출하고 Slack DM으로 전송합니다.

기존 `daily-summary`가 정량 데이터(커밋 수, PR 수)를 다룬다면, 이 스킬은 **정성 데이터(사고 과정, 기술적 고민, 설계 결정)**에 집중합니다.

## 사용법

```bash
/session-insight              # 분석 + Slack 전송
/session-insight --dry-run    # 분석만 (전송 안함)
```

## 실행 단계

### 1단계: 오늘 날짜 및 세션 경로 확인

```bash
TODAY=$(TZ=Asia/Seoul date +%Y-%m-%d)
echo "분석 날짜: $TODAY"
```

### 2단계: 오늘의 Claude Code 세션 JSONL 수집

Claude Code 세션은 JSONL 형식으로 저장됩니다. 오늘 수정된 세션 파일만 대상으로 합니다.

**세션 디렉토리:** `~/.claude/projects/{project-hash}/`

```bash
# 프로젝트별 세션 디렉토리 (환경에 맞게 수정)
SESSION_DIR="${CLAUDE_SESSION_DIR:-$HOME/.claude/projects}"

# 오늘 수정된 JSONL 파일 찾기
find "$SESSION_DIR" -maxdepth 2 -name "*.jsonl" -type f | while read f; do
  mod=$(stat -f "%Sm" -t "%Y-%m-%d" "$f" 2>/dev/null || stat -c "%y" "$f" 2>/dev/null | cut -d' ' -f1)
  if [ "$mod" = "$TODAY" ]; then
    echo "$f"
  fi
done
```

### 3단계: 세션별 사용자 메시지 추출

각 JSONL 파일에서 `type='user'`인 라인의 `message.content`를 추출합니다.

**JSONL 구조:**
```json
{"type": "user", "message": {"content": "<system-reminder>...</system-reminder>실제 메시지"}}
```

**파싱 규칙:**
- `type='user'`인 라인만 추출
- `message.content`가 string이면 직접 사용, list면 `type='text'`인 요소 추출
- 아래 XML 태그 제거 (정규식):
  ```
  <system-reminder>...</system-reminder>
  <local-command-caveat>...</local-command-caveat>
  <command-name>...</command-name>
  <command-message>...</command-message>
  <command-args>...</command-args>
  <local-command-stdout>...</local-command-stdout>
  ```
- 클리닝 후 5자 이하인 메시지는 제외

**Python 파싱 스크립트:**
```python
import json, re

def extract_user_messages(jsonl_path):
    messages = []
    tag_pattern = re.compile(r'<(system-reminder|local-command-caveat|command-name|command-message|command-args|local-command-stdout)>[\s\S]*?</\1>')

    with open(jsonl_path, encoding='utf-8', errors='ignore') as f:
        for line in f:
            try:
                d = json.loads(line)
                if d.get('type') != 'user':
                    continue
                content = d.get('message', {}).get('content', '')
                texts = []
                if isinstance(content, list):
                    texts = [c['text'] for c in content if isinstance(c, dict) and c.get('type') == 'text']
                elif isinstance(content, str):
                    texts = [content]

                for t in texts:
                    clean = tag_pattern.sub('', t).strip()
                    if clean and len(clean) > 5:
                        messages.append(clean[:500])
            except:
                pass
    return messages
```

### 4단계: Git 커밋 수집 (타임라인 보조)

세션 메시지와 커밋을 교차 대조하여 작업 타임라인을 구성합니다.

```bash
REPO_PATH="${PROJECT_REPO:-$HOME/path/to/your-project}"

git -C "$REPO_PATH" log --all \
  --since="$TODAY 00:00:00" --until="$TODAY 23:59:59" \
  --author="Your Name\|your-email" \
  --format="%h|%ai|%s"
```

### 5단계: AI 분석 - 작업 테마 그룹핑

수집된 사용자 메시지와 커밋을 분석하여 작업 단위로 그룹핑합니다.

**분석 기준:**
1. **세션 단위**: 같은 JSONL 파일 = 하나의 작업 세션
2. **키워드 매칭**: 세션 메시지에서 모듈명, 파일명, 기능명 추출
3. **커밋 매칭**: 커밋 메시지의 scope(괄호 안 내용)로 작업 영역 파악
4. **시간순 정렬**: 파일 수정 시간 기준으로 세션을 시간순 정렬

**그룹핑 출력 형식:**
```
Work Theme 1: "Export Dialog CAM Software 비활성화 문제 수정"
  - 세션: abc12345 (14:22~15:30)
  - 관련 커밋: fix(export): CAM Software 전체 비활성화 버그 수정
  - 사용자 메시지 요약: ...

Work Theme 2: "Batch Experimental 배포 전략"
  - 세션: def67890 (16:17~17:19)
  - 관련 커밋: feat(batch): P004 Experimental 동시 배포를 위한 설정 분리
  - 사용자 메시지 요약: ...
```

### 6단계: AI 분석 - 핵심 고민/인사이트 추출 (가장 중요)

각 작업 테마에서 **문제 해결 과정의 고민과 인사이트**를 추출합니다.

**추출 대상:**
1. **문제 인식**: 어떤 문제를 발견했는가
2. **접근 방식**: 어떻게 해결하려 했는가 (시도한 방법들)
3. **기술적 고민**: 트레이드오프, 설계 결정, 대안 비교
4. **발견한 코드 스멜**: shotgun surgery, 테스트 품질, 중복 코드 등
5. **미해결 과제**: 시간 부족으로 남긴 기술 부채, 향후 리팩토링 과제

**분석 방법:**
- 사용자 메시지에서 고민/질문 패턴 감지:
  - `"~인 것 같다"`, `"~해야 하는데"`, `"~가 좋겠다"` → 기술적 판단
  - `"근본 원인"`, `"shotgun surgery"`, `"코드 스멜"` → 아키텍처 인사이트
  - `"~는 별개 문제"`, `"~는 나중에"` → 미해결 과제 인식
  - `"~로 해야 하나?"`, `"어떻게 할까"` → 의사결정 순간
- 여러 세션에 걸친 동일 주제 추적 (하나의 문제를 여러 세션에서 다룬 경우)

**인사이트 카테고리:**

| 카테고리 | 이모지 | 설명 |
|----------|--------|------|
| Architecture | :building_construction: | 설계/구조적 발견 |
| Code Quality | :mag: | 코드 스멜, 테스트 품질 |
| Decision | :scales: | 기술적 의사결정 |
| Tech Debt | :memo: | 인식한 기술 부채 |
| Learning | :bulb: | 새로 배운 것, 깨달음 |

### 7단계: 리포트 생성

**reports/session-insight/{YYYY-MM-DD}.md 형식:**

```markdown
# {YYYY-MM-DD} Session Insight

## Summary
- 세션: {N}개 | 커밋: {N}건 | 작업 테마: {N}개

## Work Timeline

### Theme 1: {작업 테마명}
**시간**: {시작}~{종료} | **세션**: {N}개 | **커밋**: {N}건

**무엇을 했나:**
- {작업 내용 1~3줄 요약}

**어떻게 접근했나:**
- {문제 발견 경위}
- {시도한 접근법}
- {최종 해결 방법}

**관련 커밋:**
- `hash` commit message

---

### Theme 2: ...

---

## Core Insights

### :building_construction: {인사이트 제목}
{상세 설명 2~3줄}
> 원문: "{사용자가 실제로 한 말}"

### :mag: {인사이트 제목}
{상세 설명}
> 원문: "{사용자가 실제로 한 말}"

### :memo: {인사이트 제목}
{미해결 과제/기술 부채 설명}

---

## Open Questions
- {향후 해결해야 할 질문/과제}

---
생성: {HH:MM}
```

### 8단계: Slack 웹훅 전송 (--dry-run이 아닌 경우)

리포트 중 **Core Insights** 섹션을 중심으로 Slack 메시지를 구성합니다.
전체 작업 내용은 간략하게, 인사이트는 상세하게 전달합니다.

**Slack Block Kit 메시지 포맷:**

```json
{
  "blocks": [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": ":brain: {YYYY-MM-DD} Session Insight"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*세션* {N}개 | *커밋* {N}건 | *작업 테마* {N}개"
      }
    },
    {
      "type": "divider"
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*:clipboard: Today's Work*\n• {테마1}: {한줄 요약}\n• {테마2}: {한줄 요약}\n• ..."
      }
    },
    {
      "type": "divider"
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*:star: Core Insights*"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": ":building_construction: *{인사이트 제목}*\n{설명 1~2줄}\n> _{원문 인용}_"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": ":mag: *{인사이트 제목}*\n{설명 1~2줄}\n> _{원문 인용}_"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": ":memo: *{인사이트 제목}*\n{설명 1~2줄}"
      }
    },
    {
      "type": "divider"
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*:question: Open Questions*\n• {향후 과제 1}\n• {향후 과제 2}"
      }
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": ":page_facing_up: 상세: `reports/session-insight/{날짜}.md`"
        }
      ]
    }
  ]
}
```

**전송:**
```bash
curl -s -X POST "$SLACK_WEBHOOK" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d @webhook_payload.json
```

**Slack 메시지 제약사항:**
- Block Kit 최대 50개 블록
- section text 최대 3000자
- 인사이트가 많으면 상위 5개만 Slack 전송, 나머지는 리포트 참조 유도

## 환경 변수

| 변수 | 필수 | 설명 |
|------|------|------|
| `SLACK_WEBHOOK` | O | Slack Incoming Webhook URL |
| `CLAUDE_SESSION_DIR` | X | Claude Code 세션 디렉토리 |
| `PROJECT_REPO` | X | 프로젝트 저장소 경로 |

## 출력

1. **reports/session-insight/{YYYY-MM-DD}.md** - 상세 리포트
2. **Slack 메시지** - 인사이트 중심 요약 (본인 DM)

## daily-summary와의 차이

| 항목 | daily-summary | session-insight |
|------|---------------|-----------------|
| 데이터 소스 | Git, Jira, PR | Claude Code 세션 JSONL |
| 분석 초점 | 무엇을 했나 (정량) | 왜, 어떻게 했나 (정성) |
| 핵심 가치 | 업무량 파악 | 사고 과정 기록 |
| 사용 시점 | 매일 퇴근 전 | 매일 퇴근 전 (daily-summary 이후) |
| Slack 메시지 | 커밋/이슈/PR 목록 | 인사이트/고민/미해결과제 |

## 커스터마이징

1. **Claude 세션 경로**: `CLAUDE_SESSION_DIR` 환경변수 또는 SKILL.local.md에서 설정
2. **Git 저장소**: `PROJECT_REPO` 환경변수 또는 SKILL.local.md에서 설정
3. **인사이트 카테고리**: 팀/개인 상황에 맞게 카테고리 추가/수정
4. **Slack 포맷**: Block Kit 구조를 팀 선호에 맞게 수정
