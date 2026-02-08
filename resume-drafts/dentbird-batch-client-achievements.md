# DentBird Batch Client - 프로젝트 성과

> **프로젝트**: DentBird Batch (치과 CAD 크라운 디자인 배치 처리 앱)
> **기간**: 2023.12 ~ 2025.01 (약 13개월)
> **역할**: Frontend Developer (전담 개발)
> **기술 스택**: Electron, React, TypeScript, Recoil, VTK.js, Axios, i18next, Webpack

---

## 🎯 핵심 성과 요약

| 지표 | 성과 |
|------|------|
| **총 커밋** | 347개 커밋 |
| **코드 기여** | +34,918줄 / -12,387줄 (순 +22,531줄) |
| **릴리즈** | v0.0.1 → v1.0.13 (13개 버전) |
| **플랫폼** | Windows/Mac 크로스 플랫폼 지원 |
| **국제화** | 영어/일본어 다국어 지원 |

---

## 🚀 주요 개발 내역

### 1. Electron 기반 데스크톱 앱 신규 개발 (핵심 성과)

**기간**: 2023.12 ~ 2024.04
**역할**: 설계 및 구현 전담

#### 문제 상황
- 치과 CAD 크라운 디자인 작업을 배치로 처리하는 데스크톱 앱 필요
- 웹 기반 솔루션의 한계 (로컬 파일 접근, WASM 모듈 실행)
- Windows/Mac 크로스 플랫폼 지원 필요

#### 해결 방안
- **Electron 아키텍처 설계**: Main/Renderer 프로세스 분리, IPC 통신 구조
- **프로젝트 초기 세팅**: React + TypeScript + CRACO 기반 구조
- **Deep Link 연동**: dentbird:// 커스텀 프로토콜로 웹에서 앱 실행
- **자동 업데이트**: Electron Builder 기반 자동 업데이트 시스템

#### 구현 상세
```yaml
프로젝트 초기 세팅:
  - Electron + React + TypeScript 환경 구축
  - Path Alias 설정 (CRACO)
  - Testing 환경 세팅 (Jest)
  - MSW(Mock Service Worker) 연동
  - i18n 초기 세팅 (영어/일본어)

라우팅 및 레이아웃:
  - React Router 기반 라우팅 구조
  - SNB(Side Navigation Bar) 구현
  - Page Header 공통 컴포넌트
  - 반응형 레이아웃

IPC 통신:
  - Main ↔ Renderer 프로세스 통신 구조
  - File Protocol Handler 구현
  - HTTPS Protocol Handler 구현

자동 업데이트:
  - Electron Builder 설정
  - Windows/Mac 코드 사이닝
  - 업데이트 단계 UI 구현
```

#### 기술 스택
`Electron` `React` `TypeScript` `CRACO` `electron-builder`

---

### 2. API Gateway 마이그레이션 (DB-594)

**기간**: 2024.08
**역할**: 설계 및 구현 전담

#### 문제 상황
- 레거시 API 직접 호출 방식의 보안/유지보수 문제
- 토큰 갱신 로직이 분산되어 관리 어려움
- 크로스 도메인 요청 시 인증 이슈

#### 해결 방안
- **Axios 인터셉터 기반 토큰 관리**: 자동 토큰 갱신 시스템
- **Access Token Decode**: JWT 디코딩으로 불필요한 API 호출 제거
- **API Gateway URL 전환**: 환경별 엔드포인트 분리

#### 구현 상세
```yaml
토큰 관리:
  - Access Token Decode 함수 구현
  - Access Token 발급 함수 리팩토링
  - Axios Interceptor 토큰 자동 갱신
  - 로그아웃 후 재로그인 시 토큰 클리어

API Gateway:
  - API Gateway URL로 전환
  - Request Origin 변경
  - 환경별 (dev/qa/prod) 환경변수 분리

레거시 호환:
  - Cloud Server Legacy URL 유지
  - Crown Module Legacy API 호환
```

#### 기술 스택
`TypeScript` `Axios` `JWT` `OAuth2`

---

### 3. 3D Viewer UX 개선 (DB-580, DB-583, DB-587)

