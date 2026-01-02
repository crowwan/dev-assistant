# velog-publish

마크다운 파일을 velog에 발행합니다. Chrome 연동으로 자동 업로드.

## 사용법

```bash
/velog-publish <파일경로>              # 발행 (출간하기)
/velog-publish <파일경로> --draft      # 임시저장만
```

**예시:**
```bash
/velog-publish blog-post.md
/velog-publish ./posts/my-article.md --draft
```

## 실행 단계

### 1단계: 파일 읽기 및 파싱

```
1. 지정된 마크다운 파일 읽기

2. 제목 추출
   - 파일 첫 줄에서 `# 제목` 형식 찾기
   - `#` 제거하고 제목만 추출

3. 본문 추출
   - 첫 번째 `# 제목` 줄 제외한 나머지 내용
```

### 2단계: Chrome으로 velog 접속

```
1. 탭 컨텍스트 확인
   mcp__claude-in-chrome__tabs_context_mcp

2. velog 글쓰기 페이지 이동
   mcp__claude-in-chrome__navigate → https://velog.io/write

3. 대기 (로딩)
   mcp__claude-in-chrome__computer (wait: 3초)

4. 스크린샷으로 로그인 상태 확인
   mcp__claude-in-chrome__computer (screenshot)
   - "제목을 입력하세요" 보이면 → 로그인 됨
   - 로그인 폼 보이면 → 로그인 안 됨
```

### 3단계: 로그인 상태 분기

**3-A. 로그인 안 됨:**
```
- 사용자에게 알림: "velog 로그인이 필요합니다. 로그인 후 다시 실행해주세요."
- 스킬 종료
```

**3-B. 로그인 됨 → 글 작성 진행**

### 4단계: 제목 입력

```
1. 제목 입력 영역 찾기
   mcp__claude-in-chrome__find → "제목을 입력하세요"

2. 클릭
   mcp__claude-in-chrome__computer (left_click, ref)

3. 제목 입력
   mcp__claude-in-chrome__computer (type, 추출한 제목)
```

### 5단계: 태그 입력 (선택사항)

```
1. 태그 입력 영역 찾기
   mcp__claude-in-chrome__find → "태그를 입력하세요"

2. 클릭
   mcp__claude-in-chrome__computer (left_click, ref)

3. 태그 입력 (쉼표로 구분된 태그들)
   mcp__claude-in-chrome__computer (type, "Claude,자동화,개발")

4. Enter로 태그 확정
   mcp__claude-in-chrome__computer (key, "Enter")
```

**추천 태그 (파일 내용 기반으로 자동 생성):**
- 기술 블로그: Claude, 자동화, 개발, 생산성
- 회고/일지: 회고, TIL, 개발일지

### 6단계: 본문 입력

```
1. 본문 에디터 영역 찾기
   mcp__claude-in-chrome__find → "당신의 이야기를 적어보세요"

2. 클릭
   mcp__claude-in-chrome__computer (left_click, ref)

3. 본문 입력 (마크다운 그대로)
   mcp__claude-in-chrome__computer (type, 본문 내용)

   주의: 본문이 길면 여러 번 나눠서 입력
```

### 7단계: 발행 또는 임시저장

**7-A. --draft 옵션인 경우:**
```
1. "임시저장" 버튼 찾기
   mcp__claude-in-chrome__find → "임시저장"

2. 클릭
   mcp__claude-in-chrome__computer (left_click, ref)

3. 완료 메시지: "임시저장 완료"
```

**7-B. 발행하는 경우:**
```
1. "출간하기" 버튼 찾기
   mcp__claude-in-chrome__find → "출간하기"

2. 클릭
   mcp__claude-in-chrome__computer (left_click, ref)

3. 대기 (출간 설정 모달)
   mcp__claude-in-chrome__computer (wait: 2초)

4. 스크린샷 (출간 설정 확인)
   mcp__claude-in-chrome__computer (screenshot)

5. 최종 "출간하기" 버튼 클릭
   mcp__claude-in-chrome__find → 모달 내 "출간하기" 버튼
   mcp__claude-in-chrome__computer (left_click, ref)

6. 대기 (발행 완료)
   mcp__claude-in-chrome__computer (wait: 3초)

7. 완료 메시지 + 발행된 URL 반환
```

## 주의사항

1. **로그인 필수**: velog에 미리 로그인되어 있어야 함
2. **이미지**: 본문 내 이미지 URL은 외부 링크여야 함 (로컬 이미지 업로드 불가)
3. **긴 본문**: 입력 시간이 오래 걸릴 수 있음
4. **출간 취소**: 출간 후 바로 삭제는 수동으로 해야 함

## 출력 예시

**성공 시:**
```
✅ velog 발행 완료!

제목: 매일 아침 스탠드업, 직접 쓰고 계신가요?
태그: Claude, 자동화, 개발
URL: https://velog.io/@crowwan/...
```

**실패 시:**
```
❌ velog 발행 실패

원인: 로그인 필요
해결: velog.io에서 로그인 후 다시 실행해주세요.
```

## 커스터마이징

### 기본 태그 설정

자주 사용하는 태그를 기본값으로 설정:

```markdown
### 5단계: 태그 입력
...
3. 태그 입력
   mcp__claude-in-chrome__computer (type, "내기본태그1,내기본태그2")
```

### 발행 전 확인

`--confirm` 옵션 추가로 발행 전 사용자 확인:

```bash
/velog-publish blog-post.md --confirm
```
