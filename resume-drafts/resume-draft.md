# 이력서 & 경력기술서 초안

---

## 프로필

**김진완** | Frontend Developer

React, TypeScript 기반의 프론트엔드 개발자로, B2B SaaS 플랫폼에서 약 2년 6개월간 웹 애플리케이션과 데스크톱 앱을 개발했습니다. 프론트엔드 UI 개발뿐 아니라 Micro Frontend 아키텍처 설계, Nx/pnpm 모노레포 구축, Playwright E2E 테스트 자동화, Azure DevOps CI/CD 파이프라인 구성, Kubernetes 기반 테스트 스케줄러까지 개발 전반의 품질과 생산성을 높이는 데 기여했습니다.

---

## 핵심 역량

### Frontend Engineering
- React 18/19, TypeScript, Next.js 기반 대규모 SaaS 애플리케이션 개발
- React Query(TanStack Query) 기반 서버 상태 관리 아키텍처 설계
- MUI, Emotion, styled-components 활용 디자인 시스템 개발 및 운영
- VTK.js 기반 3D 모델 뷰어 개발 (마우스 인터랙션 커스터마이징, 크로스 플랫폼 조작 통일)

### Architecture & System Design
- Micro Frontend 아키텍처 설계 (Nx Monorepo + Module Federation)
- FSD(Feature-Sliced Design) 아키텍처 도입 및 ESLint 커스텀 규칙 구성
- Electron 기반 데스크톱 앱 설계 (Main/Renderer 프로세스 분리, IPC 통신)
- 분산 프로젝트 모노레포 통합 마이그레이션 (5개+ 프로젝트 통합)

### Testing & QA
- Playwright 기반 E2E 테스트 프레임워크 아키텍처 설계 (80+ 테스트 케이스)
- Jest + MSW 기반 단위 테스트 인프라 구축
- Kubernetes CronJob 기반 일일 자동 테스트 실행 환경 구축
- Page Object 패턴 적용, 테스트 코드 재사용성 향상

### CI/CD & DevOps
- Azure DevOps Pipeline 기반 다중 환경(dev/qa/prod) 배포 자동화
- Windows EV 코드 서명 CI/CD 파이프라인 구축
- Datadog RUM/Logs 모니터링 통합 (Web + Electron)
- Electron Builder 기반 크로스 플랫폼(Windows/macOS) 빌드 자동화

### Globalization
- i18next 기반 다국어 시스템 설계 및 운영 (최대 9개 언어, 커버리지 95%)
- 타입 안전한 i18n 키 관리 체계 구축
- 반응형 웹 디자인 (데스크톱/태블릿/모바일 3단계)

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| **Language** | TypeScript, JavaScript |
| **Frontend** | React 18/19, Next.js, Electron |
| **State Management** | TanStack Query (React Query), Recoil |
| **UI/Styling** | MUI, Emotion, styled-components, Storybook |
| **Build/Monorepo** | Nx, pnpm, Webpack, CRACO, Module Federation |
| **Testing** | Playwright, Jest, MSW, Testing Library |
| **3D Graphics** | VTK.js |
| **CI/CD** | Azure DevOps Pipelines, Kubernetes CronJob |
| **Monitoring** | Datadog RUM/Logs, Electron Crash Reporter |
| **i18n** | i18next, Lokalise |
| **Backend** | Node.js, Fastify, MongoDB (보조) |

---

## 경력

### 이마고웍스 (ImagoWorks)
**Frontend Developer** | 2023.09 ~ 현재

치과 CAD/CAM SaaS 플랫폼(DentBird) 프론트엔드 개발

---

### 프로젝트 1. Cloud Workspace - 치과 클라우드 플랫폼

**기간**: 2023.11 ~ 2025.04 (18개월)
**역할**: 프론트엔드 개발
**기술**: React 18, TypeScript, React Query v4, Recoil, Nx Monorepo, i18next, Chart.js, VTK.js

**담당 업무**

- **케이스 관리 기능 고도화**
  - Chunk 분할 처리 도입으로 대량 케이스 삭제/복원 시 API Timeout 문제 해결
  - Platform 필드 기반 동시성 제어로 다중 사용자 작업 충돌 방지
  - React Query Optimistic Update 패턴 적용으로 사용자 체감 응답 속도 개선

- **Storage 관리 시스템 개선**
  - File SDK 마이그레이션 (직접 API 호출 -> @imago-cloud/storage-client SDK 전환)
  - Workspace 단위 스토리지 용량 관리 체계 구축
  - 대량 파일 처리 시 Chunk 기반 API 부하 분산

