# Plan: Resume GitHub Mobile (이력서 GitHub 관리 + 모바일 편집 환경)

> 이력서/경력기술서를 GitHub 저장소로 관리하고, Claude.ai Projects + 모바일 앱으로 어디서든 수정할 수 있는 환경 구축

## 배경 및 문제

### 현재 상황
- `resume-drafts/` 에 이력서(`resume-2026-02-08.md`)와 경력기술서(`career-description-2026-02-08.md`) 작성 중
- 로컬 PC의 Claude Code에서만 편집 가능
- 버전 관리 없이 날짜 기반 파일명으로 관리 중

### 문제점
1. **접근성 부족**: PC 앞에서만 수정 가능, 출퇴근/외출 중 아이디어 반영 불가
2. **버전 관리 부재**: 수정 이력 추적 어려움, 이전 버전 복구 불가
3. **Claude 연동 제한**: Claude Code는 데스크톱 전용, 모바일에서 Claude와 대화하며 수정 불가
4. **산출물 관리**: 마크다운만 있고 PDF/HTML 등 제출용 포맷 자동 생성 없음

## 목표

1. **GitHub 저장소 구성**: 이력서/경력기술서를 독립 저장소로 관리
2. **자동 빌드**: 마크다운 → PDF 자동 변환 (GitHub Actions)
3. **모바일 편집 워크플로우**: Claude.ai Project 연동으로 모바일에서 수정 가능
4. **포지션별 관리**: 브랜치로 타겟 회사/포지션별 이력서 버전 관리

## 핵심 기능

### 1. GitHub 저장소 구조

```
resume/
├── README.md                    # 저장소 설명 + 사용법
├── resume.md                    # 이력서 (메인)
├── career-description.md        # 경력기술서 (메인)
├── assets/
│   └── profile-photo.jpg        # 프로필 사진 (필요시)
├── templates/
│   └── resume-style.css         # PDF 변환용 스타일
├── output/                      # 빌드 산출물 (gitignore)
│   ├── resume.pdf
│   └── career-description.pdf
├── .github/
│   └── workflows/
│       └── build-pdf.yml        # 마크다운 → PDF 자동 빌드
└── .claude-project-instructions.md  # Claude.ai Project용 지침
```

### 2. GitHub Actions - PDF 자동 빌드

- `main` 브랜치에 push 시 마크다운 → PDF 변환
- 도구: `pandoc` + `wkhtmltopdf` 또는 `weasyprint`
- 결과물: GitHub Release에 PDF 첨부 또는 Artifacts로 저장

### 3. Claude.ai Project 연동

- Claude.ai에서 "이력서 관리" Project 생성
- Knowledge에 이력서/경력기술서 + 참조 문서(sentence-patterns 등) 업로드
- Project Instructions에 다음 포함:
  - 작성 원칙 (STAR 기법, 정량적 성과 강조 등)
  - 기존 resume-ref 스킬의 reference 문서 핵심 내용
  - 출력 형식 (마크다운, 한글)

### 4. 모바일 워크플로우

```
[모바일 Claude 앱]
  "이 프로젝트 성과를 더 임팩트 있게 써줘"
       ↓
  Claude가 수정안 제안
       ↓
[GitHub 모바일 앱]
  수정 내용 커밋
       ↓
[GitHub Actions]
  PDF 자동 빌드
       ↓
  최신 PDF 다운로드 가능
```

## 구현 범위

### Phase 1: 저장소 세팅 (필수)
- [ ] GitHub에 비공개 저장소 생성
- [ ] 현재 `resume-drafts/` 파일을 저장소로 이동
- [ ] 디렉토리 구조 세팅
- [ ] README.md 작성

### Phase 2: PDF 자동 빌드 (필수)
- [ ] GitHub Actions 워크플로우 작성
- [ ] PDF 스타일(CSS) 설정
- [ ] 빌드 테스트

### Phase 3: Claude.ai Project 세팅 (필수)
- [ ] Project Instructions 문서 작성
- [ ] Knowledge 파일 목록 정리
- [ ] 모바일 앱에서 테스트

### Phase 4: 고급 기능 (선택)
- [ ] 포지션별 브랜치 관리 전략
- [ ] PR 템플릿 (변경 사유 기록)
- [ ] 이력서 diff 하이라이트

## 기술 선택

| 항목 | 선택 | 이유 |
|------|------|------|
| PDF 변환 | `pandoc` + `weasyprint` | 마크다운 → HTML → PDF, CSS 커스텀 용이 |
| 저장소 | GitHub Private | 개인정보 보호, Actions 무료 제공 |
| 모바일 편집 | Claude.ai 앱 + GitHub 앱 | 가장 현실적인 조합 |

## 제약사항

- Claude.ai Project의 Knowledge는 수동 업데이트 필요 (GitHub 자동 동기화 불가)
- GitHub 모바일 앱의 편집기는 기본적 (syntax highlight 정도)
- Claude.ai 무료 플랜은 Project 기능 제한 있을 수 있음

## 완료 조건 (DoD)

1. GitHub 비공개 저장소에 이력서/경력기술서가 관리되고 있음
2. `main` push 시 PDF가 자동 생성됨
3. Claude.ai Project Instructions 문서가 준비되어 있음
4. 모바일에서 Claude 앱 → GitHub 앱 워크플로우가 동작함

## 예상 작업 시간

- Phase 1: 저장소 세팅 ~ 30분
- Phase 2: PDF 빌드 ~ 1시간
- Phase 3: Claude.ai 세팅 ~ 30분
- 총: ~2시간
