# 경력기술서

## 인적사항

| 항목 | 내용 |
|------|------|
| **이름** | 김진완 (Jinwan Kim) |
| **포지션** | Frontend Developer / DevOps Engineer |
| **경력** | 2023.09 ~ 현재 (약 2년 6개월) |
| **회사** | ImagoWorks (이마고웍스) |
| **제품** | Dentbird Solutions (치과 CAD/CAM SaaS 플랫폼) |

---

## 전체 기여 요약

| 지표 | 수치 |
|------|------|
| **총 커밋** | 2,240+ |
| **참여 프로젝트** | 10개 |
| **PR 머지** | 400+ |
| **주요 기술** | React, TypeScript, Electron, Playwright, Nx Monorepo |

---

## 핵심 성과 (Top 6)

| 성과 | 정량적 결과 |
|------|------------|
| TypeScript 에러 전수 해결 | 688개 -> 0개 (100%) |
| Electron 인스톨러 최적화 | 854MB -> 78MB (91% 감소) |
| 토큰 관리 리팩토링 | 200줄 -> 33줄 (85% 감소) |
| E2E 테스트 자동화 | 80+ TC, 코드 중복 93% 감소 |
| 다국어 시스템 구축 | 9개 언어, 커버리지 95% |
| 대량 작업 안정성 개선 | API Timeout 100% 해결 |

---

## 프로젝트 상세

---

### 1. Dentbird Solutions - 통합 플랫폼 (NX Monorepo)

```
[기간] 2024.06 ~ 현재 (약 20개월)
[역할] Frontend Developer / QA Automation Engineer (전담 개발)
[기술] React, TypeScript, Electron, Playwright, Nx Monorepo, Jest, Azure DevOps, Datadog
```

**총 커밋**: 307개 | **PR 머지**: 275건 | **코드**: +269,930줄 / -32,911줄

#### 담당 업무

**1) Linker Desktop - CAM 소프트웨어 연동 시스템 개발 (2025.11 ~ 2026.02)**
- Electron 기반 데스크톱 앱으로 16개+ CAM 소프트웨어 실시간 연동
- Protocol/HTTP 방식 CAM Export 좌표계 변환 구현
  - MILLBOX, D+CAM, Alpha AI, hyperDENT, PreForm 등
  - STL/PLY 파일 3D 좌표계 변환 알고리즘
- Export Session 방식 Protocol Handler 아키텍처 설계
- Windows EV 코드 서명 CI/CD 파이프라인 구축
- Datadog RUM/Logs 모니터링 통합 (Main/Renderer 프로세스)
- Jest 테스트 커버리지 확보 (30+ 테스트 케이스)

**2) Backoffice E2E 테스트 자동화 시스템 구축 (2025.08 ~ 2025.10)**
- Playwright 기반 E2E 테스트 프레임워크 아키텍처 설계
- Page Object 패턴 적용으로 테스트 코드 재사용성 향상
- Kubernetes CronJob 기반 일일 자동 테스트 환경 구축
- Teams 웹훅 연동으로 테스트 결과 실시간 알림
- 80+ E2E 테스트 케이스 작성
  - 로그인/인증, 사용자 CRUD, 구독 관리, 멀티 브라우저 세션 감지

**3) Cloud/Module 클라이언트 모노레포 마이그레이션 (2024.06 ~ 2025.01)**
- 분산된 5개+ 프론트엔드 프로젝트를 NX 모노레포로 통합
  - Cloud Desktop/Mobile, Viewer/Export/Explorer 모듈, Dealer Backoffice
- Azure DevOps Pipeline CI/CD 구성 (dev/qa/prod 환경)
- 공통 라이브러리 추출 및 모듈화 (cloud-hooks, cloud-states, cloud-i18n)
- Datadog RUM 모니터링 전사 적용

**4) Export 기능 개선 및 API 마이그레이션 (2025.12 ~ 2026.02)**
- Modeler Export v5 API 마이그레이션 (solutionPayload 기반)
- crown-io 모듈 리팩토링: 순수 함수 추출, 기능별 파일 분리, 타입 안전성 강화
- Bridge Export CI 파일 통합 생성 및 Progress 개선