**기간**: 2024.06
**역할**: 설계 및 구현 전담

#### 문제 상황
- Windows/Mac 간 마우스 인터랙션 불일치
- 3D Model Tree UI/UX 개선 필요
- 다국어 지원 부재

#### 해결 방안
- **VTK Manipulator 커스터마이징**: 플랫폼별 마우스 조작 통일
- **Model Tree 개선**: 슬라이더 UX, 토글 기능 추가
- **i18n 적용**: 영어/일본어 다국어 지원

#### 구현 상세
```yaml
마우스 인터랙션 통일 (DB-580):
  - VTK Pan Manipulator 타입 선언
  - Mouse Rotate Manipulator 커스터마이징
  - Mouse Zoom Manipulator 커스터마이징
  - Windows: 좌클릭=Rotate, 우클릭=Pan, 휠=Zoom
  - Mac: Ctrl+좌클릭=Pan 지원

Model Tree 개선 (DB-583):
  - Slider Control 훅 분리
  - Slider 마우스 이벤트 핸들러
  - Group Slider Toggle 기능
  - Additional Mesh List 추가
  - Opacity 상태 유지 버그 수정

i18n 적용 (DB-587):
  - 3D Viewer P002 다국어 추가
  - Additional Model i18n 추가
```

#### 기술 스택
`VTK.js` `React` `TypeScript` `Recoil` `i18next`

---

### 4. 에러 핸들링 시스템 고도화 (DB-573, DB-565, DB-568, DB-528)

**기간**: 2024.05 ~ 2024.06
**역할**: 설계 및 구현 전담

#### 문제 상황
- 크라운 모듈 작업 중 핸들링되지 않은 에러로 앱 크래시
- 네트워크 에러 시 사용자 피드백 부재
- 세션 만료 시 작업 진행 중 데이터 손실

#### 해결 방안
- **Axios 인터셉터 에러 처리**: 글로벌 에러 핸들링
- **Retry 메커니즘**: 네트워크 에러 시 재시도 버튼
- **세션 만료 처리**: 자동 로그아웃 및 사용자 알림

#### 구현 상세
```yaml
에러 핸들링 (DB-573):
  - Crown Module Network Error Retry 버튼
  - Axios Interceptor 에러 처리
  - processOnLocal/processOnServer 에러 처리
  - Main Window Alert 연동

세션 만료 처리 (DB-565):
  - Crown Module Session 만료 감지
  - Crown Window 자동 닫기
  - Axios Header 공유 방지
  - Auth Helper 함수 분리

불필요한 에러 제거 (DB-568):
  - Axios Interceptor Reject 추가
  - Null/Undefined 에러 처리
  - designCaseId 중복 로깅 제거

Unknown 에러 처리 (DB-528):
  - 정의되지 않은 에러 Unknown 처리
  - Failed List Unknown Description 추가
  - Local Failed Case Description 추가
```

#### 기술 스택
`TypeScript` `Axios` `Electron IPC`

---

### 5. 모니터링 시스템 구축 (DB-521 + Datadog)

**기간**: 2024.05, 2024.10
**역할**: 구현 전담

#### 문제 상황
- 프로덕션 환경 에러 추적 불가
- 앱 크래시 원인 분석 어려움
- 사용자 행동 분석 부재

#### 해결 방안
- **Electron Crash Reporter**: 앱 크래시 시 자동 리포트
- **Datadog RUM 연동**: 실시간 사용자 모니터링

#### 구현 상세
```yaml
Crash Reporter (DB-521):
  - Electron Crash Reporter 초기 설정
  - 크래시 리포트 자동 전송

Datadog:
  - Datadog 패키지 설치
  - Datadog 초기화 코드 추가
  - 환경별 (dev/qa/prod) 설정 분리
  - 빌드 시 환경변수 주입
```

#### 기술 스택
`Electron` `Datadog RUM` `Crash Reporter`

---

### 6. Design Case API 대응 (DB-595)

**기간**: 2024.09
**역할**: 구현 전담

