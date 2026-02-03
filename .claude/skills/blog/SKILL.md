---
name: blog
description: Claude Code 세션을 분석하여 블로그 소재를 찾고, 초안 생성, velog 발행까지 지원
---

# blog

Claude Code 세션에서 블로그 소재를 발굴하고, 초안을 작성하며, velog에 발행하는 통합 스킬입니다.

## Configuration

- **Sessions Directory**: `~/.claude/projects`
- **Drafts Directory**: `./blog-posts`
- **Style Guide**: `~/.claude/blog-writing-guide.md`
- **Last Find Results**: `./blog-posts/.last-find.json` (번호 → 세션ID 매핑)

## Commands

### 1. `blog find [--days N]`

최근 세션에서 블로그 소재 후보를 찾습니다.

**Steps**:

1. 세션 파일 목록 조회 (기본 7일, 최근 수정순):
   ```bash
   DAYS=${1:-7}
   find ~/.claude/projects -maxdepth 2 -name "*.jsonl" -type f -mtime -$DAYS 2>/dev/null | \
     grep -v "agent-" | \
     xargs ls -lt 2>/dev/null | head -10 | awk '{print $NF}'
   ```

2. 각 세션에 대해 서브에이전트(haiku)를 병렬로 실행하여 분석:
   - `run_in_background: true`
   - 분석 기준: `analyze-criteria.md` 참조

3. 서브에이전트 프롬프트:
   ```markdown
   ## 블로그 소재 분석 작업

   ### Step 1: 분석 기준 읽기
   cat /Users/kimjin-wan/Works/personal/dev-assistant/.claude/skills/blog/analyze-criteria.md

   ### Step 2: 세션 프롬프트 추출
   grep '"type":"user"' "{SESSION_FILE}" | \
     jq -r 'select(.message.content | type == "string") |
            select(.message.content | test("^<(local-command|command-name)") | not) |
            .message.content' 2>/dev/null | head -30

   ### Step 3: 분석 결과 출력
   JSON 형식으로:
   {
     "session_file": "{SESSION_FILE}",
     "score": 7,
     "type": "삽질/자동화/기술적용/문제해결/아키텍처",
     "summary": "한 줄 요약",
     "key_points": ["핵심 포인트 1", "핵심 포인트 2"],
     "recommended": true/false
   }
   ```

4. 결과 집계 및 저장:
   - 점수 높은 순으로 정렬
   - 번호(1~10) 부여
   - `./blog-posts/.last-find.json`에 매핑 저장:
     ```json
     {
       "1": "9d493256-da6f-4383-a93d-48352cbb938d",
       "2": "0a834e5a-743d-4af7-84fe-fd326683eb0b",
       ...
     }
     ```

5. 출력 형식:
   ```markdown
   ## 블로그 소재 후보 (최근 N일)

   | # | 점수 | 프로젝트 | 소재 요약 |
   |---|------|----------|-----------|
   | 1 | 9/10 | dev-assistant | Jira 백로그 AI 자동 분석 |
   | 2 | 9/10 | dentbird | Self-hosted Agent 코드 서명 |

   상세 분석: /blog analyze 1
   초안 생성: /blog draft 1
   ```

---

### 2. `blog analyze <번호|SESSION_ID>`

특정 세션의 블로그 소재 가치를 상세 분석합니다.

**사용법**:
```bash
/blog analyze 1           # 번호로 접근 (find 결과에서)
/blog analyze 9d493256    # 세션ID로 접근
```

**Steps**:

1. 세션 파일 찾기:
   - 숫자(1~10)인 경우: `./blog-posts/.last-find.json`에서 세션ID 조회
   - 그 외: 세션ID로 직접 검색
   ```bash
   find ~/.claude/projects -name "*${SESSION_ID}*.jsonl" -type f 2>/dev/null | head -1
   ```

2. 프롬프트 추출:
   ```bash
   grep '"type":"user"' "${SESSION_FILE}" | \
     jq -r 'select(.message.content | type == "string") |
            select(.message.content | test("^<(local-command|command-name)") | not) |
            "\n---\n### Prompt \(.timestamp // "N/A")\n\n\(.message.content)"' 2>/dev/null
   ```