#### 성과
- 16개+ CAM 소프트웨어 연동으로 사용자 워크플로우 통합
- 80+ E2E 테스트 케이스로 회귀 테스트 자동화
- 로그인 중복 코드 93% 감소 (auth 헬퍼 함수 추출)
- 테스트 실행 성능 39% 개선
- Windows/macOS 크로스 플랫폼 빌드 자동화

---

### 2. Cloud Workspace - 치과 클라우드 플랫폼

```
[기간] 2023.11 ~ 2025.04 (약 18개월)
[역할] Frontend Developer (전담 개발)
[기술] React 18, TypeScript, React Query v4, Recoil, Nx Monorepo, i18next, Chart.js, VTK.js
```

**총 커밋**: 653개 | **PR 머지**: 68건 | **코드**: +63,183줄 / -75,342줄

#### 담당 업무

**1) Release Note 시스템 설계 및 구현 (2025.04)**
- React Markdown 기반 릴리즈 노트 UI, 도메인 계층 분리 (Clean Architecture)
- Local Storage 기반 읽음 상태 관리, Error Boundary 장애 격리

**2) Storage 관리 시스템 개선 (2024.09 ~ 2025.03)**
- File SDK 마이그레이션 (직접 API 호출 -> @imago-cloud/storage-client SDK)
- Chunk 기반 대량 삭제/복원 처리 (API 부하 분산)
- Workspace 기준 스토리지 사용량 표시 로직 개선

**3) 케이스 관리 기능 고도화 (2024.07 ~ 2024.09, DC-74, 29건 커밋)**
- Chunk 분할 처리로 대량 작업 API Timeout 해결
- Platform 필드 기반 동시성 제어 (다른 유저 작업 충돌 방지)
- React Query Optimistic Update 패턴 적용

**4) 다국어(i18n) 시스템 구축 (2024.09 ~ 2024.10, DC-160, 22건 커밋)**
- i18next 기반 9개 언어 지원 체계 구축
  - 한/영/일/중/독/프/이/스/포르투갈어
- 누락 키 일괄 추가, Google Translate 자동 감지 대응

**5) 인증(Auth) 시스템 안정화 (2024.10 ~ 2025.04, DC-173)**
- Auth Client SDK v0.2.0 -> v0.2.8 점진적 업그레이드
- 다중 로그인 감지 및 세션 충돌 처리
- Module 종료 시 401 에러 검증 (useModuleCloseHandler)

**6) Dashboard 통계 시스템 개발 (2024.09, DC-186)**
- Chart.js 기반 케이스 통계 시각화 (Bar, Line, Pie)
- Date Format 국제화 연동, Refetch on Window Focus

#### 성과
- 대량 케이스 처리 안정성 100% 개선 (API Timeout -> 0건)
- 스토리지 API 호출 효율 30% 향상 (SDK 마이그레이션)
- 9개 언어 다국어 커버리지 95% 달성
- 인증 오류 90% 감소 (Auth SDK 업그레이드)
- Desktop/Mobile 코드 재사용률 80% (Nx Monorepo)

---

### 3. DentBird Account Client - B2B SaaS 계정/구독 관리

```
[기간] 2023.09 ~ 2025.07 (약 1년 10개월)
[역할] Frontend Developer (전담 개발)
[기술] React 18, TypeScript, TanStack Query, MUI, i18next, MSW, Jest
```

**총 커밋**: 160+개

#### 담당 업무

**1) SaaS 구독 관리 시스템 구축 (2024.01 ~ 2024.06)**
- 플랜 관리 (Free/Paid), 추가 시트 구매 (일할 계산, Pro-rata calculation)
- PostMessage 기반 Payment 페이지 연동, Ping-back 구현
- 구독 취소/재개(Resume), 환불 요청, 쿠폰 시스템 구현

**2) 팀 멤버 관리 시스템 개발 (2023.12 ~ 2024.03)**
- Seats -> Members 시스템 전환 리팩토링
- 멤버 초대/권한 관리 (다지역 유저, Dealership 처리)

**3) OAuth 회원가입 플로우 개선 (2023.09 ~ 2023.11)**
- Storage Location 선택 (글로벌 리전 선택 UI)
- MFA Verification 모달 구현

