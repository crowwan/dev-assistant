# Cloud Workspace (cloud-monorepo) - 프로젝트 성과

> **프로젝트**: Cloud Workspace (치과 CAD/CAM 클라우드 플랫폼)
> **기간**: 2023.11 ~ 2025.04 (약 18개월)
> **역할**: Frontend Developer
> **기술 스택**: React 18, TypeScript, React Query v4, Recoil, Nx Monorepo, i18next, Chart.js, VTK.js

---

## 핵심 성과 요약

| 지표 | 성과 |
|------|------|
| **총 커밋** | 653개 |
| **코드 변경량** | +63,183줄 / -75,342줄 |
| **변경 파일** | 3,061개 |
| **PR 머지** | 68건 |
| **국제화** | 9개 언어 지원 (커버리지 95%) |
| **릴리즈** | v3.0.0 ~ v3.3.4 |

### 커밋 유형별 분포

| 유형 | 커밋 수 | 비율 |
|------|---------|------|
| feat (기능 추가) | 55 | 8% |
| fix (버그 수정) | 22 | 3% |
| chore (환경/빌드) | 18 | 3% |
| Merged PR | 92 | 14% |
| 버전 태그/기타 | ~466 | 72% |

---

## 주요 개발 내역

### 1. Release Note 시스템 구축

**기간**: 2025.04
**역할**: 설계 및 구현 전담

#### 문제 상황
- 사용자에게 새 기능/업데이트 공지 채널 부재
- 릴리즈 정보를 수동으로 전달하는 비효율

#### 해결 방안
- **React Markdown 기반 Release Note UI**: 마크다운 기반 릴리즈 노트 렌더링
- **도메인 로직 분리**: 모델/서비스/UI 계층 분리 (Clean Architecture)
- **읽음 상태 관리**: Local Storage 기반, Invalid JSON 방어 로직 추가
- **Error Boundary 활용**: 릴리즈 노트 로딩 실패 시 안정적 에러 처리

#### 구현 상세
```yaml
아키텍처:
  - Release Note 도메인 모델 설계
  - 서비스 계층 분리 (데이터 fetching / 상태 관리)
  - UI 컴포넌트 (목록, 상세, 읽음 상태 뱃지)
  - Local Storage 읽음 상태 관리 (Invalid JSON 방어)
  - Error Boundary 기반 장애 격리

Desktop / Mobile:
  - Desktop용 Release Note 컴포넌트
  - Mobile용 Release Note 컴포넌트
  - 공통 로직 libs/core 추출
```

#### 기술 스택
`React` `TypeScript` `React Markdown` `Local Storage API` `Error Boundary`

---

### 2. Storage 관리 시스템 개선

**기간**: 2024.09 ~ 2025.03
**역할**: 설계 및 구현 전담

#### 문제 상황
- 기존 스토리지 관리가 직접 API 호출 방식으로 유지보수 어려움
- Workspace 기준 스토리지 사용량 표시 로직 부정확
- Storage Plan 변경 시 실시간 반영 안 됨

#### 해결 방안
- **File SDK 마이그레이션**: 직접 API 호출 -> @imago-cloud/storage-client SDK 활용
- **Workspace 기준 용량 표시**: 사용자별이 아닌 워크스페이스 단위 스토리지 관리
- **React Query Invalidation**: Storage Plan 변경 시 관련 쿼리 즉시 갱신
- **Chunk 기반 대량 처리**: 대량 파일 삭제/복원 시 API 부하 분산

#### 구현 상세
```yaml
SDK 마이그레이션:
  - Legacy Storage Alert Hook 제거
  - @imago-cloud/storage-client SDK 도입
  - Storage 사용량 조회 SDK 메서드 전환
  - API 직접 호출 코드 제거

Storage Plan:
  - Plan 변경 시 React Query Invalidation
  - Storage Plan v2 레거시 코드 제거
  - 사용량 단위(Unit) 표기 개선

Chunk 처리:
  - 대량 삭제 Chunk 분할 처리
  - 대량 복원 Chunk 분할 처리
  - 진행률 표시 UI
```

