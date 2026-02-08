# Codex Skill — PR Review (Azure DevOps → Slack)

이 스킬은 Codex CLI가 직접 다음을 수행하도록 지시합니다:
- 내 PR(또는 지정한 PR) 메타 조회(Azure DevOps API)
- 로컬 리포지토리에서 소스/타겟 브랜치 fetch 후 diff
- 휴리스틱 기반 리뷰(잠재 누락/정합성 체크)
- Slack Incoming Webhook으로 요약 전송

사전 조건
- 환경변수: `AZDO_ORG`, `AZDO_PROJECT`, `AZDO_PAT`, `SLACK_WEBHOOK`, `TARGET_REPO`, `REPO_DIR`
- 선택: `PR_ID`(특정 PR 분석), 없으면 최신 내 PR 1건
- 로컬 경로 `REPO_DIR`에 대상 리포 클론 존재(예: `~/pr-review/dentbird-solutions`)

주의
- 비밀값은 로그/출력에 노출하지 말 것.
- 오류 발생 시 Slack 전송을 생략하고 이유를 출력.

## 1) 환경/변수 확인(마스킹 출력)
```bash
: "AZDO_ORG=${AZDO_ORG:?missing}"
: "AZDO_PROJECT=${AZDO_PROJECT:?missing}"
: "AZDO_PAT=${AZDO_PAT:?missing}"
: "TARGET_REPO=${TARGET_REPO:?missing}"
: "REPO_DIR=${REPO_DIR:?missing}"
: "SLACK_WEBHOOK=${SLACK_WEBHOOK:?missing}"

MASK(){ python3 - <<'PY'
import os,sys
v=os.environ.get(sys.argv[1],"")
print(v[:2]+"*"*(len(v)-6)+v[-4:] if len(v)>6 else "****")
PY
}

echo "ORG=$AZDO_ORG PROJECT=$AZDO_PROJECT REPO=$TARGET_REPO REPO_DIR=$REPO_DIR"
```

## 2) PR 식별(특정 ID 또는 최신 내 PR)
```bash
AUTH=$(printf ':%s' "$AZDO_PAT" | base64)
set -e
if [ -n "${PR_ID:-}" ]; then
  PR_JSON=$(curl -s "https://dev.azure.com/$AZDO_ORG/$AZDO_PROJECT/_apis/git/pullrequests/$PR_ID?api-version=7.1-preview.1" \
    -H "Authorization: Basic $AUTH")
else
  ME=$(curl -s "https://vssps.dev.azure.com/$AZDO_ORG/_apis/profile/profiles/me?api-version=7.1-preview.3" \
    -H "Authorization: Basic $AUTH")
  CREATOR_ID=$(echo "$ME" | jq -r '.id')
  PRS=$(curl -s "https://dev.azure.com/$AZDO_ORG/$AZDO_PROJECT/_apis/git/pullrequests?searchCriteria.creatorId=$CREATOR_ID&searchCriteria.status=active&$top=50&api-version=7.1-preview.1" \
    -H "Authorization: Basic $AUTH")
  PR_JSON=$(echo "$PRS" | jq -c \
    ".value | map(select(.repository.name == \"$TARGET_REPO\")) | sort_by(.creationDate) | last")
fi
[ -n "$PR_JSON" ] || { echo "PR not found"; exit 2; }

PR_ID=$(echo "$PR_JSON" | jq -r '.pullRequestId')
TITLE=$(echo "$PR_JSON" | jq -r '.title')
SRC_REF=$(echo "$PR_JSON" | jq -r '.sourceRefName')
TGT_REF=$(echo "$PR_JSON" | jq -r '.targetRefName')
REPO=$(echo "$PR_JSON" | jq -r '.repository.name')
SRC=${SRC_REF#refs/heads/}
TGT=${TGT_REF#refs/heads/}
PR_URL="https://dev.azure.com/$AZDO_ORG/$AZDO_PROJECT/_git/$REPO/pullrequest/$PR_ID"

echo "Analyzing PR #$PR_ID — $TITLE"
echo "Branches: $SRC → $TGT (repo=$REPO)"
```

