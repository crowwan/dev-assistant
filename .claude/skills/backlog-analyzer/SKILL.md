# backlog-analyzer

Jira 백로그의 버그 티켓을 분석하고, 코드베이스에서 해결 가능한 버그를 식별하여 Slack으로 알림합니다.

## 사용법

```bash
/backlog-analyzer              # 분석 + Slack 전송
/backlog-analyzer --dry-run    # 분석만 (전송 안함)
```

## 실행 단계

### 1단계: 환경 확인

```bash
TODAY=$(TZ=Asia/Seoul date +%Y-%m-%d)
echo "분석 날짜: $TODAY"
```

**필수 환경 변수:**
- `JIRA_EMAIL`
- `JIRA_API_TOKEN`
- `SLACK_WEBHOOK`

---

### 2단계: 백로그 티켓 조회 (최신 생성순)

**Agile API로 백로그 조회 + 최신순 정렬:**
```bash
curl -s -X GET \
  "https://your-company.atlassian.net/rest/agile/1.0/board/{BOARD_ID}/backlog?maxResults=50&fields=key,summary,priority,status,created" \
  -H "Authorization: Basic $(printf '%s' "$JIRA_EMAIL:$JIRA_API_TOKEN" | base64)" \
  -H "Content-Type: application/json" | \
  jq '[.issues[] | {key, created: .fields.created, summary: .fields.summary, priority: .fields.priority.name}] | sort_by(.created) | reverse | .[0:15]'
```

**정렬 기준:**
- 최신 생성순 (created DESC)
- 상위 15개만 분석

---

### 3단계: 각 티켓 상세 조회

버그 티켓별로 상세 정보를 조회합니다.

**API 호출:**
```bash
curl -s -X GET \
  "https://your-company.atlassian.net/rest/api/3/issue/{ISSUE_KEY}" \
  -H "Authorization: Basic $(printf '%s' "$JIRA_EMAIL:$JIRA_API_TOKEN" | base64)"
```

**파싱할 정보:**
- `fields.description` - 상세 설명 (ADF 형식)
- `fields.customfield_XXXXX` - 발생 빈도 필드 (프로젝트별 설정)
- `fields.labels` - 라벨
- `fields.components` - 컴포넌트

**제외 조건 (분석 건너뛰기):**
발생 빈도가 아래인 티켓은 재현이 어려우므로 분석에서 제외:
- **Random**: 간헐적 발생
- **Once**: 1회성 (재현 불가)
- **Sometimes**: 가끔 발생

**분석 대상:**
- **Always**: 항상 발생 → 분석 가능

---

### 4단계: 코드베이스 분석

각 티켓에 대해 코드베이스를 탐색하여 관련 파일을 식별합니다.

**프로젝트 경로:**
```
PROJECT_PATH="$HOME/path/to/your-project"
```

**분석 방법:**

1. **에러 메시지 검색**
   - 티켓 설명에서 에러 메시지 추출
   - 코드베이스에서 해당 문자열 검색
   ```bash
   grep -r "에러 메시지" "$PROJECT_PATH/apps" "$PROJECT_PATH/libs"
   ```

2. **컴포넌트/기능 매핑**
   - 티켓 제목의 키워드 추출 (예: `[Export]`, `[Login]`)
   - 관련 디렉토리/파일 탐색
   ```bash
   find "$PROJECT_PATH" -type f -name "*.ts" | xargs grep -l "관련키워드"
   ```

3. **파일 식별**
   - 관련 파일 목록 수집
   - 수정이 필요한 주요 파일 식별

---

### 5단계: 해결 가능성 판단

각 버그에 대해 다음 기준으로 판단합니다:

| 판단 기준 | 점수 | 설명 |
|----------|------|------|
| 에러 메시지가 코드에서 발견됨 | +3 | 직접 추적 가능 |
| 특정 컴포넌트에 한정됨 | +2 | 영향 범위 명확 |
| 재현 조건이 명확함 | +2 | 테스트 가능 |
| 관련 파일이 3개 이하 | +1 | 수정 범위 작음 |
| UI 버그 (스타일/레이아웃) | +1 | 단순 수정 |