#### 문제 상황
- 백엔드 Design Case API 전면 변경
- 기존 클라이언트 코드 호환성 문제
- 데이터 타입 및 쿼리 옵션 변경

#### 해결 방안
- **신규 API 스펙 대응**: 11개 커밋으로 마이그레이션
- **타입 시스템 업데이트**: Design Case 타입 재정의
- **UI 컴포넌트 수정**: Teeth Label, Filtering 옵션

#### 구현 상세
```yaml
API 변경:
  - Case List API 변경
  - Design Case Type 변경
  - Filtering Option 수정
  - Query Option 수정

UI 변경:
  - Teeth Label 컴포넌트 추가
  - Label None일 때 최소 너비 지정
  - Legacy API URL 분리

국제화:
  - i18n 영어/일본어 지원
  - 기본 언어 폰트 수정
```

#### 기술 스택
`TypeScript` `React` `TanStack Query`

---

### 7. 빌드/배포 시스템 구축

**기간**: 2024.03 ~ 2025.01
**역할**: 설계 및 구현 전담

#### 문제 상황
- Windows/Mac 빌드 환경 미구축
- Main 프로세스 코드 번들링 필요
- 환경별 배포 파이프라인 부재

#### 해결 방안
- **Webpack 번들링**: Main 프로세스 코드 최적화
- **CRACO 환경변수**: 빌드 시점 환경변수 주입
- **Code Signing**: Windows/Mac 코드 서명

#### 구현 상세
```yaml
Webpack 번들링:
  - Main 프로세스 Webpack 설정
  - Preload 스크립트 경로 변경
  - 빌드 후 loadURL 경로 변경

환경 설정:
  - CRACO 환경변수 주입
  - 환경별 (dev/qa/prod) ENV 파일 분리
  - Custom Protocol 환경별 설정

Code Signing:
  - Windows Code Sign 설정 (DB-453)
  - Mac Code Sign 설정
  - 앱 아이콘 설정

배포 파이프라인:
  - QA/Prod 브랜치 분리
  - 빌드 스크립트 추가
  - Artifact 버전 관리
```

#### 기술 스택
`Webpack` `CRACO` `electron-builder` `Code Signing`

---

### 8. Import/Export 기능 구현

**기간**: 2024.01 ~ 2024.02
**역할**: 설계 및 구현 전담

#### 구현 상세
```yaml
Import 기능:
  - File Upload UI 구현
  - Drag & Drop 기능 구현
  - 폴더 재귀 탐색 구현
  - Import Guide Dialog (영상/이미지)

Export 기능:
  - Export Module 연동
  - Case Validate API 연동
  - Storage 용량 확인 API

Local DB:
  - Case/Project 로컬 저장 기능
  - 앱 종료 시 Case 정리
  - Project 순서 변경/삭제
```

---

### 9. 크라운 모듈 프로세서 개발

**기간**: 2024.03 ~ 2024.10
**역할**: 구현 전담

#### 구현 상세
```yaml
Crown Module:
  - Crown Core Module Initialize
  - WASM Memory Checker 컴포넌트
  - Crown Parameter 변환 로직
  - Local/Server 처리 분기

에러 처리:
  - Axios Interceptor Refresh 요청
  - Session Expired 처리
  - Unknown Error 처리
  - 15분 Timeout Failed 처리

Window 관리:
  - Crown Window 생성/관리
  - Dev Tools 환경별 표시
  - Uncaught Error Handler
```

---

## 📊 버그 수정 및 개선 (주요 항목)

```yaml
인증/세션:
  - Refresh 토큰 Unknown Error 해결
  - 토큰 도메인 다를 때 전송 안 되는 문제
  - 세션 만료 시 작업 중단 처리

UI/UX:
  - Modify Dialog 페이지 이동 시 닫기
  - Save 버튼 없을 때 Modal 닫히지 않는 문제
  - Manual Save Button 미발견 시 뒤로가기
  - Webview Wrapper 너비 변경

데이터 처리:
  - Storage 사용량 계산 로직 수정
  - designCase 필드 없으면 필터링
  - NC 파일 필터링 기능 추가

안정성:
  - executeJavascript 누적 방지
  - Crown Renderer Error 시 윈도우 유지
  - window.onerror 핸들러 수정
```