**4) 반응형 UI 시스템 구축 (2023.11 ~ 2024.01)**
- 모바일/태블릿/데스크톱 3단계 반응형 디자인
- Mobile Header, SNB(Side Navigation Bar), Page Wrapper 구현

**5) 테스트 환경 구축 (2024.01 ~ 2024.04)**
- Jest + MSW(Mock Service Worker) 기반 테스트 인프라 구축
- 주요 페이지(MyPlan, Subscription, Members) 테스트 코드 작성

#### 성과
- SaaS 구독 플로우 전체 구현으로 수익화 기반 마련
- Seats -> Members 시스템 전환 완료 (기존 로직 유지하며 점진적 전환)
- 글로벌 서비스 대응을 위한 i18n 및 Region 선택 기능 구현

---

### 4. DentBird Batch Client - Electron 배치 처리 앱

```
[기간] 2023.12 ~ 2025.01 (약 13개월)
[역할] Frontend Developer (전담 개발)
[기술] Electron, React, TypeScript, Recoil, VTK.js, Axios, i18next, Webpack
```

**총 커밋**: 347개 | **릴리즈**: v0.0.1 -> v1.0.13 (13개 버전)

#### 담당 업무

**1) Electron 기반 데스크톱 앱 신규 개발 (2023.12 ~ 2024.04)**
- 프로젝트 초기 세팅부터 릴리즈까지 전체 개발 주도
- Main/Renderer 프로세스 IPC 통신 구조 설계
- Deep Link (dentbird://) 커스텀 프로토콜 연동
- 자동 업데이트 시스템 (electron-builder)

**2) API Gateway 마이그레이션 (2024.08, DB-594)**
- Axios 인터셉터 기반 토큰 자동 갱신 시스템
- Access Token Decode로 불필요한 API 호출 제거
- 환경별(dev/qa/prod) 엔드포인트 분리

**3) 3D Viewer UX 개선 (2024.06, DB-580/583/587)**
- VTK.js Manipulator 커스터마이징 (Windows/Mac 마우스 조작 통일)
- Model Tree 슬라이더 UX, Group Toggle 기능 개선
- 영어/일본어 다국어 지원

**4) 에러 핸들링 시스템 고도화 (2024.05 ~ 2024.06)**
- Axios 인터셉터 글로벌 에러 처리 아키텍처 구축
- 세션 만료/네트워크 에러 자동 처리, Retry 메커니즘 구현

**5) 빌드/배포 파이프라인 구축 (2024.03 ~ 2025.01)**
- Webpack Main 프로세스 번들링
- Windows/Mac Code Signing
- 환경별(dev/qa/prod) 배포 시스템

**6) 모니터링 시스템 구축 (2024.05, 2024.10)**
- Electron Crash Reporter 자동 리포트
- Datadog RUM 실시간 사용자 모니터링 연동

#### 성과
- 0 -> 1 신규 개발, v1.0.13까지 13개 버전 릴리즈
- Windows/Mac 크로스 플랫폼 지원
- VTK.js 기반 3D Viewer 마우스 인터랙션 크로스 플랫폼 통일

---

### 5. DentBird Module Client - 마이크로 프론트엔드 모듈

```
[기간] 2024.11 ~ 2025.07 (약 8개월)
[역할] Frontend Developer
[기술] React, TypeScript, VTK.js, pnpm Monorepo, Module Federation
```

**총 커밋**: 109개 | **PR 머지**: 7건

#### 담당 업무

**1) 외부 스캐너 연동 시스템 (2025.03 ~ 2025.05)**
- Medit, Shining 3D, Connect 3개 외부 치과 스캐너 API 통합
- OAuth 인증 플로우 구현, 크로스 도메인 대응

**2) 서브 도메인 마이그레이션 (2025.03)**
- 5개 모듈(explorer, export, viewer, setting, mobile) 동시 도메인 변경
- 무중단 도메인 전환 완료

**3) SDK 및 패키지 버전 관리 (2025.04 ~ 2025.06)**
- File API SDK 버전 업그레이드, pnpm 9 마이그레이션
- axios v1.7.8 전체 모듈 표준화

