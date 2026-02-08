# Landing Page Client 프로젝트 기여 분석

> 작성일: 2026-02-06
> 분석 기간: 2023.09 ~ 2025.10 (약 2년)

---

## 📌 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **프로젝트명** | Landing Page Client |
| **회사** | ImagoWorks (이마고웍스) |
| **역할** | Frontend Developer |
| **기술 스택** | Next.js, React, TypeScript, i18next, AOS |
| **배포 환경** | Azure DevOps Pipeline |

---

## 📊 기여 통계

| 지표 | 수치 |
|------|------|
| **총 커밋 수** | 510개 |
| **코드 추가** | +27,339줄 |
| **코드 삭제** | -6,118줄 |
| **변경 파일** | 1,243개 |
| **Merged PR** | 30+ 개 |

### 커밋 유형별 분포

| 유형 | 커밋 수 | 비율 |
|------|--------|------|
| feat (기능 추가) | 287 | 56% |
| fix (버그 수정) | 100 | 20% |
| 버전 태그/병합 | ~100 | 20% |
| chore/style | 13 | 3% |

---

## 🏆 주요 성과

### 1. 랜딩 페이지 v3 전면 리뉴얼 주도

**기간**: 2023.09 ~ 2023.11

**상세 내용**:
- Next.js 기반 기업 랜딩 페이지 전면 재구축
- 10+ 페이지 신규 구현
  - Main Page
  - Crown Product Page
  - Studio Product Page
  - Business Overview Page
  - Company About Page
  - Career Page
  - Pricing Page
  - 기타 제품 페이지
- AOS(Animate On Scroll) 애니메이션 시스템 통합
- 인터랙티브 UI 컴포넌트 개발 (Carousel, Modal, Accordion 등)

**성과**:
- 기존 레거시 코드 대비 유지보수성 향상
- 디자인 시스템 기반 일관된 UI/UX 구현

---

### 2. 다국어(i18n) 시스템 구축

**기간**: 2023.10 ~ 2023.11

**상세 내용**:
- i18next + react-i18next 기반 다국어 시스템 설계
- TypeScript 타입 안전성 확보
  - `i18next-resources-for-ts` 패키지 도입
  - 자동 타입 생성 스크립트 구현
- 3개 언어 지원: 한국어, 영어, 일본어
- 언어별 레이아웃 최적화
  - 일본어 폰트(Noto Sans JP) 적용
  - 언어별 줄바꿈 처리
  - 커스텀 훅(`useI18nStyle`) 개발

**관련 커밋**:
```
feat: i18n typescript 적용
feat: i18next.d.ts 생성
[LANDING-121] feat: 누락된 i18n 번역 추가 및 오타 수정
[LANDING-121] fix: 언어 변경 시 AOS 적용된 일부 컴포넌트가 사라지는 문제 해결
```

**성과**:
- 타입 안전한 다국어 키 관리로 런타임 오류 방지
- 일본 시장 진출을 위한 현지화 기반 마련

---

### 3. 반응형 웹 디자인 구현

**기간**: 전체 개발 기간

**상세 내용**:
- 데스크탑/태블릿/모바일 3단계 반응형 디자인
- 모바일 터치 인터랙션 최적화
  - 스와이프 제스처 지원
  - 터치 이벤트 핸들링
- 크로스 브라우저 호환성 확보
  - Chrome, Safari, Firefox 지원
  - 모바일 브라우저 최적화

**관련 커밋**:
```
[LANDING-153] feat: credit banner close button mobile style 추가
fix: 모바일에서 영상 크기가 넘쳐 좌우 스크롤 생기는 문제 해결
[LANDING-114] fix: 크롬 모바일에서 헤더 arrow right 안보이는 문제 해결
```

---

### 4. 성능 최적화

**상세 내용**:
- Lighthouse 성능 점수 개선
- LCP(Largest Contentful Paint) 이미지 프리로드
- 이미지 최적화
  - Next.js Image 컴포넌트 활용
  - 적절한 quality 설정
  - 4x 고해상도 이미지 대응
- 캐싱 전략 적용
  - webm, woff 파일 캐시 설정

**관련 커밋**:
```
Merged in feature/LANDING-143-landing-page-lighthouse-개선 (pull request #105)
[LANDING-120] feat: LCP 이미지 preload 되도록 변경
chore: webm, woff 파일 캐시 설정 추가
```

---

### 5. 프로모션 배너 시스템 개발

**기간**: 2024.04 ~ 2024.07

**상세 내용**:
- 재사용 가능한 배너 컴포넌트 설계
- HOC(Higher-Order Component) 패턴 적용
- 다국어 지원 배너 시스템
- 구현된 배너:
  - SIDEX 전시회 배너
  - Crown CBT 베타 테스트 배너
  - Credit Promotion 배너

