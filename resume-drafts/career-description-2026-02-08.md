# 경력기술서

## 김진완 (Jinwan Kim)

**Frontend Engineer** | 글로벌 B2B SaaS 프론트엔드 설계 | 이마고웍스 (ImagoWorks) | 2023.09 ~ 현재

---

## 회사 소개

이마고웍스는 AI 기반 치과 CAD/CAM 소프트웨어 선도 기업으로, DentBird 브랜드로 글로벌 시장에 B2B SaaS를 제공합니다. 25개 앱/30개+ 라이브러리 규모의 NX 모노레포 아키텍처를 설계하고, 3개 언어(한/영/일) 글로벌 서비스의 프론트엔드 시스템을 구축합니다. Micro Frontend 전환, 모노레포 통합, 도메인 아키텍처 설계 등 플랫폼 전반의 기술적 의사결정을 주도합니다.

---

## 핵심 성과

- **아키텍처 설계**: Module Federation 기반 Micro Frontend 전환, 독립 배포 체계 확립
- **플랫폼 통합**: 5개+ 분산 프로젝트 → NX 모노레포 통합, 도메인 33→10개 통합 설계
- **글로벌 서비스**: 3개 언어 i18n, 글로벌 리전 선택, 16개+ 글로벌 CAM SW 연동
- **품질 자동화**: E2E 80+ TC 자동화, AI 기반 변경 감지, TypeScript 에러 688→0
- **다영역**: Electron 데스크톱, Fastify 백엔드, K8s CI/CD, Datadog 모니터링, VTK.js 3D

---

## 프로젝트 1. 공통 아키텍처 개선

### 1-1. 토큰 관리 아키텍처 리팩토링 (2025.10, 3일)

| 항목 | 내용 |
|------|------|
| **기술** | TypeScript, React, Axios, EventSource, TDD |

**문제**: Promise Race Condition, SSE Stale Closure, Axios 강결합으로 인한 단위 테스트 불가

**해결**:
- **Facade 패턴** 적용: AuthService를 HTTP 클라이언트 비의존적인 토큰 상태 관리자로 분리
- **Single Source of Truth**: 토큰 저장소를 AuthService 내부로 일원화, getter로 최신 토큰 보장
- **책임 분리**: 인터셉터 로직을 각 Axios 인스턴스로 이동, 의존성 역전

**성과**: 코드 **200줄 → 33줄 (85% 감소)**, Race Condition/Stale Closure 해결, **22개 단위 테스트** 통과

### 1-2. 통합 도메인 전환 프로젝트 (2025.11 ~ 현재, Phase 0 완료)

| 항목 | 내용 |
|------|------|
| **기술** | TypeScript, Kotlin/Spring, Nginx, Azure, TDD |

**문제**: 도메인 33개, SSL 인증서 33개, 환경변수 67개 관리, 19개 Azure Static Web Apps 독립 배포

**해결**:
- **Graceful Dual-Mode 전략**: 기존 도메인 유지 + 신규 통합 도메인 점진적 추가
- **urlHelper 라이브러리**: 런타임 환경 자동 감지, 통합/레거시 양쪽 호환 (TDD, 22개 테스트)
- Backend CookieUtil **67% 간소화**
- 로컬 개발환경: localhost 포트 방식, Webpack Proxy Same-Origin

**Phase 0 완료 성과**:
- urlHelper 라이브러리 TDD 개발 (22개 테스트, 런타임 환경 자동 감지)
- Backend CookieUtil **67% 간소화**
- Graceful Dual-Mode 전략으로 무중단 전환 기반 마련
- **예상 효과**: 도메인 33→10개(70%↓), SSL 33→1개(97%↓), 환경변수 67→5개(92%↓), 배포 45→10분(78%↓)

### 1-3. 레거시 모노레포 마이그레이션 (2025.09, 2주)

- 8단계 마이그레이션 계획 수립 및 실행
- Git Subtree 활용 히스토리 보존
- **TypeScript 에러 688개 → 0개 (100% 해결)**
- MUI v7 런타임 이슈 해결, 순환 의존성 해결
- NX 빌드/배포 파이프라인 통합

### 1-4. i18n 스크립트 중앙화 (2025.10, 1일)

- **6개 분산 스크립트 → 단일 스크립트** 통합 (Lokalise API)
- 업로드/다운로드 스크립트 분리
- 4개 커밋으로 완료

---

## 프로젝트 2. Micro Frontend 모듈 시스템 설계 및 개발