**4) 주요 버그 수정 (22건)**
- 작업 중인 사용자 delete 버튼 비활성화 (DEN-4087)
- Export to CAM 비활성화 조건 수정
- opener 솔루션별 리스트 표시 문제 해결 (CRWN-2562)

#### 성과
- 5개 마이크로 프론트엔드 모듈 유지보수 및 기능 개발
- 외부 스캐너 3개 서비스 연동으로 사용자 워크플로우 통합
- 서브 도메인 마이그레이션 5개 모듈 무중단 전환 성공

---

### 6. DentBird Front Module Monorepo - Micro Frontend 시스템 구축

```
[기간] 2025.06 ~ 2025.07 (3주)
[역할] Frontend Developer (전담 개발)
[기술] React 18, TypeScript, Nx Monorepo, Module Federation, React Query, MSW, MUI, FSD Architecture
```

**총 커밋**: 87개 | **코드**: +58,473줄

#### 담당 업무

**1) Micro Frontend 아키텍처 설계 및 구축 (2025.06)**
- Nx 모노레포 + Module Federation 기반 독립 배포 가능한 원격 모듈 시스템
- FSD(Feature-Sliced Design) 아키텍처 도입 및 ESLint 커스텀 규칙 구성
- 공유 의존성 최적화 (singleton, requiredVersion)

**2) 시스템 알림 FO/BO 개발 (2025.06 ~ 2025.07)**
- FO(Front Office): 알림 목록, 개별/전체 읽음 처리, 미읽음 카운트
- BO(Back Office): 알림 CRUD 관리, 상태별/날짜별 필터링, Markdown 에디터
- React Query 기반 서버 상태 관리, MSW Mock API 환경 구축

**3) Feature Toggle / Tenant Change 원격 모듈 개발**
- 호스트-리모트 간 타입 공유 자동화 스크립트 구현
- 빌드 시 .d.ts 파일 자동 생성, ZIP 압축 배포

#### 성과
- 3주 내 4개 독립 모듈 개발 완료 (87 커밋, 58K+ LOC)
- Module Federation 통한 독립 배포 체계 구축
- FSD 아키텍처 도입으로 확장 가능한 코드 구조 확립

---

### 7. Imago Cloud Design System - 공용 디자인 시스템

```
[기간] 2025.04 ~ 2025.08 (약 4개월)
[역할] Frontend Developer (디자인 시스템 기여)
[기술] React 18/19, TypeScript, MUI 5, Storybook 7, dayjs
```

**총 커밋**: 9개

#### 담당 업무

**1) React 19 마이그레이션 (2025.04)**
- 19개 파일 변경, 10,000+ 라인 수정
- Storybook 7 호환성 확보, ESLint 설정 최적화
- 패키지 의존성 업데이트 및 버전 충돌 해결

**2) DatePicker 컴포넌트 API 확장 (2025.08)**
- placeholder, onClick handler 커스터마이징 props 추가
- 하위 호환성 유지하며 기능 확장

**3) 프로덕션 버그 긴급 대응 (2025.08)**
- onClose props 오버라이드 버그 당일 수정 및 v2.0.2 릴리즈

#### 성과
- React 19 대응을 위한 v3 브랜치 기반 마련
- DatePicker 유연성 향상으로 다수 제품에서 활용
- 프로덕션 버그 당일 대응으로 사용 팀 영향 최소화

---

### 8. Landing Page - 기업 랜딩 페이지

```
[기간] 2023.09 ~ 2025.10 (약 2년)
[역할] Frontend / Backend Developer
[기술] Next.js, React, TypeScript, i18next, AOS, Node.js, Fastify, MongoDB
```

**총 커밋**: 568개 (Client 510 + Backoffice 53 + Server 5)

#### 담당 업무

**1) 랜딩 페이지 v3 전면 리뉴얼 주도 (2023.09 ~ 2023.11)**
- Next.js 기반 기업 랜딩 페이지 전면 재구축 (10+ 페이지)
- AOS(Animate On Scroll) 애니메이션 시스템 통합
- 데스크톱/태블릿/모바일 3단계 반응형 디자인
- i18next 기반 타입 안전한 다국어 시스템 설계 (한/영/일)

