# 김진완 | Frontend Developer

---

## 자기소개

3년차 프론트엔드 개발자로, 글로벌 B2B SaaS 플랫폼(9개 언어 지원)에서 React/TypeScript 기반 웹 애플리케이션과 Electron 데스크톱 앱을 설계/구축해왔습니다.

- React 18/19, TypeScript 환경에서의 대규모 SaaS 프론트엔드 아키텍처 설계 및 구현
- Nx Monorepo + Module Federation 기반 Micro Frontend 아키텍처 설계, 5개+ 분산 프로젝트 통합
- Playwright E2E 테스트 프레임워크 구축 및 Kubernetes CronJob 기반 일일 자동 실행 환경 구성
- Azure DevOps Pipeline 기반 다중 환경(dev/qa/prod) CI/CD 파이프라인 설계 및 Windows EV 코드 서명 자동화
- Electron 기반 크로스 플랫폼(Windows/macOS) 데스크톱 앱 전담 개발, 초기 세팅부터 13개 버전 릴리즈

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| **Language** | TypeScript, JavaScript |
| **Frontend** | React 18/19, Next.js, Electron |
| **State** | TanStack Query (React Query), Recoil |
| **UI** | MUI, Emotion, styled-components, Storybook |
| **Build** | Nx, pnpm, Webpack, Module Federation |
| **Testing** | Playwright, Jest, MSW, Testing Library |
| **3D** | VTK.js |
| **CI/CD** | Azure DevOps Pipelines, Kubernetes CronJob |
| **Monitoring** | Datadog RUM/Logs, Electron Crash Reporter |
| **i18n** | i18next, Lokalise |
| **Backend** | Node.js, Fastify, MongoDB |

---

## 경력

### 이마고웍스 (ImagoWorks) | Frontend Developer
2023.09 ~ 현재

치과 CAD/CAM SaaS 플랫폼(DentBird)의 프론트엔드를 개발 및 운영하였습니다.
웹 클라이언트, Electron 데스크톱 앱, 마이크로 프론트엔드 모듈, 디자인 시스템까지 플랫폼 전반의 프론트엔드 개발을 담당하였습니다.

---

## 프로젝트

### 1. Cloud Workspace - 치과 클라우드 플랫폼

이마고웍스 | 2023.11 ~ 2025.04 (18개월)

치과 CAD/CAM 솔루션의 클라우드 버전으로, Desktop/Mobile 공용 Nx Monorepo 환경에서 핵심 기능을 설계/구현하였습니다.

**기술**: React 18, TypeScript, React Query v4, Recoil, Nx Monorepo, i18next, Chart.js, VTK.js

- Chunk 분할 처리를 도입하여 대량 케이스 삭제/복원 시 API Timeout 문제를 해결, 대량 처리 안정성 100% 개선
- React Query Optimistic Update 패턴을 적용하고 Platform 필드 기반 동시성 제어를 구현하여 다중 사용자 작업 충돌 방지
- 직접 API 호출 방식을 @imago-cloud/storage-client SDK로 마이그레이션하여 스토리지 API 호출 효율 30% 향상
- i18next 기반 9개 언어 다국어 시스템을 설계/구축하여 커버리지 95% 달성, Google Translate 자동 감지 충돌 대응 처리
- Auth Client SDK를 v0.2.0에서 v0.2.8까지 점진적 업그레이드하고 다중 로그인 감지 로직을 구현하여 인증 오류 90% 감소
- Chart.js 기반 케이스 통계 Dashboard를 설계/구현하고 날짜 포맷 국제화를 연동
- Release Note 시스템을 Clean Architecture(도메인/서비스/UI 계층 분리)로 설계하고 Desktop/Mobile 공통 로직을 libs/core로 추출하여 코드 재사용률 80% 달성

---

### 2. DentBird Solutions - 통합 플랫폼

이마고웍스 | 2024.06 ~ 2026.02 (20개월)

E2E 테스트 자동화 체계 구축, 분산 프로젝트 모노레포 통합, Electron 기반 CAM 연동 시스템 개발을 주도하였습니다.

**기술**: React, TypeScript, Electron, Playwright, NX Monorepo, Azure DevOps, Kubernetes