| 항목 | 내용 |
|------|------|
| **기간** | 2024.11 ~ 2025.07 (8개월) |
| **역할** | 아키텍처 설계 및 구현 전담 |
| **기술** | React 18, TypeScript, NX, Module Federation, pnpm, VTK.js, TanStack Query, MSW, MUI |
| **규모** | 196 커밋 (87+109), 4개 원격 모듈 신규 + 5개 기존 모듈 유지보수 |

### 프로젝트 설명

모놀리식 프론트엔드의 확장성 한계를 Module Federation 기반 Micro Frontend 아키텍처로 전환하여 독립 배포 체계를 확립했습니다. FSD 아키텍처 도입으로 확장 가능한 코드 구조를 구축하고, 3주 내 4개 원격 모듈 신규 개발을 완료했습니다 (87 커밋, 58K+ LOC).

### 담당 업무

#### 2-1. Micro Frontend 아키텍처 설계 및 구축 (2025.06.18 ~ 2025.07.09, 3주)

- NX 모노레포 + Module Federation 기반 호스트-리모트 아키텍처 설계
  - `@module-federation/enhanced` 공유 의존성 최적화
  - singleton 옵션으로 React/React Query 단일 인스턴스 강제, requiredVersion 버전 호환성 보장
  - eager loading 전략 적용
- **FSD(Feature-Sliced Design) 아키텍처 도입**
  - `tsconfig.fsd.json` 공통 설정 파일 (Path alias: @app, @pages, @features, @entities, @shared)
  - `eslint-fsd.config.mjs` 커스텀 린트 규칙: 레이어 간 import 방향 강제
- 호스트-리모트 간 타입 공유 자동화
  - 빌드 시 .d.ts 파일 자동 생성 스크립트
  - 타입 정의 ZIP 압축 후 배포 (`generate:types`)
- 개발 환경 CORS 해결: devServer headers, Access-Control-Allow-Origin, historyApiFallback

#### 2-2. 시스템 알림 FO(Front Office) 개발 (2025.06.19 ~ 2025.07.07)

- 알림 목록/상세: Notification Bell, 빈 알림 상태 UI, 알림 Dialog, Markdown Viewer 연동
- 읽음 처리: Mark as Read (개별), Mark All as Read, Unread Count API 연동, invalidate 갱신
- HTTP Client 인터페이스 설계: Cloud Center Server Type 대응, API URL 구조 변경 (cloud/v4)
- i18n 초기 세팅: App 컴포넌트 props로 언어 값 주입, 알림 시간 표시 로컬라이징

#### 2-3. 시스템 알림 BO(Back Office) 개발 (2025.06.26 ~ 2025.07.09)

- 알림 CRUD 관리 페이지, React Router DOM 라우팅
- Status Filter (All/Active/Inactive), Date Range Picker (MUI X Date Pickers)
- Query Key에 URL params 연동, Filter 데이터 변경 함수 통합
- Markdown Editor (React MD Editor) 연동
- MSW Mock API 구현, Bootstrap 초기화 로직 설계, React Query DevTools

#### 2-4. 기타 원격 모듈

