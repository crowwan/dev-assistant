# DentBird Front Module Monorepo - 프로젝트 성과

> **프로젝트**: DentBird Platform Module Federation (Micro Frontend 원격 모듈 시스템)
> **기간**: 2025.06.18 ~ 2025.07.09 (3주)
> **역할**: Frontend Developer (전담 개발)
> **기술 스택**: React 18, TypeScript, Nx Monorepo, Module Federation, React Query, MSW, MUI

---

## 🎯 핵심 성과 요약

| 지표 | 성과 |
|------|------|
| **총 커밋** | 87개 |
| **코드 추가** | +58,473줄 |
| **코드 삭제** | -4,188줄 |
| **모듈 개발** | 4개 원격 모듈 신규 구축 |
| **아키텍처** | FSD(Feature-Sliced Design) 도입 |

### 커밋 유형별 분포

| 유형 | 커밋 수 | 비율 |
|------|--------|------|
| feat (기능 추가) | 60 | 69% |
| refactor (리팩토링) | 11 | 13% |
| chore (설정/환경) | 11 | 13% |
| fix (버그 수정) | 2 | 2% |
| docs (문서화) | 1 | 1% |

---

## 🚀 주요 개발 내역

### 1. Micro Frontend 아키텍처 설계 및 구축 (핵심 성과)

**기간**: 2025.06.18 ~ 2025.06.19
**역할**: 설계 및 구현 전담

#### 문제 상황
- 기존 모놀리식 프론트엔드의 확장성 한계
- 팀 간 독립적 배포 불가능
- 공유 코드 중복 및 버전 관리 어려움

#### 해결 방안
- **Nx 모노레포**: 다중 앱/라이브러리 통합 관리 구조 설계
- **Module Federation**: 런타임 원격 모듈 로딩 아키텍처 구현
- **FSD 아키텍처**: Feature-Sliced Design 도입으로 확장 가능한 구조 설계

#### 구현 상세
```yaml
프로젝트 초기 설정:
  - Nx 모노레포 초기 구성
  - Module Federation 설정 (호스트-리모트 구조)
  - 공유 의존성 최적화 (@module-federation/enhanced)
  - 개발 서버 CORS 설정

FSD 아키텍처 적용:
  - tsconfig.fsd.json 공통 설정 파일 생성
  - eslint-fsd.config.mjs 커스텀 린트 규칙 구성
  - 레이어 규칙 강제 (app → pages → features → entities → shared)
  - Path alias 설정 (@app, @pages, @features, @entities, @shared)
```

#### 기술 스택
`Nx` `Module Federation` `TypeScript` `ESLint`

---

### 2. 시스템 알림 FO(Front Office) 개발

**기간**: 2025.06.19 ~ 2025.07.07
**역할**: 설계 및 구현 전담

#### 문제 상황
- 사용자에게 시스템 알림을 전달할 채널 부재
- 알림 읽음 상태 관리 필요
- 기존 플랫폼과 통합 필요 (원격 모듈)

#### 해결 방안
- **알림 UI**: 벨 아이콘 + 드롭다운 리스트 컴포넌트 구현
- **상태 관리**: React Query 기반 서버 상태 관리
- **다국어 지원**: i18n 구조 설계 및 적용

#### 구현 상세
```yaml
알림 목록:
  - System Notification List UI 구현
  - Notification Bell 컴포넌트 분리
  - 빈 알림 상태 UI 구현
  - 알림 다이얼로그 (상세 보기) 구현
  - Markdown Viewer 연동

읽음 처리:
  - Mark as Read API 연동 (개별)
  - Mark All as Read UI 구현
  - Unread Count API 연동
  - 읽음 처리 후 목록 갱신 (invalidate)

API 클라이언트:
  - HTTP Client 인터페이스 설계
  - Cloud Center Server Type 대응
  - API URL 구조 변경 (cloud/v4)

다국어:
  - i18n 초기 세팅 구조 설계
  - App 컴포넌트 props로 언어 값 주입
  - 알림 시간 표시 로컬라이징
```

#### 기술 스택
`React` `TypeScript` `React Query` `i18next` `MSW`