**2) Backoffice 조직 관리 시스템 구축 (2023.12, 1주)**
- Groups -> Teams -> Members 3계층 조직 구조 설계 및 구현
- 각 계층별 CRUD Dialog 컴포넌트 개발 (9개 컴포넌트)
- React Query 캐시 전략 및 쿼리 키 관리 체계 구축

**3) Backend API 개발 (2023.12, Fastify + MongoDB)**
- Recruit Tag/Affiliation 일괄 수정 API (PATCH /patch-tag)
- MongoDB updateMany 활용 효율적 일괄 업데이트
- 프론트엔드(Backoffice)와 동시 개발로 풀스택 기여

**4) 성능 최적화 및 프로모션 (2024.04 ~ 2024.07)**
- Lighthouse 성능 점수 개선 (LCP 이미지 프리로드, 캐싱 전략)
- HOC 패턴 기반 재사용 가능한 프로모션 배너 시스템

#### 성과
- 기업 랜딩 페이지 v3 전면 리뉴얼 (510+ 커밋)
- 타입 안전한 3개국어 i18n 시스템으로 일본 시장 진출 기반 마련
- 1주 내 조직 관리 시스템 풀스택 개발 완료 (Client + Server)

---

## 크로스 프로젝트 기술 성과

### 1. E2E 테스트 자동화 시스템 구축 (2025.12, 3일)

- **문제**: E2E 테스트 실행이 수동, 코드 변경 후 어떤 테스트를 실행할지 불명확
- **해결**:
  - Claude Code CLI 활용 AI 기반 코드 분석 -> 관련 테스트 자동 추론
  - EC2 크론잡 10분마다 커밋 변경사항 감지 -> 관련 테스트 선별 실행
  - Teams Power Automate Webhook 테스트 결과 실시간 공유
  - Lockfile 기반 동시 실행 방지, State tracking 중복 분석 방지

### 2. 토큰 관리 아키텍처 리팩토링 (2025.10, 3일)

- **문제**: Axios 인터셉터 내 Promise 경쟁 조건(Race Condition), SSE Stale Closure
- **해결**:
  - Facade 패턴으로 AuthService를 HTTP 비의존적 토큰 상태 관리자로 분리
  - Single Source of Truth: 토큰 저장소 일원화, getter 메서드로 최신 토큰 보장
- **성과**: 코드 200줄 -> 33줄 (85% 감소), 22개 단위 테스트 통과

### 3. 통합 도메인 전환 프로젝트 설계 (2025.11, 진행 중)

- **문제**: 도메인 33개, SSL 인증서 33개, 환경변수 67개, 배포 45분
- **해결**:
  - Graceful Dual-Mode 전략 (기존 도메인 유지 + 신규 통합 도메인 점진적 추가)
  - urlHelper 라이브러리 (런타임 환경 자동 감지, TDD 22개 테스트)
  - CookieUtil 67% 간소화
- **예상 성과**: 도메인 70%, SSL 97%, 환경변수 92% 감소

### 4. 레거시 프로젝트 모노레포 마이그레이션 (2025.09, 2주)

- **문제**: 분산된 레거시 프로젝트, TypeScript 에러 688개, Git 히스토리 보존 필요
- **해결**:
  - 8단계 마이그레이션 계획 수립 및 실행
  - git subtree 활용 히스토리 100% 보존
  - MUI v7 런타임 이슈 해결, 순환 의존성 해결
- **성과**: TypeScript 에러 688개 -> 0개 (100% 해결)

### 5. Chrome LNA 규제 대응 Custom Protocol 전환 (2025.12, 5일)

- **문제**: Chrome 142부터 localhost HTTP 통신 차단, 3개 CAM SW 영향
- **해결**:
  - `dentbird-linker://` 딥링크 방식 Custom Protocol 아키텍처
  - Git Subtree로 Electron 앱 모노레포 마이그레이션
  - TDD 기반 구현 (INI/XML 생성, HTTP 통신 단위 테스트 18개)
- **성과**: 인스톨러 854MB -> 78MB (91% 감소)

### 6. Lokalise 스크립트 중앙화 (2025.10, 1일)