3. 분석 기준(`analyze-criteria.md`)에 따라 점수화

4. 출력 형식:
   ```markdown
   ## 세션 분석: {주제}

   ### 점수: X/10
   - 흥미도: X/3 - {설명}
   - 학습가치: X/3 - {설명}
   - 스토리: X/2 - {설명}
   - 적용가능성: X/2 - {설명}

   ### 핵심 포인트
   1. {포인트 1}
   2. {포인트 2}
   3. {포인트 3}

   ### 추천 제목
   - "{제목 후보 1}"
   - "{제목 후보 2}"

   ### 글 유형
   {삽질기/기술실용/개념설명} - {이유}

   초안 생성: /blog draft {SESSION_ID}
   ```

---

### 3. `blog draft <번호|SESSION_ID> [--title "제목"]`

세션 기반으로 블로그 초안을 생성합니다.

**사용법**:
```bash
/blog draft 1                    # 번호로 접근
/blog draft 1 --title "내 제목"   # 제목 지정
/blog draft 9d493256             # 세션ID로 접근
```

**Steps**:

1. 세션 파일 찾기:
   - 숫자(1~10)인 경우: `./blog-posts/.last-find.json`에서 세션ID 조회
   - 그 외: 세션ID로 직접 검색

2. 세션 분석 (analyze와 동일)

2. 스타일 가이드 로드:
   ```bash
   cat ~/.claude/blog-writing-guide.md
   ```

3. 초안 템플릿 로드:
   ```bash
   cat /Users/kimjin-wan/Works/personal/dev-assistant/.claude/skills/blog/draft-template.md
   ```

4. 글 유형 자동 판단:
   - 삽질기/회고: 2회 이상 접근법 변경, "포기", "결국" 키워드
   - 기술 실용: 자동화, 도구, 스크립트 구현
   - 개념 설명: 패턴, 아키텍처, 방법론 적용

5. 초안 생성 규칙:
   - 스타일 가이드의 이모지 헤딩 적용
   - TL;DR 자동 생성
   - 세션에서 코드 예시 추출 포함
   - 핵심 삽질/인사이트 포인트 강조

6. 파일 저장:
   ```bash
   # 파일명: YYYY-MM-DD-{주제-slug}.md
   # 저장 위치: ./blog-posts/
   ```

7. 출력:
   ```markdown
   초안 생성 완료!

   파일: blog-posts/2026-01-30-e2e-automation.md
   유형: {글 유형}
   글자수: 약 X,XXX자

   다음 단계:
   1. 초안 검토: Read blog-posts/2026-01-30-e2e-automation.md
   2. 발행: /blog publish blog-posts/2026-01-30-e2e-automation.md
   ```

---

### 4. `blog list`

현재 초안 목록을 확인합니다.

**Steps**:

1. blog-posts/ 폴더 스캔:
   ```bash
   ls -la ./blog-posts/*.md 2>/dev/null | grep -v gitkeep
   ```

2. 각 파일의 메타데이터 추출:
   - 제목: 첫 번째 `# ` 헤딩
   - 글자수: `wc -m`

3. 출력:
   ```markdown
   ## 블로그 초안 목록

   | 파일 | 제목 | 생성일 | 글자수 |
   |------|------|--------|--------|
   | e2e-automation.md | E2E 테스트 자동화 | 01-30 | 2,500자 |
   | standup-skill.md | 스탠드업 자동화 | 01-25 | 1,800자 |

   발행: /blog publish blog-posts/<파일명>
   ```

---

### 5. `blog publish <FILE> [--draft]`

마크다운 파일을 velog에 발행합니다. Chrome 연동으로 자동 업로드.

**사용법**:
```bash
/blog publish blog-posts/my-article.md        # 발행 (출간하기)
/blog publish blog-posts/my-article.md --draft  # 임시저장만
```

**Steps**:

#### Step 1: 파일 읽기 및 파싱