---

### 3. 시스템 알림 BO(Back Office) 개발

**기간**: 2025.06.26 ~ 2025.07.09
**역할**: 설계 및 구현 전담

#### 문제 상황
- 관리자가 시스템 알림을 생성/관리할 도구 부재
- 알림 필터링 및 검색 기능 필요
- 마크다운 기반 알림 내용 작성 필요

#### 해결 방안
- **CRUD 기능**: 알림 생성/조회/수정/삭제 전체 구현
- **필터링**: 상태별, 날짜별 필터 기능 구현
- **에디터**: Markdown 에디터 연동

#### 구현 상세
```yaml
알림 관리:
  - System Notification List Page 구현
  - 알림 CRUD API 연동
  - React Router DOM 라우팅 설정

필터링:
  - Status Filter (All/Active/Inactive)
  - Date Range Picker (MUI X Date Pickers)
  - Query Key에 URL params 연동
  - Filter 데이터 변경 함수 통합

UI/UX:
  - 1차 디자인 작업 완료
  - Remix Icon 에셋 적용
  - React Query DevTools 연동

개발 환경:
  - MSW Mock API 구현
  - Bootstrap 초기화 로직 설계
  - 타입별 폴더 구조 리팩토링
```

#### 기술 스택
`React` `TypeScript` `React Query` `MUI` `MUI X Date Pickers` `React MD Editor` `MSW`

---

### 4. Feature Toggle 관리 UI 개발

**기간**: PR #22206 (Merged)
**역할**: 원격 모듈 구현

#### 구현 상세
```yaml
Feature Toggle:
  - Feature Toggle 관리 UI 원격 모듈 구현
  - 기존 플랫폼 통합 가능한 구조 설계
```

---

### 5. Tenant Change 원격 모듈 개발

**기간**: PR #21637 (Merged)
**역할**: 원격 모듈 구현

#### 구현 상세
```yaml
Tenant Change:
  - 사용자 테넌트 변경 기능 원격 모듈
  - Type 선언 파일 자동 생성 스크립트 구현
  - 빌드 후 타입 정의 ZIP 압축 자동화
```

---

## 📊 기술 스택 상세

### Frontend Core
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Nx Monorepo
- **Module System**: Module Federation (@module-federation/enhanced)
- **상태 관리**: TanStack Query (React Query)
- **UI Library**: MUI v5, MUI X Date Pickers
- **스타일링**: Emotion
- **라우팅**: React Router DOM
- **국제화**: i18next
- **HTTP Client**: Custom Interface (Cloud Center Server 대응)

### Testing & Development
- **Mock Server**: MSW (Mock Service Worker)
- **Dev Tools**: React Query DevTools

### Architecture
- **Pattern**: FSD (Feature-Sliced Design)
- **Module**: Micro Frontend (Module Federation)

---

## 🛠️ 기술적 도전 및 해결

### 1. Module Federation 공유 의존성 충돌

**문제**: 호스트 앱과 원격 모듈 간 React/React Query 버전 불일치로 런타임 에러 발생

**해결**:
- singleton 옵션으로 공유 라이브러리 단일 인스턴스 강제
- requiredVersion 명시로 버전 호환성 보장
- eager loading 전략 적용

### 2. FSD 아키텍처 규칙 강제

**문제**: 팀원들의 일관된 FSD 규칙 준수 어려움

**해결**:
- eslint-fsd.config.mjs 커스텀 규칙 작성
- 레이어 간 import 방향 린트로 강제
- tsconfig.fsd.json 공통 설정으로 path alias 통일

### 3. 호스트-리모트 간 타입 공유

**문제**: 원격 모듈의 타입 정의를 호스트 앱에서 사용 불가

**해결**:
- 빌드 시 .d.ts 파일 자동 생성 스크립트 구현
- 타입 정의 ZIP 압축 후 배포
- generate:types 스크립트 자동화

### 4. 개발 환경 CORS 문제

**문제**: 로컬 개발 시 Module Federation 원격 모듈 로딩 CORS 에러