- **문제**: i18n 스크립트가 여러 위치에 중복
- **해결**: 6개 분산 스크립트 -> 중앙화된 단일 스크립트 통합
- **성과**: 4개 커밋으로 중앙 집중식 i18n 관리 체계 구축

---

## 기술 스택 총정리

### Frontend
| 영역 | 기술 |
|------|------|
| **Core** | React 18/19, TypeScript, Next.js |
| **상태 관리** | TanStack Query (React Query v4), Recoil, Zustand, Redux Toolkit |
| **UI** | MUI v5/v7, styled-components, Emotion |
| **폼** | React Hook Form |
| **국제화** | i18next, react-i18next, Lokalise |
| **데이터 시각화** | Chart.js, React-Chartjs-2, Recharts |
| **3D** | VTK.js (치과 CAD/CAM 3D 렌더링) |
| **테스트** | Playwright, Jest, Vitest, MSW |
| **빌드** | Nx, Webpack, CRACO |
| **아키텍처** | Module Federation, FSD (Feature-Sliced Design) |

### Desktop
| 영역 | 기술 |
|------|------|
| **Framework** | Electron |
| **빌드** | electron-builder, Webpack |
| **프로토콜** | Custom Protocol (dentbird://), Deep Link |
| **코드 서명** | Windows EV Code Signing, Mac Code Signing |

### Backend
| 영역 | 기술 |
|------|------|
| **Framework** | Node.js, Fastify 3, Kotlin/Spring Boot |
| **Database** | MongoDB (Mongoose 6) |
| **Gateway** | Spring Cloud Gateway |

### DevOps / Infra
| 영역 | 기술 |
|------|------|
| **CI/CD** | Azure DevOps Pipelines, Bitbucket Pipelines |
| **Infra** | Azure (Static Web Apps, VM), Kubernetes |
| **모니터링** | Datadog RUM/Logs, Electron Crash Reporter |
| **자동화** | Claude CLI, Power Automate, EC2 Cron |
| **패키지** | pnpm 9, npm |

### Methodology
| 영역 | 내용 |
|------|------|
| **개발** | TDD (Red-Green-Refactor), Pair Programming |
| **설계** | Kent Beck's Simple Design, YAGNI, Clean Architecture |
| **테스트** | Page Object Pattern, E2E 자동화 |
| **문서화** | Confluence, Markdown, 37개+ 기술 문서 |

---

## 핵심 역량

### 1. 대규모 코드베이스 관리
- NX 모노레포 (25개 앱, 30+ 라이브러리) 환경에서 마이그레이션 및 개발
- TypeScript 에러 688개 체계적 해결, 분산 프로젝트 통합 경험

### 2. 아키텍처 설계 및 개선
- Module Federation 기반 Micro Frontend 시스템 구축
- 토큰 관리 아키텍처 재설계 (85% 코드 감소)
- 통합 도메인 전환 설계 (관리 포인트 77% 감소 목표)

### 3. Electron 데스크톱 앱 개발
- 0 -> 1 신규 개발 (Batch Client v1.0.13)
- CAM 소프트웨어 16개+ 연동 시스템 (Linker Desktop)
- Custom Protocol, 코드 서명, 자동 업데이트

### 4. 테스트 자동화 및 QA
- Playwright E2E 80+ TC, AI 기반 변경 감지 자동 테스트
- Jest/Vitest 단위 테스트, MSW Mock API
- K8s CronJob 일일 자동 테스트 환경

### 5. 글로벌 서비스 대응
- 9개 언어 다국어 시스템 구축 (커버리지 95%)
- 글로벌 Storage Region, OAuth, MFA 인증 플로우
- 일본어/중국어 등 CJK 폰트/레이아웃 최적화

### 6. DevOps 및 자동화
- Azure DevOps Pipeline CI/CD 구성 (dev/qa/prod)
- Windows EV 코드 서명 파이프라인
- Datadog RUM/Logs 모니터링 전사 적용
- Lokalise i18n 스크립트 중앙화

---

**마지막 업데이트**: 2026-02-08
**작성 기준**: Git commit history (jwkim@imagoworks.ai) 기반 전체 프로젝트 분석