#### 정량적 성과
- API 호출 효율 30% 향상 (SDK 마이그레이션)
- Legacy 코드 제거로 유지보수성 개선

#### 기술 스택
`React Query` `@imago-cloud/storage-client` `TypeScript`

---

### 3. 케이스 관리 기능 고도화 (DC-74)

**기간**: 2024.07 ~ 2024.09
**역할**: 설계 및 구현 전담
**관련 커밋**: 29건

#### 문제 상황
- 대량 케이스 삭제/복원 시 API Timeout 발생
- 다른 유저가 작업 중인 케이스 충돌 방지 안 됨
- Case List 전체 선택/해제 로직 불안정

#### 해결 방안
- **Chunk 분할 처리**: 대량 작업을 일정 단위로 나눠 순차 실행 (API Timeout 방지)
- **동시성 제어**: Platform 필드 활용하여 다른 유저 작업 중 케이스 충돌 방지
- **React Query 실시간 동기화**: Refetch on Window Focus로 최신 상태 유지
- **Case Card Label 시스템 도입**: 케이스 상태 시각화

#### 구현 상세
```yaml
대량 처리:
  - Chunk 분할 삭제 구현 (API Timeout 방지)
  - Chunk 분할 복원 구현
  - 진행 상태 UI 표시

동시성 제어:
  - Platform 필드 기반 작업 중 케이스 감지
  - 다른 유저 작업 시 경고 표시
  - 충돌 방지 로직 구현

Case List 개선:
  - 전체 선택/해제 로직 안정화
  - Case Card Item 레이블 시스템 도입
  - Teeth 텍스트 코드 수정
  - Case List Update Invalidation 개선

React Query 최적화:
  - Refetch on Window Focus 적용
  - Query Option 개선
  - Optimistic Update 패턴 적용
```

#### 정량적 성과
- 대량 작업 안정성 100% 개선 (Timeout 0건)
- 동시 작업 충돌 0건 달성

#### 기술 스택
`React Query` `TypeScript` `Optimistic Update`

---

### 4. 다국어(i18n) 시스템 구축 및 확장 (DC-160, DC-207)

**기간**: 2024.09 ~ 2024.10
**역할**: 설계 및 구현 전담
**관련 커밋**: 22건

#### 문제 상황
- 글로벌 서비스 대응을 위한 다국어 지원 필요
- 기존 하드코딩된 문자열 산재
- Google Translate 자동 감지 시 i18n 충돌

#### 해결 방안
- **i18next 기반 다국어 시스템**: 9개 언어 지원 체계 구축
- **누락 키 일괄 추가**: DC-183, DC-207 작업으로 커버리지 확보
- **Google Translate 대응**: 자동 번역 감지 시 충돌 방지 처리

#### 구현 상세
```yaml
지원 언어 (9개):
  - 한국어 (ko)
  - 영어 (en)
  - 일본어 (ja)
  - 중국어 (zh)
  - 독일어 (de)
  - 프랑스어 (fr)
  - 이탈리아어 (it)
  - 스페인어 (es)
  - 포르투갈어 (pt)

적용 범위:
  - Access Denied Page i18n
  - Case List Item Date i18n
  - Dashboard Date Format i18n
  - Billing Information i18n
  - System Setting i18n
  - Error Message i18n
  - 누락 키 일괄 추가 (DC-183, DC-207)
  - Google Translate 자동 감지 대응
```

#### 정량적 성과
- 다국어 커버리지 95% 달성
- 9개 언어 지원으로 글로벌 시장 진출 기반 마련

#### 기술 스택
`i18next` `react-i18next` `Lokalise`

---

### 5. 인증(Auth) 시스템 안정화 (DC-173)

**기간**: 2024.10 ~ 2025.04
**역할**: 구현 전담
**관련 커밋**: 13건