- **다국어(i18n) 시스템 구축**
  - i18next 기반 9개 언어 지원 체계 설계 및 구현 (한/영/일/중/독/프/이/스/포)
  - Google Translate 자동 감지 충돌 대응 처리
  - 다국어 커버리지 95% 달성

- **인증(Auth) 시스템 안정화**
  - Auth Client SDK 점진적 업그레이드 (v0.2.0 -> v0.2.8)
  - 다중 로그인 감지 및 세션 충돌 처리 구현

- **Dashboard 통계 시스템 개발**
  - Chart.js 기반 케이스 통계 시각화 (Bar, Line, Pie 차트)
  - 날짜 포맷 국제화 연동

- **Release Note 시스템 구축**
  - React Markdown 기반 릴리즈 노트 UI 설계
  - 도메인/서비스/UI 계층 분리 (Clean Architecture)
  - Desktop/Mobile 공통 로직 libs/core 추출

**주요 성과**
- 대량 케이스 처리 안정성 100% 개선 (API Timeout 0건)
- 스토리지 API 호출 효율 30% 향상
- Desktop/Mobile 코드 재사용률 80% 달성 (Nx Monorepo)
- 인증 오류 90% 감소

---

### 프로젝트 2. DentBird Solutions - 통합 플랫폼

**기간**: 2024.06 ~ 2026.02 (20개월)
**역할**: Frontend Developer / QA Automation Engineer
**기술**: React, TypeScript, Electron, Playwright, NX Monorepo, Azure DevOps, Kubernetes

**담당 업무**

- **Linker Desktop - CAM 소프트웨어 연동 시스템 개발**
  - Electron 기반 데스크톱 앱으로 16개+ CAM 소프트웨어 실시간 연동
  - Protocol/HTTP 방식 CAM Export 좌표계 변환 구현 (MILLBOX, D+CAM, hyperDENT 등)
  - Export Session 방식 Protocol Handler 아키텍처 설계
  - Datadog RUM/Logs 모니터링 통합 (Main/Renderer 프로세스 분리 로깅)

- **E2E 테스트 자동화 시스템 구축**
  - Playwright 기반 E2E 테스트 프레임워크 아키텍처 설계
  - Page Object 패턴 적용으로 테스트 코드 재사용성 향상
  - Kubernetes CronJob 기반 일일 자동 테스트 환경 구축
  - Teams 웹훅 연동으로 테스트 결과 실시간 알림
  - 80+ E2E 테스트 케이스 작성 (로그인, 사용자 CRUD, 구독, 세션 관리)

- **모노레포 마이그레이션**
  - 분산된 5개+ 프론트엔드 프로젝트를 NX 모노레포로 통합
  - Azure DevOps Pipeline CI/CD 구성 (dev/qa/prod 환경)
  - 공통 라이브러리 추출 및 모듈화 (cloud-hooks, cloud-states, cloud-i18n)
  - Datadog RUM 모니터링 전사 적용

- **Windows 코드 서명 파이프라인 구축**
  - EV 코드 서명 CI/CD 파이프라인 구축 (linker-desktop, batch-desktop)
  - Windows/macOS 크로스 플랫폼 빌드 자동화

- **Export API 마이그레이션**
  - Modeler Export v5 API 마이그레이션 (solutionPayload 기반)
  - crown-io 모듈 리팩토링 (순수 함수 추출, 기능별 파일 분리, 타입 안전성 강화)

**주요 성과**
- 80+ E2E 테스트 케이스로 회귀 테스트 자동화
- 로그인 중복 코드 93% 감소 (auth 헬퍼 함수 추출)
- 테스트 실행 성능 39% 개선
- 16개+ CAM 소프트웨어 연동으로 사용자 워크플로우 통합

---

### 프로젝트 3. DentBird Batch Client - 배치 처리 데스크톱 앱

**기간**: 2023.12 ~ 2025.01 (13개월)
**역할**: 프론트엔드 개발 (전담)
**기술**: Electron, React, TypeScript, Recoil, VTK.js, Webpack, i18next

**담당 업무**