---

## 📈 기술 스택 상세

### Frontend Core
- **Framework**: React 18
- **Language**: TypeScript
- **상태 관리**: Recoil
- **UI Library**: Custom Components
- **스타일링**: styled-components
- **국제화**: i18next, react-i18next
- **HTTP Client**: Axios

### Electron
- **Main Process**: Node.js, IPC
- **Renderer Process**: React
- **빌드**: electron-builder
- **번들링**: Webpack, CRACO

### 3D Viewer
- **Core**: VTK.js
- **Interaction**: Custom Manipulators

### DevOps
- **Build**: Webpack, CRACO
- **Monitoring**: Datadog RUM, Crash Reporter
- **CI/CD**: Bitbucket Pipelines

---

## 🏆 핵심 역량 (이 프로젝트에서 증명)

### 1. Electron 데스크톱 앱 개발 경험
- 프로젝트 초기 세팅부터 v1.0.13까지 전체 개발 주도
- Main/Renderer 프로세스 분리, IPC 통신 설계
- 자동 업데이트, Deep Link 등 네이티브 기능 구현

### 2. 3D Viewer 개발 경험
- VTK.js 기반 3D 뷰어 마우스 인터랙션 커스터마이징
- 크로스 플랫폼(Windows/Mac) 조작 통일

### 3. API 아키텍처 마이그레이션
- 레거시 API → API Gateway 전환
- Axios 인터셉터 기반 토큰 자동 갱신 시스템

### 4. 에러 핸들링 시스템 설계
- 글로벌 에러 처리 아키텍처 구축
- 세션 만료, 네트워크 에러 등 엣지 케이스 처리

### 5. 빌드/배포 파이프라인 구축
- Webpack 번들링, Code Signing
- 환경별(dev/qa/prod) 배포 시스템

---

## 📝 이력서 한줄 요약

> Electron 기반 치과 CAD 배치 처리 앱을 처음부터 개발하여 13개 버전 릴리즈, 347개 커밋으로 3D Viewer UX 개선 및 API Gateway 마이그레이션 완료

---

## 📝 경력기술서 예시

```
[프로젝트명] DentBird Batch Client - 치과 CAD 크라운 디자인 배치 처리 앱
[기간] 2023.12 ~ 2025.01 (13개월)
[역할] 프론트엔드 개발 (전담)
[기술] Electron, React, TypeScript, Recoil, VTK.js, Axios, i18next, Webpack

[담당 업무]
• Electron 기반 데스크톱 앱 신규 개발
  - 프로젝트 초기 세팅 (React + TypeScript + CRACO)
  - Main/Renderer 프로세스 IPC 통신 설계
  - Deep Link (dentbird://) 연동
  - 자동 업데이트 시스템 구현
• API Gateway 마이그레이션 (DB-594)
  - Axios 인터셉터 기반 토큰 자동 갱신
  - Access Token Decode로 불필요한 API 호출 제거
• 3D Viewer UX 개선 (DB-580, DB-583, DB-587)
  - VTK.js Manipulator 커스터마이징
  - Windows/Mac 마우스 인터랙션 통일
  - Model Tree 슬라이더 UX 개선
• 에러 핸들링 시스템 고도화
  - Axios 인터셉터 글로벌 에러 처리
  - 세션 만료, 네트워크 에러 자동 처리
  - Retry 메커니즘 구현
• 모니터링 시스템 구축
  - Datadog RUM 연동
  - Electron Crash Reporter 설정
• 빌드/배포 파이프라인 구축
  - Webpack Main 프로세스 번들링
  - Windows/Mac Code Signing
  - 환경별 배포 시스템

[성과]
• 347개 커밋, 34,000+ 라인 코드 기여
• v0.0.1 → v1.0.13 (13개 버전 릴리즈)
• Windows/Mac 크로스 플랫폼 지원
• 영어/일본어 다국어 지원 구현
```

---

**마지막 업데이트**: 2025-02-06
**분석 기준**: Git commit history (jwkim@imagoworks.ai)
