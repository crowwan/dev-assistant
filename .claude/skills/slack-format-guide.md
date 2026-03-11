# Slack 메시지 포맷 가이드

Slack Incoming Webhook으로 메시지를 보낼 때 반드시 아래 규칙을 따르세요.

## 필수 규칙

### 1. 반드시 Block Kit 사용 (단순 text 금지)

```json
// ✅ 올바른 형식
{"blocks": [{"type": "section", "text": {"type": "mrkdwn", "text": "내용"}}]}

// ❌ 금지 - 서식이 제대로 적용되지 않음
{"text": "내용"}
```

### 2. Slack mrkdwn 문법 (GitHub Markdown과 다름!)

| 서식 | Slack mrkdwn (✅) | GitHub Markdown (❌) |
|------|-------------------|---------------------|
| 볼드 | `*bold*` | `**bold**` |
| 이탤릭 | `_italic_` | `*italic*` |
| 취소선 | `~strikethrough~` | `~~strikethrough~~` |
| 코드 | `` `code` `` | `` `code` `` |
| 링크 | `<URL\|텍스트>` | `[텍스트](URL)` |
| 불릿 | `• 항목` 또는 `- 항목` | `- 항목` |

### 3. 개행 처리

JSON 문자열 안에서 반드시 `\n` 이스케이프 사용:

```json
// ✅ 올바름
{"type": "mrkdwn", "text": "*제목*\n• 항목1\n• 항목2"}

// ❌ 금지 - JSON 파싱 에러 발생
{"type": "mrkdwn", "text": "*제목*
• 항목1
• 항목2"}
```

### 4. curl 실행 시 JSON 안전하게 전달

반드시 heredoc이나 변수로 JSON을 구성한 후 `--data-binary` 또는 `-d @-`로 전달:

```bash
# ✅ 권장 방식 - JSON을 변수에 먼저 구성
PAYLOAD=$(cat <<'EOJSON'
{
  "blocks": [
    {"type": "header", "text": {"type": "plain_text", "text": "제목"}},
    {"type": "section", "text": {"type": "mrkdwn", "text": "*볼드*\n• 항목"}}
  ]
}
EOJSON
)
curl -s -X POST "$SLACK_WEBHOOK" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d "$PAYLOAD"
```

### 5. section 텍스트 길이 제한

Slack section block의 text 필드는 **3000자 제한**. 긴 내용은 여러 section으로 분할하세요.

## 요약 체크리스트

- [ ] `{"blocks": [...]}` 형식 사용
- [ ] `"type": "mrkdwn"` 지정
- [ ] 볼드: `*텍스트*` (별표 하나)
- [ ] 개행: JSON 안에서 `\n` 이스케이프
- [ ] 링크: `<URL|텍스트>` 형식
- [ ] JSON을 변수에 먼저 구성 후 curl로 전달