**관련 커밋**:
```
feat: sidex banner 추가
[LANDING-153] feat: banner hoc 추가
[LANDING-153] feat: crown cbt banner 추가
[LANDING-153] feat: banner i18n 적용
```

---

### 6. API 연동 및 데이터 통합

**상세 내용**:
- 회사 멤버 데이터 API 연동
- 이벤트 로깅 시스템 통합
  - `imago-cloud/action-log` 라이브러리 연동
  - 페이지 진입 이벤트 추적
- 동적 콘텐츠 관리

**관련 커밋**:
```
[LANDING-128] feat: get-imago api url 추가
[LANDING-128] feat: 실제 imago member 데이터를 반영하여 UI 변경
[LANDING-120] feat: 랜딩페이지 진입 시 event log 코드 추가
[LANDING-120] chore: imago-cloud/action-log 라이브러리 추가
```

---

## 📋 주요 PR 목록

| PR | 제목 | 내용 |
|----|------|------|
| #88 | i18n 문구 적용 | 전체 사이트 다국어 지원 |
| #95 | Company 페이지 프로필 영역 디자인 개편 | 멤버 섹션 UI 재설계 |
| #104 | Main Page 업데이트 | 메인 페이지 전면 개편 |
| #105 | Landing Page Lighthouse 개선 | 성능 최적화 |
| #108 | 신규 SEO 적용 | 검색 엔진 최적화 |
| #114 | CBT Banner 추가 | 프로모션 배너 시스템 |

---

## 🛠️ 기술적 도전 및 해결

### 1. AOS 애니메이션 + 언어 변경 충돌

**문제**: 언어 변경 시 AOS 애니메이션이 적용된 inline 컴포넌트가 사라지는 현상

**해결**:
- `_app` 컴포넌트에서 AOS 초기화 로직 중앙화
- 컨테이너 컴포넌트 패턴 적용으로 애니메이션 범위 격리

### 2. 일본어 레이아웃 깨짐

**문제**: 일본어 폰트의 문자 폭 차이로 레이아웃 overflow 발생

**해결**:
- Noto Sans JP 폰트 weight 600 추가
- 언어별 스타일 조정 커스텀 훅 개발
- 고정 너비 대신 flexible 레이아웃 적용

### 3. 모바일 터치 스크롤 충돌

**문제**: 터치 애니메이션이 있는 컴포넌트에서 세로 스크롤 불가

**해결**:
- 터치 이벤트 threshold 추가
- 상하 스크롤과 좌우 스와이프 분리 처리

---

## ✍️ 이력서 요약 문구

### 한 줄 요약
> Next.js 기반 기업 랜딩 페이지 v3 전면 리뉴얼 주도 - 510+ 커밋, 10+ 페이지 구현, 3개국어 i18n 시스템 구축

### 상세 버전
> - Next.js/TypeScript 기반 기업 랜딩 페이지 전면 리뉴얼 (510+ 커밋, 27,000+ LOC)
> - i18next 기반 타입 안전한 다국어 시스템 설계 및 구현 (한/영/일 3개 언어)
> - AOS 애니메이션 시스템 통합 및 반응형 웹 디자인 구현
> - Lighthouse 성능 최적화 및 SEO 개선

---

## 📅 활동 타임라인

```
2023.09 ─────────────────────────────────────────────────────
        │ 프로젝트 시작, v3 리뉴얼 착수
        │ 주요 페이지 구조 설계 및 구현
        │
2023.10 ─────────────────────────────────────────────────────
        │ 컴포넌트 개발 집중
        │ i18n 시스템 구축
        │ AOS 애니메이션 통합
        │
2023.11 ─────────────────────────────────────────────────────
        │ v3 런칭
        │ QA 및 버그 수정
        │
2023.12 ─────────────────────────────────────────────────────
        │ 안정화 작업
        │
2024.04 ~ 2024.07 ───────────────────────────────────────────
        │ 프로모션 배너 시스템 개발
        │ Crown CBT 캠페인 지원
        │
2024.09 ~ 2024.10 ───────────────────────────────────────────
        │ 이미지 최적화
        │ 버전 업데이트 (v3.0.4 ~ v3.0.5)
        │
2025.01 ~ 2025.10 ───────────────────────────────────────────
        │ 지역별 설정 최적화
        │ 캐시 설정 개선
        │ v3.0.30 릴리즈
```

---

## 🔗 관련 문서

- 프로젝트 경로: `/Users/kimjin-wan/Works/devops/landing-page-client`
- 기술 스택: Next.js, React, TypeScript, i18next, AOS, Azure DevOps