- Playwright 기반 E2E 테스트 프레임워크를 설계하고 Page Object 패턴을 적용하여 80+ 테스트 케이스 구축, 로그인 중복 코드 93% 감소
- Kubernetes CronJob 기반 일일 자동 테스트 실행 환경을 구축하고 Teams 웹훅을 연동하여 테스트 결과 실시간 알림 체계 확립
- beforeAll + describe.serial 패턴으로 테스트 세션 공유 전략을 적용하여 테스트 실행 성능 39% 개선
- 분산된 5개+ 프론트엔드 프로젝트를 NX 모노레포로 통합하고, 공통 라이브러리(cloud-hooks, cloud-states, cloud-i18n)를 추출/모듈화
- Azure DevOps Pipeline 기반 다중 환경(dev/qa/prod) CI/CD를 구성하고 Datadog RUM 모니터링을 전사 적용
- Electron 기반 Linker Desktop 앱으로 16개+ CAM 소프트웨어 실시간 연동 시스템을 구축, Protocol/HTTP 방식별 좌표계 변환 알고리즘 구현
- Export Session 방식 Protocol Handler 아키텍처를 설계하고 Datadog RUM/Logs 모니터링을 Main/Renderer 프로세스별로 통합
- Windows EV 코드 서명 CI/CD 파이프라인을 구축하여 Windows/macOS 크로스 플랫폼 빌드 자동화

---

### 3. DentBird Batch Client - 배치 처리 데스크톱 앱

이마고웍스 | 2023.12 ~ 2025.01 (13개월)

치과 CAD 크라운 디자인 배치 처리 Electron 앱을 초기 세팅부터 전담 개발하여 13개 버전을 릴리즈하였습니다.

**기술**: Electron, React, TypeScript, Recoil, VTK.js, Webpack, i18next