1. 지정된 마크다운 파일 읽기

2. 제목 추출:
   - 파일 첫 줄에서 `# 제목` 형식 찾기
   - `#` 제거하고 제목만 추출

3. 본문 추출:
   - 첫 번째 `# 제목` 줄 제외한 나머지 내용

#### Step 2: Chrome으로 velog 접속

1. 탭 컨텍스트 확인:
   `mcp__claude-in-chrome__tabs_context_mcp`

2. velog 글쓰기 페이지 이동:
   `mcp__claude-in-chrome__navigate` -> `https://velog.io/write`

3. 대기 (로딩):
   `mcp__claude-in-chrome__computer` (wait: 3초)

4. 스크린샷으로 로그인 상태 확인:
   `mcp__claude-in-chrome__computer` (screenshot)
   - "제목을 입력하세요" 보이면 -> 로그인 됨
   - 로그인 폼 보이면 -> 로그인 안 됨

#### Step 3: 로그인 상태 분기

**3-A. 로그인 안 됨:**
- 사용자에게 알림: "velog 로그인이 필요합니다. 로그인 후 다시 실행해주세요."
- 스킬 종료

**3-B. 로그인 됨 -> 글 작성 진행**

#### Step 4: 제목 입력

1. 제목 입력 영역 찾기:
   `mcp__claude-in-chrome__find` -> "제목을 입력하세요"

2. 클릭:
   `mcp__claude-in-chrome__computer` (left_click, ref)

3. 제목 입력:
   `mcp__claude-in-chrome__computer` (type, 추출한 제목)

#### Step 5: 태그 입력

1. 태그 입력 영역 찾기:
   `mcp__claude-in-chrome__find` -> "태그를 입력하세요"

2. 클릭:
   `mcp__claude-in-chrome__computer` (left_click, ref)

3. 태그 입력 (파일 내용 기반으로 자동 생성):
   - 기술 블로그: Claude, 자동화, 개발, 생산성
   - 회고/삽질기: 회고, 삽질, 개발일지

4. Enter로 태그 확정:
   `mcp__claude-in-chrome__computer` (key, "Enter")

#### Step 6: 본문 입력

1. 본문 에디터 영역 찾기:
   `mcp__claude-in-chrome__find` -> "당신의 이야기를 적어보세요"

2. 클릭:
   `mcp__claude-in-chrome__computer` (left_click, ref)

3. 본문 입력 (마크다운 그대로):
   `mcp__claude-in-chrome__computer` (type, 본문 내용)
   - 주의: 본문이 길면 여러 번 나눠서 입력

#### Step 7: 발행 또는 임시저장

**7-A. --draft 옵션인 경우:**
1. "임시저장" 버튼 찾기 및 클릭
2. 완료 메시지: "임시저장 완료"

**7-B. 발행하는 경우:**
1. "출간하기" 버튼 찾기 및 클릭
2. 대기 (출간 설정 모달)
3. 최종 "출간하기" 버튼 클릭
4. 완료 메시지 + 발행된 URL 반환

**출력 예시**:

성공 시:
```
velog 발행 완료!

제목: 매일 아침 스탠드업, 직접 쓰고 계신가요?
태그: Claude, 자동화, 개발
URL: https://velog.io/@crowwan/...
```

실패 시:
```
velog 발행 실패

원인: 로그인 필요
해결: velog.io에서 로그인 후 다시 실행해주세요.
```

---

## 주의사항

1. **로그인 필수** (publish): velog에 미리 로그인되어 있어야 함
2. **이미지**: 본문 내 이미지 URL은 외부 링크여야 함 (로컬 이미지 업로드 불가)
3. **서브에이전트 활용** (find): 세션 분석은 서브에이전트로 메인 컨텍스트 보호
4. **회사 기밀 주의**: 비즈니스 로직 관련 세션은 블로그 소재로 부적합

## 관련 파일

- **분석 기준**: `./analyze-criteria.md`
- **초안 템플릿**: `./draft-template.md`
- **스타일 가이드**: `~/.claude/blog-writing-guide.md`