**난이도 분류:**
- 점수 7+ → 쉬움 (1-2시간)
- 점수 4-6 → 보통 (반나절)
- 점수 1-3 → 어려움 (1일+)
- 점수 0 → 분석 불가

---

### 6단계: 결과 정리

**reports/backlog-analysis-{YYYY-MM-DD}.md 형식:**

```markdown
# 백로그 버그 분석 - {YYYY-MM-DD}

## 요약
- 분석 대상: {N}개 (최신 생성순)
- 해결 가능 (Always): {M}개
- 제외됨: {K}개 (Random {a}, Once {b}, Sometimes {c})

## 해결 가능한 버그 (Always)

### 🟢 쉬움 (1-2시간)

#### [DEN-XXXX] 버그 제목
- **생성일**: YYYY-MM-DD
- **Jira 우선순위**: 2
- **발생 빈도**: Always
- **예상 수정 파일**:
  - `apps/web/src/components/Export/ExportButton.tsx`
- **분석 근거**: 에러 메시지가 코드에서 발견됨
- **권장 조치**: 예외 처리 추가 필요

### 🟡 보통 (반나절)
...

### 🔴 어려움 (1일+)
...

## 제외된 티켓

### Random (간헐적 발생)
| 티켓 | 생성일 | 우선순위 | 제목 |
|------|--------|----------|------|

### Once (1회성 - 재현 어려움)
| 티켓 | 생성일 | 우선순위 | 제목 |
|------|--------|----------|------|

### Sometimes (가끔 발생)
| 티켓 | 생성일 | 우선순위 | 제목 |
|------|--------|----------|------|

## 권장 처리 순서
1. 즉시 처리 (쉬움 + 동일 컴포넌트)
2. 이번 스프린트 (P1 우선)
3. 다음 스프린트
```

---

### 7단계: Slack 알림 (--dry-run이 아닌 경우)

**메시지 포맷 (Block Kit):**

```json
{
  "blocks": [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": "🔍 백로그 버그 분석 - {YYYY-MM-DD}"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*분석 결과*: {N}개 중 {M}개 해결 가능 (Always)\n⏭️ 제외: {K}개 (Random {a}, Once {b}, Sometimes {c})"
      }
    },
    {
      "type": "divider"
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*🟢 쉬움*\n• <https://your-company.atlassian.net/browse/DEN-XXXX|DEN-XXXX> 버그 제목\n  └ `ExportButton.tsx` (1-2시간)"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*🟡 보통*\n• <https://your-company.atlassian.net/browse/DEN-YYYY|DEN-YYYY> 다른 버그\n  └ `LoginForm.tsx`, `auth.ts` (반나절)"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*🔴 어려움*\n• <https://your-company.atlassian.net/browse/DEN-ZZZZ|DEN-ZZZZ> 복잡한 버그\n  └ 여러 모듈 관련 (1일+)"
      }
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "📄 상세: `reports/backlog-analysis-{YYYY-MM-DD}.md` | 🗓️ 최신 생성순 정렬"
        }
      ]
    }
  ]
}
```

**전송:**
```bash
curl -X POST "$SLACK_WEBHOOK" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d @payload.json
```

---

## 환경 변수

| 변수 | 필수 | 설명 |
|------|------|------|
| `JIRA_EMAIL` | O | Jira 계정 이메일 |
| `JIRA_API_TOKEN` | O | Jira API 토큰 |
| `SLACK_WEBHOOK` | O | Slack Incoming Webhook URL |

## 커스터마이징

이 스킬을 본인 환경에 맞게 수정하세요:

1. **Jira 설정**
   - `your-company.atlassian.net` → 실제 Jira URL
   - `{BOARD_ID}` → 실제 보드 ID
   - 발생 빈도 커스텀 필드 ID 확인

2. **프로젝트 경로**
   - `PROJECT_PATH` → 실제 프로젝트 경로

3. **분석 기준**
   - 난이도 점수 기준 조정
   - 제외 조건 추가/수정