- **Electron 기반 데스크톱 앱 신규 개발**
  - 프로젝트 초기 세팅부터 v1.0.13까지 전체 개발 주도
  - Main/Renderer 프로세스 IPC 통신 아키텍처 설계
  - Deep Link (dentbird://) 커스텀 프로토콜 연동
  - 자동 업데이트 시스템 구현 (electron-builder)

- **API Gateway 마이그레이션**
  - Axios 인터셉터 기반 토큰 자동 갱신 시스템 설계
  - Access Token JWT 디코딩으로 불필요한 API 호출 제거
  - 환경별(dev/qa/prod) 엔드포인트 분리

- **3D Viewer UX 개선**
  - VTK.js Manipulator 커스터마이징으로 Windows/Mac 마우스 인터랙션 통일
  - Model Tree 슬라이더 UX, 토글 기능 개선

- **에러 핸들링 시스템 설계**
  - Axios 인터셉터 기반 글로벌 에러 처리 아키텍처
  - 세션 만료, 네트워크 에러 자동 처리 및 Retry 메커니즘 구현

- **빌드/배포 파이프라인 구축**
  - Webpack Main 프로세스 번들링 설정
  - Windows/Mac 코드 서명(Code Signing) 설정
  - Datadog RUM 연동 및 Electron Crash Reporter 설정

**주요 성과**
- v0.0.1 -> v1.0.13 (13개 버전 릴리즈)
- Windows/Mac 크로스 플랫폼 지원
- 영어/일본어 다국어 지원

---

### 프로젝트 4. DentBird Account - B2B SaaS 계정 관리 시스템

**기간**: 2023.09 ~ 2025.07 (1년 10개월)
**역할**: 프론트엔드 개발 (전담)
**기술**: React 18, TypeScript, TanStack Query, MUI, i18next, MSW, Jest

**담당 업무**

- **SaaS 구독 관리 시스템 전체 설계 및 구현**
  - 플랜 관리 (Free/Paid), 추가 시트 구매, 일할 계산(Pro-rata calculation) 로직 구현
  - 결제 방법 관리, 구독 취소/재개, 쿠폰 시스템 개발
  - PostMessage 기반 Payment 페이지 연동

- **팀 멤버 관리 시스템 개발**
  - Seats -> Members 시스템 전환 리팩토링
  - 멤버 초대/권한 관리 (다지역 처리 포함)

- **OAuth 회원가입 플로우 개선**
  - Storage Location 선택 기능 (글로벌 서비스 대응)
  - MFA 인증 모달 구현

- **반응형 UI 시스템 설계 및 구현**
  - 모바일/태블릿/데스크톱 대응 브레이크포인트 시스템 구축
  - SNB(Side Navigation Bar), Mobile Header 구현

- **테스트 환경 구축**
  - Jest + MSW 기반 테스트 인프라 구축
  - 주요 페이지 테스트 코드 작성 (My Plan, Subscription, Members, Add Seats)

**주요 성과**
- SaaS 구독 플로우 전체 구현으로 수익화 기반 마련
- 글로벌 서비스 대응을 위한 i18n 및 Region 선택 기능 구현

---

### 프로젝트 5. Micro Frontend 아키텍처 구축

**기간**: 2025.06 ~ 2025.07 (3주)
**역할**: 프론트엔드 개발 (전담)
**기술**: React 18, TypeScript, Nx Monorepo, Module Federation, React Query, MSW, MUI

**담당 업무**

- **Micro Frontend 아키텍처 설계 및 구현**
  - Nx 모노레포 + Module Federation 기반 독립 배포 가능한 원격 모듈 시스템 구축
  - 4개 원격 모듈 개발 (notification_fo, notification_bo, feature_toggle, user_tenant_change)
  - FSD(Feature-Sliced Design) 아키텍처 도입 및 ESLint 커스텀 규칙 구성
  - 호스트-리모트 간 타입 공유 자동화 스크립트 구현

- **시스템 알림 FO/BO 개발**
  - 알림 목록 조회, 개별/전체 읽음 처리, 읽지 않은 알림 카운트
  - 알림 CRUD 관리 페이지, 상태별/날짜별 필터링
  - Markdown 에디터 기반 알림 내용 작성

**주요 성과**
- 3주 내 4개 독립 모듈 개발 완료
- Module Federation 통한 독립 배포 체계 구축
- FSD 아키텍처 도입으로 확장 가능한 코드 구조 확립

---

### 프로젝트 6. Module Client - 마이크로 프론트엔드 모듈

**기간**: 2024.11 ~ 2025.07 (8개월)
**역할**: 프론트엔드 개발
**기술**: React, TypeScript, VTK.js, pnpm Monorepo, Module Federation

**담당 업무**

- **5개 마이크로 프론트엔드 모듈 유지보수 및 기능 개발**
  - explorer, export, viewer, setting, mobile 모듈 담당

- **외부 스캐너 연동 기능 개발**
  - Medit, Shining 3D API 통합 및 OAuth 인증 플로우 구현
  - 크로스 도메인 인증 처리

- **서브 도메인 마이그레이션**
  - 5개 모듈 동시 도메인 변경 및 무중단 배포

- **SDK 버전 관리 및 패키지 표준화**
  - File API SDK 업그레이드, pnpm 9 마이그레이션, axios 버전 통일

**주요 성과**
- 외부 스캐너 3개 서비스 연동으로 사용자 워크플로우 통합
- 5개 모듈 무중단 서브 도메인 전환 완료

---

### 프로젝트 7. Imago Cloud Design System

**기간**: 2025.04 ~ 2025.08 (4개월)
**역할**: 프론트엔드 개발 (디자인 시스템 기여)
**기술**: React 18/19, TypeScript, MUI 5, Storybook 7

**담당 업무**

- **React 19 마이그레이션**
  - Storybook 7 호환성 확보, ESLint 설정 최적화
  - 패키지 의존성 업데이트 및 버전 충돌 해결

- **DatePicker 컴포넌트 API 확장**
  - placeholder, onClick handler 외부 주입 가능하도록 인터페이스 확장
  - 하위 호환성 유지하며 기능 확장

- **프로덕션 버그 긴급 대응**
  - onClose props 오버라이드 버그 당일 수정 및 배포

- **디자인 시스템 릴리즈 관리**
  - Semantic Versioning 기반 v2(production)/v3(next) 브랜치 릴리즈 담당

---

### 프로젝트 8. 기업 랜딩 페이지

**기간**: 2023.09 ~ 2025.10 (약 2년)
**역할**: 프론트엔드 개발
**기술**: Next.js, React, TypeScript, i18next, AOS

**담당 업무**

- **랜딩 페이지 v3 전면 리뉴얼 주도**
  - Next.js 기반 10+ 페이지 신규 구현
  - AOS 애니메이션 시스템 통합, 인터랙티브 UI 컴포넌트 개발

- **타입 안전한 다국어 시스템 설계**
  - i18next + TypeScript 기반 3개 언어(한/영/일) 지원
  - i18next-resources-for-ts 패키지 도입으로 타입 자동 생성

- **성능 최적화**
  - Lighthouse 성능 점수 개선 (LCP 이미지 프리로드, 캐싱 전략)
  - Next.js Image 최적화, SEO 개선

- **프론트엔드-백엔드 풀스택 개발**
  - 백오피스 조직 관리 시스템(Groups/Teams/Members) 3계층 CRUD 구현 (React, MUI, React Query)
  - 백엔드 API 개발 (Node.js, Fastify, MongoDB) - 태그/소속 일괄 수정 API

---

## 강점 요약

### 1. 아키텍처 설계 능력
프론트엔드에 국한되지 않고, Micro Frontend(Module Federation), 모노레포(Nx, pnpm), FSD 아키텍처, Electron IPC 통신 등 시스템 전체 아키텍처를 설계하고 구축한 경험이 있습니다.

### 2. 테스트 자동화 & QA
Playwright E2E 테스트 프레임워크를 설계하고 80+ 테스트 케이스를 작성했으며, Kubernetes CronJob 기반 일일 자동 실행 환경을 구축했습니다. Jest + MSW 기반 단위 테스트 인프라도 구축하여 테스트 문화를 주도했습니다.

### 3. CI/CD 파이프라인
Azure DevOps Pipeline 기반 다중 환경 배포 자동화, Windows EV 코드 서명 파이프라인, Electron 크로스 플랫폼 빌드 자동화 등 개발-배포 전 과정의 파이프라인을 구축했습니다.

### 4. 크로스 플랫폼 개발
웹(React, Next.js), 데스크톱(Electron), 모바일 반응형까지 다양한 플랫폼에서 개발하며, VTK.js 기반 3D 뷰어에서 Windows/Mac 인터랙션 통일 등 플랫폼 특화 문제를 해결했습니다.

### 5. 글로벌 서비스 대응
최대 9개 언어 다국어 시스템을 설계/구현하고, Google Translate 충돌 대응, 언어별 레이아웃 최적화, 글로벌 Storage Region 선택 기능 등 국제화 전반을 경험했습니다.

### 6. 프로젝트 전담 및 빠른 실행력
DentBird Batch Client(Electron 앱)를 초기 세팅부터 13개 버전 릴리즈까지 전담 개발했고, Micro Frontend 시스템을 3주 만에 4개 모듈로 구축하는 등 높은 실행력을 보유하고 있습니다.

---

*마지막 업데이트: 2026-02-08*