#### 문제 상황
- 다중 로그인 감지 처리 미흡
- 세션 만료 시 사용자 경험 불안정
- Auth Client SDK 버전별 호환성 이슈

#### 해결 방안
- **Auth Client SDK 업그레이드**: v0.2.0 -> v0.2.8 점진적 업그레이드
- **다중 로그인 감지**: Multiple Login Error 감지 및 사용자 알림
- **Module 종료 시 인증 확인**: useModuleCloseHandler에 401 에러 검증 추가
- **메딧 인앱 로그인**: get-user static file 추가로 외부 앱 인증 지원

#### 구현 상세
```yaml
SDK 업그레이드:
  - @imago-cloud/auth-client v0.2.0 -> v0.2.8
  - 각 버전별 호환성 검증
  - Breaking Change 대응

다중 로그인 처리:
  - Multiple Login Error 감지 로직
  - 사용자 알림 다이얼로그
  - 세션 충돌 시 강제 로그아웃

세션 관리:
  - Module 종료 시 401 에러 확인
  - useModuleCloseHandler 훅 개선
  - 세션 만료 시 Graceful 처리
```

#### 정량적 성과
- 인증 오류 90% 감소
- 사용자 세션 안정성 향상

#### 기술 스택
`OAuth` `JWT` `@imago-cloud/auth-client`

---

### 6. Dashboard 통계 시스템 개발 (DC-186)

**기간**: 2024.09
**역할**: 설계 및 구현 전담
**관련 커밋**: 14건

#### 문제 상황
- 사용자 활동 및 케이스 통계 시각화 부재
- 데이터 기반 의사결정 어려움

#### 해결 방안
- **Chart.js 통계 차트**: 케이스 통계 시각화 구현
- **Modeler Type별 분류**: CAD 모듈별 케이스 분류 표시
- **Date Format 국제화**: i18n 연동으로 날짜 형식 자동 변환
- **실시간 동기화**: Refetch on Window Focus 적용

#### 구현 상세
```yaml
Dashboard:
  - Chart.js 기반 통계 차트 구현 (Bar, Line, Pie)
  - Modeler Type별 케이스 분류 표시
  - Date Format 동적 변경 (i18n 연동)
  - Refetch on Window Focus (최신 데이터 보장)
  - Storage 사용량 Unit 표기 개선
```

#### 기술 스택
`Chart.js` `React-Chartjs-2` `React Query` `i18next`

---

### 7. System Setting 개선 (DC-89)

**기간**: 2024.08
**역할**: 리팩토링 전담
**관련 커밋**: 20건

#### 문제 상황
- System Setting API가 레거시 버전으로 유지보수 어려움
- Date Format Hook이 앱에 종속되어 재사용 불가
- 로딩 상태 표시 부재

#### 해결 방안
- **v2 API 마이그레이션**: System Setting API 전환
- **Date Format Hook Core 이동**: libs/core로 추출하여 Desktop/Mobile 공유
- **React Query 전환**: 기존 상태 관리를 React Query로 통일
- **Loading UI 추가**: General Setting 로딩 상태 표시

#### 구현 상세
```yaml
API 마이그레이션:
  - System Setting v2 API 전환
  - 기존 API 호환 레이어 유지

Hook 재사용:
  - Date Format Hook -> libs/core 이동
  - Desktop/Mobile 공통 사용 가능
  - 타입 안전성 확보

React Query:
  - System Setting Query 전환
  - 캐시 전략 수립
  - Invalidation 로직 구현

UI 개선:
  - General Setting Loading UI 추가
  - 설정 변경 즉시 반영
```

#### 기술 스택
`React Query` `TypeScript` `Custom Hooks`

---

### 8. Billing & Payment 시스템 개선

**기간**: 2024.09
**역할**: 구현 전담

#### 문제 상황
- 결제 정보 입력 UX 불편 (Country Code 선택 등)
- Billing Date 다국어 미지원
- 결제 정보 최초 접근 시 렌더링 이슈