- Electron 기반 데스크톱 앱의 Main/Renderer 프로세스 IPC 통신 아키텍처를 설계하고, Deep Link(dentbird://) 커스텀 프로토콜 및 자동 업데이트 시스템을 구현
- Axios 인터셉터 기반 토큰 자동 갱신 시스템을 설계하고, JWT 디코딩으로 불필요한 API 호출을 제거하여 API Gateway 마이그레이션 완료
- VTK.js Manipulator를 커스터마이징하여 Windows/Mac 간 마우스 인터랙션(Rotate, Pan, Zoom)을 통일하고, Model Tree 슬라이더 UX를 개선
- Axios 인터셉터 기반 글로벌 에러 처리 아키텍처를 구축하여 세션 만료, 네트워크 에러 자동 처리 및 Retry 메커니즘을 확립
- Webpack Main 프로세스 번들링, Windows/Mac 코드 서명, Datadog RUM 모니터링, Crash Reporter까지 빌드/배포/모니터링 파이프라인을 구축

---

### 4. DentBird Account - B2B SaaS 계정 관리 시스템

이마고웍스 | 2023.09 ~ 2025.07 (1년 10개월)

B2B SaaS 구독/결제/멤버 관리 시스템의 프론트엔드를 전담 설계/구현하여 수익화 기반을 마련하였습니다.

**기술**: React 18, TypeScript, TanStack Query, MUI, i18next, MSW, Jest

- SaaS 구독 관리 시스템(Free/Paid 플랜, 추가 시트 구매, 일할 계산, 결제 방법 관리, 구독 취소/재개, 쿠폰)을 전체 설계/구현
- Seats에서 Members로 시스템을 전환하는 리팩토링을 수행하고, 멤버 초대/권한 관리(다지역 처리 포함)를 구현
- OAuth 회원가입 플로우에 글로벌 Storage Location 선택 기능을 추가하고 MFA 인증을 구현하여 글로벌 서비스 대응
- 모바일/태블릿/데스크톱 3단계 반응형 UI 시스템을 설계하고, SNB(Side Navigation Bar) 및 Mobile Header를 구현
- Jest + MSW 기반 테스트 인프라를 구축하고 주요 페이지(My Plan, Subscription, Members, Add Seats) 테스트 코드를 작성

---

### 5. Micro Frontend 아키텍처 구축

이마고웍스 | 2025.06 ~ 2025.07 (3주)

기존 모놀리식 프론트엔드의 확장성 한계를 극복하기 위해, Micro Frontend 아키텍처를 설계하고 3주 내 4개 독립 모듈을 구축하였습니다.

**기술**: React 18, TypeScript, Nx Monorepo, Module Federation, React Query, MSW, MUI

- Nx 모노레포 + Module Federation 기반 독립 배포 가능한 원격 모듈 시스템을 설계/구축하고, 호스트-리모트 간 타입 공유 자동화 스크립트를 구현
- FSD(Feature-Sliced Design) 아키텍처를 도입하고 ESLint 커스텀 규칙을 구성하여 레이어 간 import 방향을 린트로 강제
- 시스템 알림 FO/BO 풀스택 프론트엔드를 개발 (CRUD, 상태별/날짜별 필터링, React Query 서버 상태 관리, i18n 다국어 지원)
- 3주 내 4개 원격 모듈(notification_fo, notification_bo, feature_toggle, user_tenant_change)을 개발 완료

---

### 6. Module Client - 마이크로 프론트엔드 모듈

이마고웍스 | 2024.11 ~ 2025.07 (8개월)

Module Federation 기반 5개 마이크로 프론트엔드 모듈(explorer, export, viewer, setting, mobile)의 기능 개발 및 유지보수를 담당하였습니다.

**기술**: React, TypeScript, VTK.js, pnpm Monorepo, Module Federation

- Medit, Shining 3D 등 외부 치과 스캐너 3개 서비스의 API 통합 및 OAuth 인증 플로우를 구현하여 사용자 워크플로우 통합
- 5개 모듈의 서브 도메인 마이그레이션을 동시 수행하여 무중단 전환 완료
- File API SDK 업그레이드, pnpm 9 마이그레이션, axios v1.7.8 통일로 패키지 표준화 수행

---

### 7. Imago Cloud Design System

이마고웍스 | 2025.04 ~ 2025.08 (4개월)

MUI 기반 React 공용 디자인 시스템(@imago-cloud/design-system)의 개발 및 릴리즈 관리에 기여하였습니다.

**기술**: React 18/19, TypeScript, MUI 5, Storybook 7

- React 19 마이그레이션을 수행하여 Storybook 7 호환성을 확보하고 패키지 의존성 충돌을 해결
- DatePicker 컴포넌트의 placeholder, onClick handler를 외부 주입 가능하도록 API를 확장하고, 하위 호환성을 유지
- onClose props 오버라이드 프로덕션 버그를 당일 수정/배포하여 사용 팀 영향 최소화
- Semantic Versioning 기반 v2(production)/v3(next) 브랜치 릴리즈를 담당

---

### 8. 기업 랜딩 페이지

이마고웍스 | 2023.09 ~ 2025.10 (약 2년)

Next.js 기반 기업 랜딩 페이지 v3 전면 리뉴얼을 주도하고, 다국어 시스템 구축 및 성능 최적화를 수행하였습니다.

**기술**: Next.js, React, TypeScript, i18next, Node.js, Fastify, MongoDB

- Next.js 기반 10+ 페이지를 신규 구현하고 AOS 애니메이션 시스템을 통합하여 인터랙티브 UI 구현
- i18next + TypeScript 기반 타입 안전한 다국어 시스템을 설계하여 3개 언어(한/영/일) 지원, i18next-resources-for-ts 패키지를 도입하여 타입 자동 생성
- LCP 이미지 프리로드, Next.js Image 최적화, 캐싱 전략 적용으로 Lighthouse 성능 점수를 개선하고 SEO를 최적화
- 백오피스 조직 관리 시스템(Groups/Teams/Members 3계층 CRUD)을 React + React Query로 구현하고, Node.js/Fastify/MongoDB 기반 일괄 수정 API를 설계/개발하여 풀스택 기여

---

## 핵심 역량

### 프론트엔드 아키텍처 설계
Micro Frontend(Nx + Module Federation), FSD 아키텍처, Electron IPC 통신 설계 등 프론트엔드에 국한되지 않는 시스템 아키텍처를 설계하고 구축하였습니다. 5개+ 분산 프로젝트를 모노레포로 통합하고, 공통 라이브러리 추출을 통해 코드 재사용률 80%를 달성하였습니다.

### 테스트 자동화 체계 구축
Playwright 기반 E2E 테스트 프레임워크를 설계하여 80+ 테스트 케이스를 구축하고, Kubernetes CronJob 기반 일일 자동 실행 환경을 구성하였습니다. Jest + MSW 기반 단위 테스트 인프라도 구축하여 테스트 문화를 주도하였습니다.

### CI/CD 파이프라인 구축
Azure DevOps Pipeline 기반 다중 환경 배포 자동화, Windows EV 코드 서명 파이프라인, Electron 크로스 플랫폼 빌드 자동화 등 개발에서 배포까지의 전 과정을 자동화하였습니다.

### 크로스 플랫폼 전담 개발
웹(React, Next.js), 데스크톱(Electron), 모바일 반응형까지 다양한 플랫폼에서 개발하였습니다. Electron 앱을 초기 세팅부터 13개 버전 릴리즈까지 전담하고, VTK.js 기반 3D 뷰어에서 Windows/Mac 인터랙션을 통일하는 등 플랫폼 특화 문제를 해결하였습니다.

### 글로벌 서비스 대응
i18next 기반 최대 9개 언어 다국어 시스템을 설계/구축하여 커버리지 95%를 달성하고, Google Translate 충돌 대응, 언어별 레이아웃 최적화, 글로벌 Storage Region 선택 기능 등 국제화 전반을 구현하였습니다.

---

*마지막 업데이트: 2026-02-08*
