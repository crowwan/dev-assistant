# pr-review

내가 만든 Azure DevOps PR을 분석하고, 실제 로컬 리포지토리에서 소스/타겟 브랜치를 비교하여 추가로 필요한 변경이 있는지 점검한 뒤 Slack으로 요약 리포트를 전송합니다.

## 사용법

```bash
/pr-review                 # 최신 내 PR 1건 분석 후 Slack 전송
/pr-review --dry-run       # 분석만, Slack 전송 안 함
/pr-review --pr 29081      # 특정 PR ID 분석
```

> 참고: 스크립트 `scripts/pr-review.sh`가 이 스킬을 호출합니다. 실행 전 `~/.zshrc`에 환경변수가 잡혀 있어야 합니다.

## 필수 환경 변수
- `AZDO_ORG` (예: ImagoWorks)
- `AZDO_PROJECT` (예: dentbird-solutions)
- `AZDO_PAT` (ADO Personal Access Token, 최소 Profile:Read, Code:Read)
- `SLACK_WEBHOOK` (Slack Incoming Webhook URL)
- `TARGET_REPO` (예: dentbird-solutions)
- `REPO_DIR` (예: ~/pr-review/dentbird-solutions)
- 선택: `PR_ID` (특정 PR 강제 지정)

## 실행 단계

### 1) 사전 점검 및 변수 확인
```bash
: "AZDO_ORG=${AZDO_ORG:?missing}"
: "AZDO_PROJECT=${AZDO_PROJECT:?missing}"
: "AZDO_PAT=${AZDO_PAT:?missing}"
: "TARGET_REPO=${TARGET_REPO:?missing}"
: "REPO_DIR=${REPO_DIR:?missing}"
: "SLACK_WEBHOOK=${SLACK_WEBHOOK:?missing}"

# 현재 설정 출력(민감정보 마스킹)
echo "ORG=$AZDO_ORG, PROJECT=$AZDO_PROJECT, REPO=$TARGET_REPO, REPO_DIR=$REPO_DIR"
```

### 2) 내 PR 선택 (PR_ID가 없으면 최신 1건)
```bash
AUTH=$(printf ':%s' "$AZDO_PAT" | base64)

if [ -n "${PR_ID:-}" ]; then
  PR_JSON=$(curl -s \
    "https://dev.azure.com/$AZDO_ORG/$AZDO_PROJECT/_apis/git/pullrequests/$PR_ID?api-version=7.1-preview.1" \
    -H "Authorization: Basic $AUTH")
else
  ME=$(curl -s \
    "https://vssps.dev.azure.com/$AZDO_ORG/_apis/profile/profiles/me?api-version=7.1-preview.3" \
    -H "Authorization: Basic $AUTH")
  CREATOR_ID=$(echo "$ME" | jq -r '.id')
  PRS=$(curl -s \
    "https://dev.azure.com/$AZDO_ORG/$AZDO_PROJECT/_apis/git/pullrequests?searchCriteria.creatorId=$CREATOR_ID&searchCriteria.status=active&$top=50&api-version=7.1-preview.1" \
    -H "Authorization: Basic $AUTH")
  PR_JSON=$(echo "$PRS" | jq -c \
    ".value | map(select(.repository.name == \"$TARGET_REPO\")) | sort_by(.creationDate) | last")
fi

[ -n "$PR_JSON" ] || { echo "PR을 찾을 수 없습니다."; exit 1; }
PR_ID=$(echo "$PR_JSON" | jq -r '.pullRequestId')
TITLE=$(echo "$PR_JSON" | jq -r '.title')
SRC_REF=$(echo "$PR_JSON" | jq -r '.sourceRefName')
TGT_REF=$(echo "$PR_JSON" | jq -r '.targetRefName')
REPO=$(echo "$PR_JSON" | jq -r '.repository.name')
SRC=${SRC_REF#refs/heads/}
TGT=${TGT_REF#refs/heads/}
PR_URL="https://dev.azure.com/$AZDO_ORG/$AZDO_PROJECT/_git/$REPO/pullrequest/$PR_ID"

echo "분석 대상: #$PR_ID — $TITLE"
echo "브랜치: $SRC → $TGT (repo=$REPO)"
```

### 3) 로컬 리포지토리에서 브랜치 fetch 및 변경 파일 수집
```bash
[ -d "$REPO_DIR/.git" ] || { echo "REPO_DIR에 git 리포가 없습니다."; exit 1; }
cd "$REPO_DIR"

git fetch origin "$SRC_REF:refs/heads/__pr_src_$PR_ID" || true
git fetch origin "$TGT_REF:refs/heads/__pr_tgt_$PR_ID" || true

DIFF_STAT=$(git diff --stat refs/heads/__pr_tgt_$PR_ID refs/heads/__pr_src_$PR_ID || true)
NAME_STATUS=$(git diff --name-status refs/heads/__pr_tgt_$PR_ID refs/heads/__pr_src_$PR_ID || true)

echo "변경 파일 목록:\n$NAME_STATUS"
```