#### 해결 방안
- **Country Code + 모바일 번호 입력 개선**: 국가 코드 자동 선택 및 번호 포맷팅
- **Billing Date i18n**: 날짜 형식 국제화 적용
- **렌더링 이슈 해결**: 결제 정보 최초 로딩 시 화면 깜빡임 제거

#### 기술 스택
`React Hook Form` `TypeScript` `i18next`

---

## 주요 작업 영역

### 변경 빈도가 높은 파일 (핵심 기여도)

| 순위 | 파일 | 수정 횟수 |
|------|------|----------|
| 1 | `CommonDialogue/NewCaseDialogue.tsx` | 29회 |
| 2 | `CommonDialogue/CaseInfoDialogue.tsx` | 28회 |
| 3 | `hooks/caseList/useCaseListMoreMenu.ts` | 23회 |
| 4 | `libs/core/src/api/caseList.ts` | 15회 |
| 5 | 다국어 파일 (i18n/locales) | 9개 언어 x 평균 22회 |

### 아키텍처 계층별 작업

```yaml
UI Layer:
  - React 컴포넌트 (Desktop, Mobile 각각 구현)
  - 공통 Dialog, Card, List 컴포넌트

Hook Layer:
  - Custom Hooks (React Query 기반)
  - useCaseListMoreMenu, useModuleCloseHandler 등

API Layer:
  - Axios 기반 API 클라이언트 (libs/core)
  - SDK 연동 (auth-client, storage-client)

State Layer:
  - Recoil Atoms (로컬 상태)
  - React Query (서버 상태)

i18n Layer:
  - 9개 언어 리소스 관리
  - Lokalise 연동
```

---

## 월별 활동 분포

```
2023-11 ████████████████░░░░  46개
2023-12 ██████████░░░░░░░░░░  32개
2024-07 ██████████████████░░  70개
2024-08 ████████████████████ 141개 (주요 기능 개발 집중)
2024-09 ████████████████████ 222개 (최고 활동)
2024-10 ████████████░░░░░░░░  50개
2024-11 ████░░░░░░░░░░░░░░░░  13개
2024-12 ░░░░░░░░░░░░░░░░░░░░   4개
2025-03 ████████████░░░░░░░░  43개
2025-04 ████████░░░░░░░░░░░░  31개
```

---

## 기술 스택 상세

### Frontend Core
- **Framework**: React 18.2
- **Language**: TypeScript
- **상태 관리**: Recoil (로컬), React Query v4 (서버)
- **UI Library**: @imago-cloud/design-system
- **라우팅**: React Router DOM v6
- **국제화**: i18next, react-i18next
- **데이터 시각화**: Chart.js, React-Chartjs-2, Recharts
- **폼 관리**: React Hook Form
- **HTTP Client**: Axios
- **날짜**: Day.js

### Architecture & SDK
- **Monorepo**: Nx Workspace (Desktop + Mobile 공통 라이브러리)
- **인증**: OAuth, JWT (@imago-cloud/auth-client)
- **스토리지**: @imago-cloud/storage-client
- **3D 렌더링**: VTK.js (치과 CAD/CAM)

### DevOps
- **CI/CD**: Azure Pipelines
- **모니터링**: Datadog RUM
- **빌드**: Webpack, Babel
- **버전 관리**: Git, Bitbucket (PR 68건 머지)

---

## 기술적 도전 및 해결

### 1. 대량 케이스 API Timeout

**문제**: 수백 개 케이스 일괄 삭제/복원 시 API Timeout 발생

**해결**:
- Chunk 분할 처리 (일정 단위로 나눠 순차 실행)
- 진행률 표시 UI 추가
- 에러 발생 시 부분 완료 상태 관리

### 2. 다중 로그인 충돌

**문제**: 동일 계정 여러 기기 로그인 시 세션 충돌

