# Azure DevOps PR Reviewer (Slack)

로컬에서 동작하는 “내 PR 자동 리뷰어” 구성 문서입니다. 새 PR이 생성되면 실제 리포지토리를 기준으로 변경 사항을 분석하고, 결과를 Slack Webhook으로 전송합니다. 초기에는 Slack으로만 리포트하며, 필요 시 Azure DevOps PR 코멘트 방식으로 확장 가능합니다.

## 개요
- 트리거: Azure DevOps REST API로 "내가 만든 PR"을 폴링
- 리포지토리: 로컬 클론(`~/pr-review/dentbird-solutions`)의 source/target 브랜치 fetch 후 diff
- 분석(정적 휴리스틱):
  - Lockfile: `package.json` 변경 시 lockfile 동반 변경 여부
  - Barrel: `src/index.ts`에 신규 모듈 export 누락 가능성
  - Tests: 변경된 모듈 대비 테스트 변경 없음
  - Prisma: `schema.prisma` 변경 시 migrations 누락 가능성
- 리포트: Slack Incoming Webhook에 요약/항목별 리스트 전송

## 파일
- `scripts/ado_pr_reviewer.py`: PR 감지 → 브랜치 fetch → 휴리스틱 → Slack 전송
- `scripts/ado_pr_to_slack.py`(옵션): 단순 PR 생성 알림 용 미니 스크립트

## 선행 조건
- Python 3, Git 설치됨
- Azure DevOps SSH 접근 가능 (repo fetch 용)
- Slack Incoming Webhook URL 보유

## 환경 변수
다음 값들은 셸 초기화 파일(`~/.zshrc`) 또는 실행 시 export로 설정합니다.
- `AZDO_PAT`(필수): Azure DevOps Personal Access Token (Scopes 권장: Profile(Read), Code(Read))
- `SLACK_WEBHOOK`(필수): Slack Incoming Webhook URL
- `AZDO_ORG`: `ImagoWorks`
- `AZDO_PROJECT`: `dentbird-solutions`
- `TARGET_REPO`: `dentbird-solutions`
- `REPO_DIR`: `~/pr-review/dentbird-solutions`
- `POLL_INTERVAL`(선택): 폴링 주기(초), 기본 90

보안 권장: 토큰은 평문 노출을 피하고, 접근권한 최소화(최소 Scope)로 발급하세요.

## 리포지토리 준비
권장 경로: `~/pr-review/dentbird-solutions`

```bash
mkdir -p ~/pr-review
git clone git@ssh.dev.azure.com:v3/ImagoWorks/dentbird-solutions/dentbird-solutions \
  ~/pr-review/dentbird-solutions
```

이미 클론이 있으면 아래로 업데이트:

```bash
git -C ~/pr-review/dentbird-solutions fetch --all --prune --tags
```

## 실행 방법

### 포그라운드(테스트)
```bash
export AZDO_ORG=ImagoWorks
export AZDO_PROJECT=dentbird-solutions
export TARGET_REPO=dentbird-solutions
export REPO_DIR=~/pr-review/dentbird-solutions
export POLL_INTERVAL=90
python3 scripts/ado_pr_reviewer.py
```

처음 실행 시 기존 PR은 "시드"만 하고, 이후 새로 생성되는 본인 PR부터 분석/전송합니다.

### 백그라운드(권장)
```bash
mkdir -p ~/.ado-pr-review
nohup python3 scripts/ado_pr_reviewer.py >> ~/.ado-pr-review/runner.log 2>&1 &
echo $! > ~/.ado-pr-review/pid
```

관리 명령
- 로그 보기: `tail -f ~/.ado-pr-review/runner.log`
- 중지: `kill $(cat ~/.ado-pr-review/pid)` 또는 `pkill -f ado_pr_reviewer.py`

원하면 macOS `launchd`로 로그인 시 자동 실행하도록 구성할 수 있습니다.

### 온디맨드(스킬처럼 호출)
특정 PR 한 번만 분석하거나, 최신 내 PR 하나만 즉시 분석할 때 사용합니다.

```bash
# 특정 PR ID로 실행(예: 29081)
python3 scripts/ado_pr_review_once.py --pr-id 29081

# 최신 내 PR 1건 분석
python3 scripts/ado_pr_review_once.py --latest

# Slack에도 전송하려면 --post-slack 추가
python3 scripts/ado_pr_review_once.py --pr-id 29081 --post-slack
```

자주 쓰려면 셸 alias를 추가하세요(예):

```bash
alias codex-pr-review="python3 $PWD/scripts/ado_pr_review_once.py"
# 사용: codex-pr-review --pr-id 29081 --post-slack
```

## Slack 메시지 예시
```
PR Review — <PR 제목>
Repo: dentbird-solutions | <source> → <target>
<PR 링크>

Findings — WARN: X | INFO: Y | ERROR: Z
- WARN: <설명>
  <세부 목록>
- INFO: <설명>
```

## 확장: PR 코멘트로 게시
Slack 대신 ADO PR 코멘트로 게시하려면 PAT에 Code(Write) 권한이 필요합니다. 엔드포인트 예시:
- POST `https://dev.azure.com/{org}/{project}/_apis/git/repositories/{repoId}/pullRequests/{pullRequestId}/threads?api-version=7.1-preview.1`

본문에 코멘트 내용을 포함해 스레드를 생성합니다. 현 스크립트 구조를 그대로 사용하며, Slack 전송 부분을 PR 코멘트 호출로 교체/추가하면 됩니다.

## 트러블슈팅
- Unauthorized/Forbidden: PAT 권한 확인(Profile Read, Code Read). 조직/프로젝트명 오탈자 점검.
- SSH fetch 실패: ADO에 SSH 키 등록 여부, `git@ssh.dev.azure.com` 접근 확인.
- 메시지 미도착: `SLACK_WEBHOOK` 유효성 점검, 방화벽/프록시 확인.
- 리포지토리 미발견: `REPO_DIR` 경로 확인 및 클론 상태 점검.
- Seed 후 알림 없음: 신규 PR부터 알림함(기존 PR은 시드 처리).

## 한계 및 주의
- 현재는 PR 작성자(=PAT 소유자)가 만든 PR만 대상.
- 프로젝트/레포: `dentbird-solutions`에 한정.
- 빌드/테스트 실행은 기본 비활성(정적 분석만). 필요 시 추가 가능.
- 대규모 변경 시 휴리스틱 오탐 가능. 결과는 가이드로 활용하세요.

## Codex CLI 사용
`scripts/pr-review.sh`는 기본적으로 `codex` CLI를 사용해 스킬 프롬프트를 실행합니다. `codex`가 없는 경우 자동으로 `claude`로 폴백합니다.

- 기본 실행: `bash scripts/pr-review.sh`
- 특정 PR: `bash scripts/pr-review.sh --pr <id>`
- 드라이런: `bash scripts/pr-review.sh --dry-run`

환경변수 `AI_BIN=codex|claude`로 우선순위를 강제할 수 있습니다.