- Feature Toggle 관리 UI 원격 모듈 (PR #22206)
- Tenant Change 원격 모듈 (PR #21637): Type 선언 파일 자동 생성 스크립트, ZIP 자동화

#### 2-5. 외부 스캐너 연동 시스템 (2025.03 ~ 2025.05)

- **Medit 스캐너**: Legacy API 변경 대응, OAuth 콜백 페이지 redirect URL, 환경별 도메인 분기
- **Shining 3D**: 자동 로그인 버그 수정, QMS 환경변수 관리, 인증 플로우 안정화
- **Connect 도메인**: Allow origin 설정, 크로스 도메인 API 요청 처리

#### 2-6. 서브 도메인 마이그레이션 (2025.03, PR #21245)

- 전체 모듈 (explorer, export, viewer, setting, mobile) 도메인 변경
- 환경변수 기반 도메인 관리 체계 구축 (dev/qa/prod)
- mobile, milling 도메인 추가 대응

**성과**: 5개 모듈 **동시 무중단 배포 성공**

#### 2-7. SDK 및 패키지 버전 관리 (2025.04 ~ 2025.06)

- File API SDK 버전업 대응, axios 헤더 설정 방식 개선
- pnpm 9 마이그레이션: lockfile 포맷 변경, 버전 요구사항 설정
- 전체 모듈 axios **v1.7.8 통일**, 공통 인스턴스 관리

### 성과

- **3주 내 4개 독립 모듈 개발 완료** (87 커밋, 58K+ LOC)
- Module Federation 기반 **독립 배포 체계** 구축
- FSD 아키텍처 도입으로 **확장 가능한 코드 구조** 확립
- 3개 외부 스캐너 서비스 연동
- 22건 버그 수정 (Critical 포함)

---

## 프로젝트 3. DentBird Account - B2B SaaS 구독/계정 관리 시스템

| 항목 | 내용 |
|------|------|
| **기간** | 2023.09 ~ 2025.07 (1년 10개월) |
| **역할** | 프론트엔드 전담 개발 |
| **기술** | React 18, TypeScript, TanStack Query, MUI v5, react-hook-form, i18next, MSW, Jest, Axios, Datadog |
| **규모** | 160+ 커밋 |

### 프로젝트 설명

글로벌 B2B SaaS 수익화를 위한 구독 관리 시스템을 설계하고 프론트엔드 전체를 구축했습니다. 일할 계산(Pro-rata) 로직 기반 플랜/시트 구매, 글로벌 리전 선택, 멤버 관리, OAuth 인증, 반응형 UI를 포함한 160+ 커밋으로 전체 구독 워크플로우를 완성했습니다.

### 담당 업무

#### 3-1. SaaS 구독 관리 시스템 구축 (2024.01 ~ 2024.06, 핵심 성과)

- 플랜 관리: Free/Paid Plan 상태 관리 및 UI, Upgrade/Activate Dialogue
- 추가 시트 구매: **일할 계산(Pro-rata) 로직** 구현, 가격 계산식 UI (View Details)
  - Purchase Estimate API, Add Seats Buy API 연동
- 결제 시스템: Payment Method 관리, Billing Type Dialogue
  - Payment Failed 재시도 버튼, View Credit History
  - PostMessage 기반 Payment 페이지 연동, Ping-back 구현
- 구독 취소/재개: 취소 사유 선택 UI (Other reason 200자 제한), Resume 버튼
- 쿠폰: Coupon Input UI, Coupon Information Dialogue, 테스트 스펙 작성

#### 3-2. 팀 멤버 관리 시스템 (2023.12 ~ 2024.03)

- **Seats → Members 시스템 전환** 리팩토링: 네이밍/로직/API 전면 변경
- 멤버 초대: Invite User 구현, 이메일 필드 검증, **다른 지역 유저 초대 처리**
- 권한 관리: Owner 표시, Dealership 유저 처리
- Member List UI: Divider, Header, Seat Counter 리팩토링

#### 3-3. OAuth 회원가입 플로우 개선 (2023.09 ~ 2023.11)

- Storage Location 선택: 글로벌 리전 선택 UI, '(Recommended)' 표시 로직
- OAuth 회원가입 후 Storage 선택 단계 삽입, loginToken payload 추가 대응
- MFA Verification 모달 구현
- 비밀번호 변경 기능 (데스크톱/모바일), Password Tooltip

#### 3-4. 워크스페이스 관리 (2024.02 ~ 2024.05)

- Workspace ID 기반 API 요청 구조 설계
- 초대된 Workspace 관리, Default Value 처리
- 워크스페이스명 공란 저장 문제 등 버그 수정

#### 3-5. 반응형 UI/UX 시스템 (2023.11 ~ 2024.01)

- 반응형 Break Point 및 컨테이너 너비 변경
- Mobile Header, Page Wrapper 구현
- SNB (Side Navigation Bar) 구현, 라우터/폴더 구조 설계
- Tablet Responsive Hook 구현, 특정 Viewport 사이즈 대응

#### 3-6. 국제화(i18n) 및 테스트 환경 (2024.01 ~ 2024.05)

- Members, Layout, Mobile Header Title 등 전체 i18n 적용
- Jest 환경 구축 및 추가 세팅
- MSW Handler에 passthrough 추가, Mock Server 구현 (Seat, MyPlan)
- 주요 페이지 테스트 코드 작성 (My Plan, Subscription, Members, Add Seats, Coupon)

### 주요 버그 수정

- Processing 상태 무한 폴링 수정, Remaining Days 0 계산식 처리
- Free Trial 기간 중 추가 시트 구매 불가 처리
- Dealership 유저 Members 화면 진입 처리
- 회원가입 시 이메일 인증 페이지 처리, 브라우저 번역 기능 대응

### 성과

- 160+ 커밋으로 **구독/멤버/워크스페이스 기능 전담 개발**
- SaaS 구독 플로우 전체 구현으로 **수익화 기반 마련**
- 글로벌 서비스 대응: i18n + Region 선택 기능

---

## 프로젝트 4. DentBird Solutions - Electron CAM 연동 및 플랫폼 개발

| 항목 | 내용 |
|------|------|
| **기간** | 2024.06 ~ 현재 (약 20개월) |
| **역할** | Frontend Engineer / QA Automation Engineer |
| **기술** | Electron, React, TypeScript, Playwright, NX Monorepo, Azure Pipelines, Datadog, K8s |
| **규모** | 307 커밋, 275 PR, +269,930줄 / -32,911줄 |

### 프로젝트 설명

치과 CAD/CAM SaaS 플랫폼의 확장성과 안정성을 확보하기 위해 핵심 프론트엔드 시스템을 설계하고 구축했습니다. 16개+ CAM 소프트웨어 연동 자동화, 80+ E2E 테스트로 회귀 테스트 자동화, 5개+ 프로젝트 모노레포 통합을 주도하여 개발 생산성과 배포 효율성을 향상시켰습니다.

### 담당 업무

#### 4-1. Linker Desktop - CAM 소프트웨어 연동 시스템 (2025.11 ~ 2026.02)

- 16개+ CAM 소프트웨어별 좌표계 차이를 `constructionInfo.transformMat` 변환 매트릭스 알고리즘으로 해결
  - STL/PLY 파일 3D 좌표계 변환 로직 구현 (MillBox, D+CAM, ALPHA AI, hyperDENT, PreForm 등)
- Export Session 방식 Protocol Handler 아키텍처 설계
  - `dentbird-linker://` 딥링크 기반 데이터 전달 구조 구축
  - embed-modules 리팩토링으로 모듈 구조 개선
- Azure Pipelines 기반 Windows/macOS 크로스 플랫폼 빌드 자동화 (EV 코드 서명 포함)
- Datadog RUM/Logs 통합으로 Main/Renderer 프로세스 에러 추적 체계 구축

#### 4-2. Chrome LNA 규제 대응 - Custom Protocol 전환 (2025.12, 5일)

- Chrome 142 localhost 차단 규제를 Custom Protocol 아키텍처 전환으로 선제 대응
  - 3개 CAM SW(MillBox, D+CAM, ALPHA AI)를 `dentbird-linker://` 딥링크 방식으로 마이그레이션
- 분산된 Electron 앱을 NX 모노레포로 마이그레이션 (Git Subtree로 히스토리 보존)
- Feature Flag 설계: localStorage 기반 → Datadog 연동 점진적 롤아웃 전략
- TDD 기반 구현: INI/XML 생성, HTTP 통신 로직 단위 테스트 18개 작성 (INI 5 + HTTP 8 + config 5)

**성과**:
- Electron 인스톨러 크기 **854MB → 78MB (91% 감소)** (webpack DefinePlugin 환경변수 빌드 시점 주입)
- 16개 마이그레이션 체크리스트 100% 완료
- Task 완료율 83% (6개 중 5개)

#### 4-3. E2E 테스트 자동화 시스템 구축 (2025.08 ~ 2025.12)

- Playwright 기반 E2E 테스트 프레임워크를 구축하여 80+ 테스트 케이스 자동화
  - Page Object 패턴 적용으로 테스트 코드 재사용성 향상
  - beforeAll + describe.serial 패턴으로 Docker/K8s 환경 안정성 확보
  - EC2 기반 SSH 접근 방식으로 K8s 브라우저 불안정 문제 해결
- 테스트 시나리오: 로그인/인증 (멀티 브라우저 동시 로그인 감지), 사용자 CRUD (8개 TC), 구독 관리, 세션 관리
- K8s CronJob 기반 일일 자동 테스트 환경 구축 (Phase 1, 2 완료)
- **Claude Code CLI 기반 AI 변경 감지 시스템** 구축 (2025.12, 3일)
  - 커밋 변경사항 자동 분석 → 관련 테스트 선별 실행 (10분 주기)
  - Lockfile 기반 동시 실행 방지, State tracking으로 중복 분석 방지
- Teams 웹훅 연동 (Power Automate): 테스트 결과 실시간 알림
- Playwright HTML 리포트 서빙 (Nginx COEP/COOP 헤더)

**성과**:
- **80+ E2E 테스트 케이스**로 회귀 테스트 자동화
- 로그인 중복 코드 **93% 감소** (auth 헬퍼 함수 추출)
- 테스트 실행 성능 **39% 개선** (테스트별 로그인 세션 공유)

#### 4-4. Export 기능 개선 및 API 마이그레이션 (2025.12 ~ 2026.02)

- Modeler Export v5 API 마이그레이션 (solutionPayload 기반)
- productDisplayType 기반 Die/Base 분류 로직 개선
- crown-io 모듈 리팩토링: 순수 함수 추출, 기능별 파일 분리 (`getCAMProtocolExportData`), 타입 안전성 강화
- Bridge Export CI 파일 통합 생성 및 Progress 개선
- D+CAM export INI 파일 치아 정보 누락 버그 수정

**성과**: v5 API 마이그레이션으로 Legacy fallback 코드 제거, 순수 함수 추출로 테스트 용이성 향상

#### 4-5. Viewer Module 기능 개선 (2024.09 ~ 2025.08)

- 3D 모델 뷰어 기능 개선: Bridge 생성일자 표기, Model tree 정렬 로직 수정
- RGBA PLY 파일 텍스처 지원
- Case Share 기능: 공유 링크 생성 시 치식 표기법(notation) 적용, 만료 링크 처리
- 모바일 최적화: 파일명 말줄임, 스크롤 영역 버그 수정

#### 4-6. Cloud/Module 클라이언트 모노레포 마이그레이션 (2024.06 ~ 2025.01)

- 분산된 5개+ 프론트엔드 프로젝트를 NX 모노레포로 통합
  - Cloud Desktop/Mobile, Viewer/Export/Explorer 모듈, Dealer Backoffice
- Azure DevOps Pipeline CI/CD 구성 (dev/qa/prod 환경)
- 공통 라이브러리 추출 및 모듈화 (cloud-hooks, cloud-states, cloud-i18n)
- Datadog RUM 모니터링 전사 적용
- i18n 다운로드/업로드 로직 중앙화

---

## 프로젝트 5. DentBird Batch Client - Electron 데스크톱 앱

| 항목 | 내용 |
|------|------|
| **기간** | 2023.12 ~ 2025.01 (13개월) |
| **역할** | 설계 및 구현 전담 (1인 개발) |
| **기술** | Electron, React, TypeScript, Recoil, VTK.js, Axios, i18next, Webpack, CRACO |
| **규모** | 347 커밋, +34,918줄 / -12,387줄, 13개 버전 릴리즈 |

### 프로젝트 설명

치과 CAD 크라운 디자인 작업의 배치 처리 자동화를 위해 Electron 기반 데스크톱 앱을 설계하고, 아키텍처 설계부터 v1.0.13 프로덕션 릴리즈까지 전체 개발을 주도했습니다. 347 커밋, 13개 버전 릴리즈, Windows/Mac 크로스 플랫폼 지원을 완성했습니다.

### 담당 업무

#### 5-1. Electron 앱 아키텍처 설계 및 초기 구축 (2023.12 ~ 2024.04)

- Main/Renderer 프로세스 분리 IPC 통신 구조 설계
- React + TypeScript + CRACO 기반 프로젝트 세팅
- Deep Link 연동: `dentbird://` 커스텀 프로토콜로 웹에서 앱 실행
- 자동 업데이트 시스템: Electron Builder 기반, 업데이트 단계 UI 구현
- React Router 기반 라우팅, SNB(Side Navigation Bar), Page Header 공통 컴포넌트
- Jest 테스트 환경, MSW(Mock Service Worker) 연동
- i18n 초기 세팅 (영어/일본어)

#### 5-2. 3D Viewer UX 개선 (2024.06)

- VTK.js 기반 3D Viewer 마우스 인터랙션 Windows/Mac 통일
  - VTK Pan/Rotate/Zoom Manipulator 타입 선언 및 커스터마이징
  - Windows: 좌클릭=Rotate, 우클릭=Pan, 휠=Zoom
  - Mac: Ctrl+좌클릭=Pan 지원
- Model Tree 개선: Slider Control 훅 분리, Group Toggle, Additional Mesh List
- Opacity 상태 유지 버그 수정
- 다국어 적용 (3D Viewer P002, Additional Model)

#### 5-3. API Gateway 마이그레이션 (2024.08)

- Axios 인터셉터 기반 토큰 자동 갱신 시스템 구축
- Access Token Decode 함수 구현: JWT 디코딩으로 불필요한 API 호출 제거
- API Gateway URL 전환, 환경별 (dev/qa/prod) 환경변수 분리
- 로그아웃 후 재로그인 시 토큰 클리어 처리

#### 5-4. 에러 핸들링 시스템 고도화 (2024.05 ~ 2024.06)

- Crown Module Network Error Retry 버튼 구현
- Axios Interceptor 글로벌 에러 처리 (`processOnLocal`/`processOnServer`)
- 세션 만료 감지: Crown Window 자동 닫기, Auth Helper 함수 분리
- Axios Header 공유 방지 (크로스 도메인 인증 이슈)
- Unknown 에러 처리: Failed List Unknown Description 추가

#### 5-5. Crown Module 프로세서 (2024.03 ~ 2024.10)

- Crown Core Module Initialize
- WASM Memory Checker 컴포넌트: 메모리 상태 모니터링
- Crown Parameter 변환 로직, Local/Server 처리 분기
- Crown Window 생성/관리, Dev Tools 환경별 표시
- 15분 Timeout Failed 처리, Uncaught Error Handler

#### 5-6. Import/Export 기능 (2024.01 ~ 2024.02)

- File Upload UI + Drag & Drop 기능 구현
- 폴더 재귀 탐색 구현 (중첩 폴더 내 파일 자동 감지)
- Import Guide Dialog (영상/이미지)
- Export Module 연동, Case Validate API, Storage 용량 확인 API
- Case/Project 로컬 DB 관리 (앱 종료 시 Case 정리, 순서 변경/삭제)

#### 5-7. Design Case API 대응 (2024.09)

- 백엔드 Design Case API 전면 변경에 따른 클라이언트 마이그레이션 (11개 커밋)
- Design Case 타입 재정의, Filtering/Query Option 수정
- Teeth Label 컴포넌트 추가, i18n 영어/일본어 지원

#### 5-8. 모니터링 및 빌드/배포 (2024.03 ~ 2025.01)

- Electron Crash Reporter 초기 설정 (크래시 리포트 자동 전송)
- Datadog RUM 연동 (환경별 설정 분리, 빌드 시 환경변수 주입)
- Webpack Main 프로세스 번들링 (Preload 스크립트/loadURL 경로 변경)
- CRACO 환경변수 주입, 환경별 ENV 파일 분리
- Windows/Mac Code Signing 설정
- QA/Prod 브랜치 분리, 빌드 스크립트, Artifact 버전 관리

### 성과

- **347개 커밋**, v0.0.1 → v1.0.13 (**13개 버전 릴리즈**)
- Windows/Mac **크로스 플랫폼** 지원 완성
- 영어/일본어 다국어 지원

---

## 프로젝트 6. 기업 랜딩 페이지 풀스택 개발

| 항목 | 내용 |
|------|------|
| **기간** | 2023.09 ~ 2025.10 (약 2년) |
| **역할** | 프론트엔드 개발 (주도) + 백엔드 API 일부 |
| **기술** | Next.js, React, TypeScript, i18next, AOS, MUI v5, React Query, React Hook Form, Fastify, MongoDB |
| **규모** | 568 커밋 (Client 510 + BO 53 + Server 5), 30+ PR |

### 프로젝트 설명

이마고웍스 기업 랜딩 페이지를 Next.js 기반으로 전면 재구축하고, 관리자 Backoffice와 서버 API를 함께 개발한 풀스택 프로젝트입니다.

### 담당 업무

#### 6-1. Landing Page Client - v3 전면 리뉴얼 (2023.09 ~ 2023.11)

- Next.js 기반 기업 랜딩 페이지 10+ 페이지 신규 구현
  - Main, Crown Product, Studio Product, Business Overview, Company About, Career, Pricing 등
- AOS(Animate On Scroll) 애니메이션 시스템 통합
  - 언어 변경 시 AOS inline 컴포넌트 사라짐 해결: `_app` 초기화 중앙화, 컨테이너 패턴 적용
- 인터랙티브 UI 컴포넌트: Carousel, Modal, Accordion 등

#### 6-2. 다국어(i18n) 시스템 구축 (2023.10 ~ 2023.11)

- i18next + react-i18next 기반 타입 안전한 다국어 시스템 설계
- `i18next-resources-for-ts` 도입으로 자동 타입 생성 스크립트 구현
- 3개 언어 지원: 한국어, 영어, 일본어
- 언어별 레이아웃 최적화
  - Noto Sans JP 폰트 weight 600 추가
  - `useI18nStyle` 커스텀 훅 개발 (언어별 줄바꿈 처리)
  - 고정 너비 대신 flexible 레이아웃 적용

**성과**: 타입 안전한 다국어 키 관리로 런타임 오류 방지, 일본 시장 진출 현지화 기반 마련

#### 6-3. 반응형 웹 디자인

- 데스크탑/태블릿/모바일 3단계 반응형 디자인
- 모바일 터치 인터랙션 최적화: 스와이프 제스처 지원
  - 터치 이벤트 threshold 추가, 상하 스크롤과 좌우 스와이프 분리
- 크로스 브라우저 호환: Chrome, Safari, Firefox, 모바일 브라우저

#### 6-4. 성능 최적화

- Lighthouse 성능 점수 개선 (PR #105)
- LCP(Largest Contentful Paint) 이미지 프리로드
- Next.js Image 컴포넌트 활용, 4x 고해상도 대응, quality 설정
- webm, woff 파일 캐시 설정

#### 6-5. 프로모션 배너 시스템 (2024.04 ~ 2024.07)

- HOC(Higher-Order Component) 패턴 적용 재사용 배너 컴포넌트 설계
- 다국어 지원 배너: SIDEX 전시회, Crown CBT 베타 테스트, Credit Promotion

#### 6-6. API 연동

- 회사 멤버 데이터 API 연동: 실제 imago member 데이터 반영 UI
- `imago-cloud/action-log` 라이브러리 연동: 페이지 진입 이벤트 추적

#### 6-7. Backoffice - 조직 관리 시스템 구축 (2023.12, 1주, 53 커밋)

- **Company 페이지 Groups → Teams → Members 3계층 조직 구조 설계 및 구현** [LANDING-129]
- React Query 캐시 전략: 계층별 쿼리 키 관리 및 무효화 전략 (IMAGO_KEY)
- FormDialog 패턴: 재사용 가능한 생성/수정 다이얼로그 컴포넌트
  - Group/Team/Member FormDialog (계층적 필드 연동, 상위 미선택 시 하위 disable)
  - Member Autocomplete (이미지/정보 포함)
  - Leader 지정, 순서 변경, Department Tag 관리
- API 모듈 분리: groups, teams, members 각각 독립 모듈, axios config 패턴 적용
- News/Recruit Tag 관리: 소문자 Tag 전송, EditTagDialog 컴포넌트
- 16건 버그 수정, 컴포넌트 책임 분리 리팩토링

**성과**: 1주 53 커밋으로 3계층 CRUD 기능 전체 구현 (9개 신규 컴포넌트, 3개 API 모듈)

#### 6-8. Backend - Patch Tag API (2023.12, 5 커밋)

- Recruit Tag/Affiliation 일괄 수정 API 설계 및 구현 [LANDING-134]
- PATCH `/patch-tag` 엔드포인트: MongoDB `updateMany` 활용 효율적 일괄 업데이트
- 방어적 요청 검증: 필드 쌍(old/new) 동시 존재 여부 검증, 에러 메시지 구체화
- 레거시 필드 정리 (`isGreetingLinkExist` 제거)
- PR #3 코드 리뷰 3명 승인 후 병합

**성과**: 프론트엔드(Backoffice)와 **동시 풀스택 개발**

---

## 프로젝트 7. Imago Cloud Design System 기여

| 항목 | 내용 |
|------|------|
| **기간** | 2025.04 ~ 2025.08 (4개월) |
| **역할** | 디자인 시스템 기여 |
| **기술** | React 18/19, TypeScript, MUI 5, Storybook 7, dayjs |
| **규모** | 9 커밋, 패키지명: @imago-cloud/design-system |

### 담당 업무

#### 7-1. React 19 마이그레이션 (2025.04.23)

- 19개 파일 수정, package-lock.json 10,311줄 변경
- Storybook 7 호환성 확보: main.js, preview.js 수정
- ESLint 설정 React 19 규칙 대응
- 10개 이상 Stories 파일 업데이트, 의존성 버전 충돌 해결

#### 7-2. DatePicker 컴포넌트 API 확장 (2025.08.26 ~ 08.28)

- placeholder props 추가: 사용자 정의 텍스트 지원 (v3.0.0-13 릴리즈)
- onClick handler props 추가: 외부 클릭 이벤트 제어 가능 (v3.0.0-15 릴리즈)
- Optional props 설계로 기존 코드 **하위 호환성 100% 유지**

#### 7-3. 프로덕션 버그 긴급 대응 (2025.08.06)

- DatePicker onClose props가 내부 로직에 의해 덮어 씌워지는 버그
- onClose 호출 순서 조정, 외부 props 콜백 호출 보장
- PR 리뷰 → 머지 → v2.0.2 **당일 긴급 배포** 완료

### 성과

- React 19 대응 v3 브랜치 기반 마련
- DatePicker 유연성 향상으로 다수 제품 활용
- 프로덕션 버그 당일 대응으로 사용 팀 영향 최소화

---

## 기술 스택 종합

### Frontend
| 분류 | 기술 |
|------|------|
| Core | React 18/19, TypeScript, Next.js |
| State Management | TanStack Query, Recoil, Zustand, Redux Toolkit |
| UI Library | MUI (v5/v7), styled-components, Emotion |
| Form | react-hook-form |
| i18n | i18next, react-i18next, Lokalise |
| 3D | VTK.js (3D Viewer, Manipulator 커스터마이징) |
| Animation | AOS (Animate On Scroll) |

### Desktop
| 분류 | 기술 |
|------|------|
| Framework | Electron |
| Build | electron-builder, Webpack, CRACO |
| Protocol | Custom Protocol Handler (`dentbird://`, `dentbird-linker://`) |

### Testing
| 분류 | 기술 |
|------|------|
| E2E | Playwright (80+ TC, Page Object Pattern) |
| Unit | Jest, Vitest |
| Mock | MSW (Mock Service Worker) |
| Management | Qase |

### Architecture
| 분류 | 기술 |
|------|------|
| Monorepo | NX, pnpm |
| Micro Frontend | Module Federation (@module-federation/enhanced) |
| Pattern | FSD (Feature-Sliced Design), Facade Pattern |

### DevOps
| 분류 | 기술 |
|------|------|
| CI/CD | Azure DevOps, Azure Pipelines |
| Infrastructure | Azure (Static Web Apps, VM), Nginx |
| Monitoring | Datadog (RUM, Logs), Electron Crash Reporter |
| Automation | K8s CronJob, Claude CLI, Power Automate |
| Code Signing | Windows EV Code Signing, Mac Code Signing |

### Backend (부분 참여)
| 분류 | 기술 |
|------|------|
| Server | Node.js, Fastify 3, Kotlin/Spring Boot |
| Database | MongoDB (Mongoose 6) |
| Gateway | Spring Cloud Gateway |

---

## 정량적 성과 종합

| 카테고리 | 지표 | 수치 |
|----------|------|------|
| **코드 기여** | 총 커밋 | 1,500+ |
| | 총 PR | 300+ |
| | 총 코드 변경 | 500K+ LOC |
| **빌드 최적화** | Electron 인스톨러 감소 | 854MB → 78MB (91%) |
| **코드 품질** | TypeScript 에러 해결 | 688개 → 0개 (100%) |
| | 토큰 관리 코드 감소 | 200줄 → 33줄 (85%) |
| | CookieUtil 간소화 | 67% |
| **테스트** | E2E 테스트 케이스 | 80+ TC |
| | E2E 코드 중복 감소 | 93% |
| | 테스트 성능 개선 | 39% |
| | 단위 테스트 (토큰 관리) | 22개 |
| | 단위 테스트 (Custom Protocol) | 18개 |
| **인프라** | 도메인 통합 설계 | 33개 → 10개 (70%) |
| | SSL 인증서 통합 설계 | 33개 → 1개 (97%) |
| | 환경변수 감소 설계 | 67개 → 5개 (92%) |
| | 배포 시간 단축 설계 | 45분 → 10분 (78%) |
| **제품** | CAM SW 연동 | 16개+ |
| | 외부 스캐너 연동 | 3개 (Medit, Shining 3D, Connect) |
| | Batch Client 릴리즈 | 13개 (v0.0.1 ~ v1.0.13) |
| | Micro Frontend 모듈 | 4개 신규 + 5개 유지보수 |
| | 랜딩 페이지 | 10+ 페이지, 3개 언어 |

---

> 이 경력기술서는 Git 커밋 이력 분석을 기반으로 자동 생성되었습니다.
> 생성일: 2026-02-08