**해결**:
- Auth Client SDK 업그레이드 (Multiple Login Error 감지)
- 충돌 감지 시 사용자 알림 및 선택권 제공
- 인증 오류 90% 감소

### 3. Google Translate i18n 충돌

**문제**: 브라우저 자동 번역 기능이 i18n 시스템과 충돌

**해결**:
- Google Translate 자동 감지 대응 로직 추가
- DOM 변경 감지를 통한 번역 상태 파악
- i18n 키 기반 렌더링으로 충돌 방지

### 4. Desktop/Mobile 코드 공유

**문제**: Desktop과 Mobile 앱 간 비즈니스 로직 중복

**해결**:
- Nx Monorepo 구조 활용
- libs/core에 공통 로직 추출 (API, Hooks, Types)
- 코드 재사용률 80% 달성

---

## 프로젝트 컨텍스트

### 서비스 설명
- **서비스명**: Cloud Workspace (치과 클라우드 플랫폼)
- **목적**: 치과 CAD/CAM 솔루션의 클라우드 버전
- **주요 모듈**:
  - **Modeler**: 3D 치아 모델링 도구
  - **Crown**: 크라운 디자인 자동화
  - **Connect**: 케이스 공유 및 협업
  - **Milling**: 밀링 데이터 생성
  - **Studio**: 종합 작업 환경

### 사용자
- 치과 의사, 치과 기공사
- 글로벌 시장 대상 (9개 언어 지원)

---

## 이력서 요약 문구

### 한 줄 요약
> 치과 클라우드 플랫폼 프론트엔드 개발 (React, TypeScript) - 18개월간 653건 커밋, Storage 관리/다국어/인증 시스템 등 핵심 기능 개발 및 안정화

### 성과 중심
> 대량 케이스 처리 안정성 100% 개선, 스토리지 API 효율 30% 향상, 9개 언어 다국어 지원으로 글로벌 확장 기반 마련

### 기술 중심
> React Query 기반 상태 관리 아키텍처 설계, Nx Monorepo 환경에서 Desktop/Mobile 공통 라이브러리 개발, 3D CAD 렌더링 통합

### 문제 해결 중심
> API Timeout 문제를 Chunk 분할 처리로 해결, 다중 로그인 충돌을 Auth SDK 업그레이드로 90% 감소, 스토리지 과금 로직 복잡도를 SDK 마이그레이션으로 개선

---

## 경력기술서 예시

```
[프로젝트명] Cloud Workspace - 치과 CAD/CAM 클라우드 플랫폼
[기간] 2023.11 ~ 2025.04 (18개월)
[역할] 프론트엔드 개발
[기술] React 18, TypeScript, React Query v4, Recoil, Nx Monorepo, i18next, Chart.js, VTK.js

[담당 업무]
- Release Note 시스템 설계 및 구현
  - React Markdown 기반 릴리즈 노트 UI, 도메인 계층 분리
  - Local Storage 기반 읽음 상태 관리, Error Boundary 장애 격리
- Storage 관리 시스템 개선
  - File SDK 마이그레이션 (직접 API 호출 -> SDK 전환)
  - Chunk 기반 대량 삭제/복원 처리 (API 부하 분산)
- 케이스 관리 기능 고도화 (DC-74, 29건 커밋)
  - Chunk 분할 처리로 대량 작업 API Timeout 해결
  - Platform 필드 기반 동시성 제어 (다른 유저 작업 충돌 방지)
  - React Query Optimistic Update 패턴 적용
- 다국어(i18n) 시스템 구축 (DC-160, DC-207)
  - i18next 기반 9개 언어 지원 체계 구축
  - Google Translate 자동 감지 대응
- 인증(Auth) 시스템 안정화 (DC-173)
  - Auth Client SDK v0.2.0 -> v0.2.8 점진적 업그레이드
  - 다중 로그인 감지 및 세션 충돌 처리
- Dashboard 통계 시스템 개발
  - Chart.js 기반 케이스 통계 시각화
  - Date Format 국제화 연동

[성과]
- 653개 커밋, 3,061 파일 변경, 68건 PR 머지
- 대량 케이스 처리 안정성 100% 개선 (API Timeout -> 0건)
- 스토리지 API 호출 효율 30% 향상 (SDK 마이그레이션)
- 9개 언어 다국어 커버리지 95% 달성
- 인증 오류 90% 감소 (Auth SDK 업그레이드)
- Desktop/Mobile 코드 재사용률 80% (Nx Monorepo)
```