## 3) 로컬 diff 준비
```bash
[ -d "$REPO_DIR/.git" ] || { echo "Missing git repo at $REPO_DIR"; exit 2; }
cd "$REPO_DIR"

git fetch origin "$SRC_REF:refs/heads/__codex_src_$PR_ID" || true
git fetch origin "$TGT_REF:refs/heads/__codex_tgt_$PR_ID" || true

NAME_STATUS=$(git diff --name-status refs/heads/__codex_tgt_$PR_ID refs/heads/__codex_src_$PR_ID || true)
DIFF_STAT=$(git diff --stat refs/heads/__codex_tgt_$PR_ID refs/heads/__codex_src_$PR_ID || true)

echo "Changed files:"; echo "$NAME_STATUS"
```

## 4) 휴리스틱 점검
```bash
WARNINGS=()
INFOS=()
# 4-1 Lockfile
CHANGED_PKG_DIRS=$(echo "$NAME_STATUS" | awk '/\t.*package.json$/{print $2}' | xargs -I{} dirname {} | sort -u)
LOCKFILES=$(echo "$NAME_STATUS" | awk '/\t.*(package-lock.json|pnpm-lock.yaml|yarn.lock)$/{print $2}' | xargs -I{} dirname {} | sort -u)
for d in $CHANGED_PKG_DIRS; do echo "$LOCKFILES" | grep -qx "$d" || WARNINGS+=("$d: package.json changed, lockfile not updated"); done
# 4-2 Barrel src/index.ts
if git show "refs/heads/__codex_src_$PR_ID:src/index.ts" >/dev/null 2>&1; then
  INDEX_CONTENT=$(git show "refs/heads/__codex_src_$PR_ID:src/index.ts")
  NEW_TS=$(echo "$NAME_STATUS" | awk '/^A\t/ && $2 ~ /^src\// && $2 !~ /index.ts$/ && $2 ~ /\.(ts|tsx)$/ {print $2}')
  MISSING=()
  for f in $NEW_TS; do rel=${f#src/}; rel_noext=${rel%.*}; echo "$INDEX_CONTENT" | grep -Eq "from ['\"]\.?/?$rel_noext['\"]|export \* from ['\"]\.?/?$rel_noext['\"]" || MISSING+=("src/$rel_noext"); done
  [ ${#MISSING[@]} -gt 0 ] && WARNINGS+=("index.ts may miss exports:\n- ${MISSING[*]}")
fi
# 4-3 Tests
CHANGED_SRC=$(echo "$NAME_STATUS" | awk '$2 ~ /^src\// && $2 ~ /\.(ts|tsx|js|jsx)$/ {print $2}')
CHANGED_TESTS=$(echo "$NAME_STATUS" | awk '$2 ~ /(^|\/)__tests__\// || $2 ~ /\.(test|spec)\.(ts|tsx|js)$/ {print $2}')
for s in $CHANGED_SRC; do base=${s%.*}; found=0; for cand in "$base.test.ts" "$base.spec.ts" "$base.test.tsx" "$base.spec.tsx" "$base.test.js" "$base.spec.js"; do echo "$CHANGED_TESTS" | grep -qx "$cand" && found=1 && break; done; [ $found -eq 0 ] && INFOS+=("no test change: $s"); done
# 4-4 Prisma
echo "$NAME_STATUS" | awk '$2=="prisma/schema.prisma"{f=1} END{if(f)exit 0; else exit 1}'; SC=$?; if [ $SC -eq 0 ]; then echo "$NAME_STATUS" | awk '$2 ~ /^prisma\/migrations\//{f=1} END{if(f)exit 0; else exit 1}'; MG=$?; [ $MG -ne 0 ] && WARNINGS+=("Prisma schema changed without migrations"); fi
```

## 5) Slack 전송
```bash
SUMMARY="PR Review — $TITLE\nRepo: $REPO | $SRC → $TGT\n$PR_URL\n\n"
if [ ${#WARNINGS[@]} -eq 0 ] && [ ${#INFOS[@]} -eq 0 ]; then SUMMARY+="No issues detected.\nNo additional actions suggested."; else [ ${#WARNINGS[@]} -gt 0 ] && SUMMARY+="WARN:\n- ${WARNINGS[*]}\n\n"; [ ${#INFOS[@]} -gt 0 ] && SUMMARY+="INFO:\n- ${INFOS[*]}\n"; fi

echo "$SUMMARY"
[ -n "${DRY_RUN:-}" ] && { echo "(dry run — not posting)"; exit 0; }

curl -s -X POST "$SLACK_WEBHOOK" -H 'Content-Type: application/json' -d "$(jq -n --arg t "$SUMMARY" '{text:$t}')" >/dev/null || true
```