**해결**:
- project.json에 devServer headers 설정 추가
- Access-Control-Allow-Origin: * 허용
- historyApiFallback 활성화

---

## ✍️ 이력서 요약 문구

### 한 줄 요약
> Nx 모노레포 기반 Micro Frontend 시스템 구축 - Module Federation으로 4개 원격 모듈 개발, FSD 아키텍처 도입, 87 커밋, 58K+ LOC (3주)

### 상세 버전
> - Nx 모노레포 + Module Federation 기반 Micro Frontend 아키텍처 설계 및 구현
> - 시스템 알림 FO/BO 풀스택 프론트엔드 개발 (CRUD, 필터링, 다국어 지원)
> - FSD(Feature-Sliced Design) 아키텍처 도입 및 ESLint 커스텀 규칙 구성
> - React Query 기반 서버 상태 관리 패턴 설계, MSW Mock API 환경 구축

---

## 📅 활동 타임라인

```
2025.06.18 ─────────────────────────────────────────────────────
        │ 모노레포 초기 설정
        │ Nx + Module Federation 구성
        │ FSD 아키텍처 템플릿 생성
        │
2025.06.19 ~ 2025.06.24 ────────────────────────────────────────
        │ notification_fo 개발
        │ MSW Mock API 구성
        │ 알림 목록/상세/읽음 처리 구현
        │
2025.06.26 ~ 2025.06.30 ────────────────────────────────────────
        │ notification_bo 초기 설정
        │ 알림 관리 페이지 구현
        │ 필터링/검색 기능 개발
        │
2025.07.01 ~ 2025.07.07 ────────────────────────────────────────
        │ notification_fo/bo 기능 완성
        │ i18n 다국어 지원 적용
        │ API 클라이언트 최적화
        │
2025.07.09 ─────────────────────────────────────────────────────
        │ 타입 분리 리팩토링
        │ 폴더 구조 정리
        │ 코드 품질 개선
```

---

## 📝 경력기술서 예시

```
[프로젝트명] DentBird Platform Micro Frontend 시스템 구축
[기간] 2025.06 ~ 2025.07 (3주)
[역할] 프론트엔드 개발 (전담)
[기술] React 18, TypeScript, Nx Monorepo, Module Federation, React Query, MSW, MUI, FSD Architecture

[담당 업무]
• Micro Frontend 아키텍처 설계 및 구현
  - Nx 모노레포 + Module Federation 기반 독립 배포 가능한 원격 모듈 시스템 구축
  - 4개 원격 모듈 개발 (notification_fo, notification_bo, feature_toggle, user_tenant_change)
  - FSD(Feature-Sliced Design) 아키텍처 도입 및 ESLint 커스텀 규칙 구성

• 시스템 알림 FO(Front Office) 개발
  - 알림 목록 조회, 개별/전체 읽음 처리, 읽지 않은 알림 카운트
  - React Query 기반 서버 상태 관리, i18n 다국어 지원

• 시스템 알림 BO(Back Office) 개발
  - 알림 CRUD 관리 페이지, 상태별/날짜별 필터링
  - Markdown 에디터 기반 알림 내용 작성

• 개발 환경 및 아키텍처 설계
  - MSW Mock API 환경 구축
  - HTTP Client 추상화 및 API 클라이언트 패턴 설계
  - 호스트-리모트 간 타입 공유 자동화 스크립트 구현

[성과]
• 3주 내 4개 독립 모듈 개발 완료 (87 커밋, 58K+ LOC)
• Module Federation 통한 독립 배포 체계 구축
• FSD 아키텍처 도입으로 확장 가능한 코드 구조 확립
```

---

## 🔗 관련 문서

- 프로젝트 경로: `/Users/kimjin-wan/Works/devops/dentbird-front-module-monorepo`
- 기술 스택: React, TypeScript, Nx, Module Federation, React Query, MSW, MUI, FSD
- 관련 PR: #22214 (Credential), #22206 (Feature Toggle), #21637 (Tenant Change)

---

**마지막 업데이트**: 2026-02-06
**분석 기준**: Git commit history (jwkim@imagoworks.ai)