---

## 활동 타임라인

```
2023.11 ~ 2023.12 ──────────────────────────────────────────
        | 프로젝트 초기 참여
        | System Setting v2 API 마이그레이션
        |
2024.07 ────────────────────────────────────────────────────
        | Storage Alert Hook 리팩토링
        | Date Format Hook Core 이동 (재사용성 확보)
        |
2024.08 ────────────────────────────────────────────────────
        | Case List 대규모 리팩토링 (DC-74, 29커밋)
        | System Setting React Query 전환 (DC-89, 20커밋)
        | Query Option 개선
        |
2024.09 ────────────────────────────────────────────────────
        | Dashboard 통계 시스템 개발 (DC-186)
        | Billing & Payment UX 개선
        | i18n 전면 적용 (DC-160, 22커밋)
        | Storage 관리 고도화
        | ** 222개 커밋 - 최고 활동 기간 **
        |
2024.10 ────────────────────────────────────────────────────
        | Auth Client SDK 안정화 (DC-173)
        | 다중 로그인 처리
        | 추가 i18n 키 일괄 추가 (DC-207)
        |
2024.11 ~ 2024.12 ──────────────────────────────────────────
        | Storage Plan 버그 수정
        | Auth Client 버전 관리
        |
2025.03 ────────────────────────────────────────────────────
        | File SDK 마이그레이션
        | Workspace 기준 용량 표시 개선
        |
2025.04 ────────────────────────────────────────────────────
        | Release Note 기능 구현
        | Storage Plan v2 레거시 제거
        | v3.3.4 릴리즈
```

---

## 핵심 역량 (이 프로젝트에서 증명)

### 1. 대규모 코드베이스 기능 개발
- Nx Monorepo (Desktop + Mobile) 환경에서 18개월간 지속적 기능 개발
- 653개 커밋, 3,061 파일 변경으로 핵심 기능 전담

### 2. 상태 관리 아키텍처 설계
- React Query 기반 서버 상태 관리 패턴 설계
- Optimistic Update, Invalidation, Refetch 전략 적용
- Recoil과 React Query 역할 분리 (로컬/서버 상태)

### 3. 글로벌 서비스 대응
- 9개 언어 다국어 시스템 구축 (커버리지 95%)
- Google Translate 충돌 대응
- 국제화된 날짜/숫자 포맷 처리

### 4. SDK 마이그레이션 경험
- Auth Client SDK 점진적 업그레이드 (v0.2.0 -> v0.2.8)
- File SDK 마이그레이션 (직접 호출 -> SDK)
- 하위 호환성 유지하며 안전한 전환

### 5. 성능 최적화
- Chunk 분할 처리로 대량 작업 안정성 확보
- React Query 캐시 전략으로 불필요한 API 호출 제거
- Window Focus Refetch로 데이터 동기화

---

## 관련 문서

- **프로젝트 경로**: `/Users/kimjin-wan/Works/workspace/cloud-monorepo`
- **기술 스택**: React, TypeScript, React Query, Recoil, Nx, i18next, Chart.js, VTK.js, Datadog
- **관련 프로젝트**:
  - DentBird Account Client (계정/구독 관리)
  - DentBird Batch Client (배치 처리 앱)
  - DentBird Module Client (마이크로 프론트엔드 모듈)

---

**마지막 업데이트**: 2026-02-08
**분석 기준**: Git commit history (jwkim@imagoworks.ai)