### 4) 휴리스틱 점검(누락 가능성)
- package.json 변경 시 lockfile 동반 여부
- src/index.ts에 신규 모듈 export 누락 가능성
- 변경된 모듈 대비 테스트 변경 없음 안내
- Prisma schema 변경 시 migrations 누락 경고

```bash
WARNINGS=()
INFOS=()

# 4-1) Lockfile
CHANGED_PKG_DIRS=$(echo "$NAME_STATUS" | awk '/\t.*package.json$/{print $2}' | xargs -I{} dirname {} | sort -u)
LOCKFILES=$(echo "$NAME_STATUS" | awk '/\t.*(package-lock.json|pnpm-lock.yaml|yarn.lock)$/{print $2}' | xargs -I{} dirname {} | sort -u)
for d in $CHANGED_PKG_DIRS; do
  echo "$LOCKFILES" | grep -qx "$d" || WARNINGS+=("$d: package.json 변경, lockfile 미반영")
done

# 4-2) Barrel (src/index.ts)
if git show "refs/heads/__pr_src_$PR_ID:src/index.ts" >/dev/null 2>&1; then
  INDEX_CONTENT=$(git show "refs/heads/__pr_src_$PR_ID:src/index.ts")
  NEW_TS=$(echo "$NAME_STATUS" | awk '/^A\t/ && $2 ~ /^src\// && $2 !~ /index.ts$/ && $2 ~ /\.(ts|tsx)$/ {print $2}')
  MISSING=()
  for f in $NEW_TS; do
    rel=${f#src/}; rel_noext=${rel%.*}
    echo "$INDEX_CONTENT" | grep -Eq "from ['\"]\.?/?$rel_noext['\"]|export \* from ['\"]\.?/?$rel_noext['\"]" || MISSING+=("src/$rel_noext")
  done
  if [ ${#MISSING[@]} -gt 0 ]; then
    WARNINGS+=("src/index.ts export 누락 가능성:\n- ${MISSING[*]}")
  fi
fi

# 4-3) Tests
CHANGED_SRC=$(echo "$NAME_STATUS" | awk '$2 ~ /^src\// && $2 ~ /\.(ts|tsx|js|jsx)$/ {print $2}')
CHANGED_TESTS=$(echo "$NAME_STATUS" | awk '$2 ~ /(^|\/)__tests__\// || $2 ~ /\.(test|spec)\.(ts|tsx|js)$/ {print $2}')
for s in $CHANGED_SRC; do
  base=${s%.*}
  found=0
  for cand in "$base.test.ts" "$base.spec.ts" "$base.test.tsx" "$base.spec.tsx" "$base.test.js" "$base.spec.js"; do
    echo "$CHANGED_TESTS" | grep -qx "$cand" && found=1 && break
  done
  if [ $found -eq 0 ]; then
    INFOS+=("테스트 변경 없음: $s")
  fi
done

# 4-4) Prisma
echo "$NAME_STATUS" | awk '$2=="prisma/schema.prisma"{f=1} END{if(f)exit 0; else exit 1}'
SCHEMA_CHANGED=$?
if [ $SCHEMA_CHANGED -eq 0 ]; then
  echo "$NAME_STATUS" | awk '$2 ~ /^prisma\/migrations\//{f=1} END{if(f)exit 0; else exit 1}'
  MIG_CHANGED=$?
  if [ $MIG_CHANGED -ne 0 ]; then
    WARNINGS+=("Prisma schema 변경, migrations 미포함")
  fi
fi
```

### 5) Slack 메시지 만들기 및 전송
```bash
SUMMARY="PR Review — $TITLE\nRepo: $REPO | $SRC → $TGT\n$PR_URL\n\n"
if [ ${#WARNINGS[@]} -eq 0 ] && [ ${#INFOS[@]} -eq 0 ]; then
  SUMMARY+="No issues detected.\nNo additional actions suggested."
else
  [ ${#WARNINGS[@]} -gt 0 ] && SUMMARY+="WARN:\n- ${WARNINGS[*]}\n\n"
  [ ${#INFOS[@]} -gt 0 ] && SUMMARY+="INFO:\n- ${INFOS[*]}\n"
fi

echo "\n--- Slack Summary ---\n$SUMMARY"

if [ -z "${DRY_RUN:-}" ]; then
  curl -s -X POST "$SLACK_WEBHOOK" -H 'Content-Type: application/json' \
    -d "$(jq -n --arg t "$SUMMARY" '{text:$t}')" >/dev/null || true
  echo "Slack 전송 완료"
else
  echo "DRY RUN - 전송 생략"
fi
```

---

주의: 토큰/시크릿은 출력하지 않도록 하고, 로그에 민감정보를 남기지 않습니다. 문제 발생 시 `REPO_DIR` 경로, 브랜치명, API 호출 결과(상태코드)를 우선 점검하세요.
