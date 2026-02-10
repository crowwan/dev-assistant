# DentBird Linker App - 프로젝트 성과

> **프로젝트**: DentBird Linker (치과 CAM 소프트웨어 연동 데스크톱 앱)
> **기간**: 2024.08 ~ 2025.12 (약 17개월)
> **역할**: Frontend Developer (주 개발자, 전체 커밋의 78% 기여)
> **기술 스택**: Electron, React, TypeScript, Vite, Express, draco3d, JSZip, Axios

---

## 🎯 핵심 성과 요약

| 지표 | 성과 |
|------|------|
| **총 커밋** | 223개 커밋 (전체 285개 중 78%) |
| **코드 기여** | +44,448줄 / -14,988줄 (순 +29,460줄) |
| **변경 파일** | 457개 |
| **릴리즈** | v1.0.0 → v1.0.3-0 (8개 버전) |
| **플랫폼** | Windows/Mac 크로스 플랫폼 지원 |
| **연동 SW** | 다수 CAM 소프트웨어 연동 (AccuWare, hyperDent, nauta, Go2dental 등) |

### 커밋 유형별 분포

| 유형 | 커밋 수 | 비율 |
|------|--------|------|
| feat (기능 추가) | 142 | 64% |
| chore (설정/유지보수) | 19 | 9% |
| Merge | 17 | 8% |
| docs (문서) | 12 | 5% |
| version (릴리즈) | 7 | 3% |
| fix (버그 수정) | 7 | 3% |
| refactor (리팩토링) | 19 | 9% |

---

## 🚀 주요 개발 내역

### 1. Electron 기반 데스크톱 앱 초기 세팅 및 아키텍처 설계 (핵심 성과)

**기간**: 2024.08
**역할**: 설계 및 구현 전담
**커밋**: 113개 (1개월 집중 개발)

#### 문제 상황
- 웹 브라우저(DentBird Cloud)에서 로컬 CAM 소프트웨어와 통신 필요
- 파일 업로드/다운로드, 소프트웨어 실행 등 네이티브 기능 요구
- Windows/Mac 크로스 플랫폼 지원 필요

#### 해결 방안
- **Electron + Vite + React + TypeScript** 프로젝트 아키텍처 설계
- **로컬 Express 서버** 내장으로 웹 ↔ 데스크톱 HTTP 통신
- **Config 클래스 기반** 소프트웨어 관리 시스템

#### 구현 상세
```yaml
프로젝트 초기 세팅:
  - Electron + Vite + React + TypeScript 환경 구축
  - Main/Renderer 프로세스 분리 아키텍처
  - Context Bridge 기반 IPC 통신 구조
  - ESLint + Prettier 코드 품질 설정
  - Path Alias 및 TypeScript 설정 최적화

UI 구현:
  - Custom TitleBar (최소화/최대화/닫기)
  - System Tray 연동 (환경별 앱 이름 표시)
  - Software List 컴포넌트 (상태/아이콘/경로 표시)
  - Port Dialogue (포트 번호 설정/중복 방지)
  - Software Image Placeholder 처리

Config 관리 시스템:
  - Config 클래스 설계 (소프트웨어 정보 관리)
  - userData 경로에 JSON Config 파일 관리
  - 동적 소프트웨어 추가 시 Config 자동 업데이트
  - 세션 당 1회 Initialize 최적화

로컬 서버:
  - Express 기반 내장 HTTP 서버
  - CORS 제한 해제 (웹 ↔ 로컬 통신)
  - 파일 업로드 API (Multer)
  - 소프트웨어 Health Check 엔드포인트

프로세스 관리:
  - Child Process 기반 CAM 소프트웨어 실행
  - 소프트웨어 종료 시 임시 파일 자동 정리
  - 5분 주기 소프트웨어 접근 가능 여부 모니터링
  - Background Throttling 해제

자동 업데이트:
  - electron-updater 기반 자동 업데이트 시스템
  - Update Check → Download → Install 단계 UI
  - 환경별 업데이트 채널 분리 (dev/qa/prod)
  - IPC 통신 기반 업데이트 상태 Renderer 전달

OS 통합:
  - OS 로그인 시 자동 실행 기능
  - dev 모드에서는 자동 실행 비활성화
  - Mac/Windows 별도 Tray 아이콘 처리
```

#### 기술 스택
`Electron` `React` `TypeScript` `Vite` `Express` `Multer` `electron-updater`

---

### 2. CAM 소프트웨어 연동 확장 및 v1.0.0 릴리즈

**기간**: 2024.09
**역할**: 설계 및 구현 전담
**커밋**: 56개

#### 문제 상황
- 다양한 CAM 소프트웨어별 연동 규격 차이
- 환경별(dev/qa/prod) 배포 파이프라인 부재
- Windows Code Signing 필요

#### 해결 방안
- **소프트웨어별 Config** 기반 동적 연동 구조
- **cross-env 기반** 환경별 빌드 시스템
- **electron-builder** Code Signing 설정

#### 구현 상세
```yaml
소프트웨어 연동:
  - Go2dental 소프트웨어 추가 및 연동
  - AccuWare 소프트웨어 추가 및 연동
  - 소프트웨어별 아이콘/이미지 관리
  - Die 모델 제외 옵션 (소프트웨어별 설정)

빌드/배포:
  - cross-env 기반 환경별 빌드 스크립트
  - electron-builder 설정 (Windows)
  - Prod 환경 Code Signing 적용
  - 환경별 .env 파일 분리
  - buildScript.js 커스텀 빌드 스크립트

안정성:
  - Upload Cache 폴더 관리 (요청 시 초기화)
  - 포트 번호 중복 방지 로직
  - 개발자 도구 환경별 접근 제어

릴리즈:
  - v1.0.0 (2024.09.29) 최초 프로덕션 릴리즈
```

#### 기술 스택
`electron-builder` `cross-env` `dotenv` `Code Signing`

---

### 3. 소프트웨어 확장 (hyperDent, nauta) 및 v1.0.1 릴리즈

**기간**: 2025.02 ~ 2025.03
**역할**: 설계 및 구현 전담

#### 구현 상세
```yaml
새 소프트웨어 추가:
  - hyperDent 소프트웨어 Config/UI 추가
  - nauta 소프트웨어 Config/UI 추가
  - hyperDent Die 파일 제외 설정
  - 소프트웨어별 openType 설정

Health Check 개선:
  - 개별 소프트웨어 헬스 체크 실패 에러코드 추가
  - ProgramData 경로 검색 제외 (Windows)

빌드 개선:
  - buildScript.js 추가
  - test 환경 빌드 스크립트 추가
  - prod build script 수정

릴리즈:
  - v1.0.1-0 (2025.03.04) QA
  - v1.0.1 (2025.03.16) Production
```

---

### 4. AccuWare Export 버그 수정 및 v1.0.2 릴리즈

**기간**: 2025.05 ~ 2025.07
**역할**: 설계 및 구현 전담

#### 문제 상황
- AccuWare Export 시 Health Check가 올바른 소프트웨어를 찾지 못하는 문제
- 소프트웨어 ID 변경에 따른 호환성 이슈

#### 해결 방안
- Health Check 시 **path 기반으로 소프트웨어 ID 조회** 방식으로 변경
- sw info에 path 필드 추가로 정확한 식별 지원

#### 구현 상세
```yaml
버그 수정:
  - health check 시 path를 받아 sw id를 찾는 방식으로 변경
  - sw info에 path 필드 추가
  - software id 정정

릴리즈:
  - v1.0.2-0 (2025.06.09) QA
  - v1.0.2-1 (2025.06.30) QA 패치
  - v1.0.2 (2025.07.01) Production
```

---

### 5. Chrome PNA 대응 - Custom Protocol 시스템 구현 (핵심 성과)

**기간**: 2025.11 ~ 2025.12
**역할**: 기술 조사, 설계, 구현 전담
**커밋**: 26개

#### 문제 상황
- **Chrome Private Network Access (PNA)** 정책으로 웹 → localhost HTTP 요청 차단
- 기존 Express 서버 기반 통신 방식이 Chrome 업데이트로 동작 불가
- 전체 Linker 앱의 통신 방식 재설계 필요

#### 기술 조사 (Spike)
```yaml
조사한 접근법:
  1. WebSocket POC: Chrome PNA 우회 가능 여부 검증
  2. Custom Protocol POC: dentbird:// 커스텀 프로토콜 방식 검증
  3. Chrome PNA 솔루션 전체 분석 문서 작성 (767줄)

결론:
  - Custom Protocol 방식 채택 (브라우저 독립적, 보안 우수)
  - WebSocket은 보조 수단으로 유지
```

#### 해결 방안
- **Custom Protocol (dentbird://)**: 웹에서 프로토콜 URL 호출 → Electron 앱이 수신
- **Deep Link 핸들링**: 앱 미실행 시에도 프로토콜 URL 처리
- **DRC → STL 변환**: draco3d 라이브러리 기반 파일 변환 파이프라인

#### 구현 상세
```yaml
Phase 0-2: Custom Protocol 핸들러 구현:
  - dentbird:// 프로토콜 등록 및 핸들러
  - URL 파라미터 파싱 (action, files, swId 등)
  - Deep Link 처리 (앱 미실행 시 URL 저장 → 실행 후 처리)
  - IPC 직렬화 리팩토링 (Config 전달 시)

Phase 1: ALPHA AI Protocol 연동:
  - File Server API 기반 복수 파일 다운로드
  - DRC → STL 변환 기능 (draco3d)
  - CAM 소프트웨어로 변환된 파일 전달
  - Modeler Export Protocol 검증

IPC 개선:
  - Child Process에서 sw info 병합 처리
  - IPC 내에서 Config 직렬화 전달
  - 직렬화 로직 리팩토링

문서화:
  - Chrome PNA 솔루션 분석 (830줄)
  - Spike 계획 및 결과 문서 (2,078줄)
  - 1차 개발 상세 구현 계획서
  - 포트 통신 SW 연동 설계 문서 (1,012줄)
```

#### 기술 스택
`Electron Protocol Handler` `Deep Link` `draco3d` `DRC→STL` `File Server API`

---

## 📊 버그 수정 및 개선 (주요 항목)

```yaml
프로세스 관리:
  - Multiple file 처리 수정
  - Initialize 시 이전 작업 kill 방지 (안정성)
  - Background Throttling 해제 (성능)

인증/통신:
  - CORS Origin 제한 해제
  - Health Check path 기반 SW 식별 방식 변경
  - AccuWare export 버그 해결

자동 업데이트:
  - Update not available 메시지 순서 수정
  - 업데이트 확인 후 Config Initialize 순서 조정
  - UpdateCheckFallback 코드 분리

UI/UX:
  - Window 최소 높이/패딩 조정
  - Dev 모드에서 OS 시작 시 자동 실행 비활성화
  - Software Image Placeholder 처리
```

---

## 🛠️ 기술적 도전 및 해결

### 1. Chrome PNA (Private Network Access) 대응

**문제**: Chrome 보안 정책 변경으로 웹페이지에서 localhost Express 서버로의 HTTP 요청 차단

**해결**:
- WebSocket / Custom Protocol 2가지 접근법 POC 수행
- Custom Protocol (dentbird://) 방식 채택
- Deep Link로 앱 미실행 시에도 요청 처리 가능
- 브라우저 독립적 통신 방식으로 장기적 안정성 확보

### 2. DRC → STL 실시간 파일 변환

**문제**: CAM 소프트웨어가 STL 형식만 지원하나, 서버에서 DRC(Draco) 압축 파일 전송

**해결**:
- draco3d 라이브러리 통합으로 Electron 앱 내 변환 파이프라인 구축
- Binary 파일 핸들링 및 메모리 관리
- 복수 파일 동시 변환 지원

### 3. CAM 소프트웨어 프로세스 라이프사이클 관리

**문제**: 다양한 CAM 소프트웨어의 실행/종료/에러 상태 관리

**해결**:
- Child Process 기반 소프트웨어 실행 관리
- 5분 주기 자동 Health Check
- Config 기반 동적 소프트웨어 등록/검색
- 임시 파일 자동 정리

### 4. IPC 직렬화 이슈

**문제**: Electron IPC 통신 시 Config 객체 전달 시 메서드/함수 소실

**해결**:
- IPC 전달 시 명시적 직렬화 처리
- Child Process ↔ Main Process 간 sw info 병합 로직 개선
- 직렬화 코드 리팩토링으로 일관된 데이터 전달

---

## 📈 기술 스택 상세

### Frontend Core
- **Framework**: React 18
- **Language**: TypeScript
- **빌드 도구**: Vite
- **UI Library**: @imago-cloud/design-system
- **HTTP Client**: Axios

### Electron
- **Main Process**: Node.js, Express, IPC
- **Renderer Process**: React + Vite
- **빌드**: electron-builder
- **업데이트**: electron-updater
- **프로토콜**: Custom Protocol Handler (dentbird://)

### Backend (내장 서버)
- **Framework**: Express
- **파일 처리**: Multer, JSZip
- **3D 변환**: draco3d (DRC → STL)

### DevOps
- **빌드**: Vite, tsc, electron-builder
- **환경 관리**: cross-env, dotenv
- **Code Signing**: Windows EV 코드 서명
- **브랜치 전략**: kevin → qa → prod

---

## 🏆 핵심 역량 (이 프로젝트에서 증명)

### 1. Electron 데스크톱 앱 0→1 개발
- 프로젝트 초기 세팅부터 v1.0.3까지 전체 아키텍처 설계 및 개발 주도
- Main/Renderer 프로세스 분리, IPC 통신, Context Bridge 구조 설계
- 자동 업데이트, System Tray, 환경별 빌드 시스템 구현

### 2. 기술 문제 해결 능력 (Chrome PNA 대응)
- Chrome PNA 정책 변경이라는 외부 요인에 대한 기술 조사 → POC → 솔루션 설계 → 구현
- Custom Protocol 방식 채택으로 브라우저 독립적 통신 확보
- 조사/분석 문서 4,000줄+ 작성으로 기술 의사결정 근거 문서화

### 3. CAM 소프트웨어 연동 시스템 설계
- Config 기반 동적 소프트웨어 관리 구조 설계
- 다수 CAM 소프트웨어 연동 (AccuWare, hyperDent, nauta, Go2dental 등)
- Health Check, 프로세스 관리, 파일 변환 파이프라인 구현

### 4. 빌드/배포 시스템 구축
- electron-builder 기반 Windows 빌드 파이프라인
- Code Signing 적용
- 환경별(dev/qa/prod) 배포 시스템

---

## 📅 활동 타임라인

```
2024.08 ─────────────────────────────────────────────────────
        │ 프로젝트 초기 세팅 (113 커밋, 1개월 집중 개발)
        │ Electron + Vite + React + TS 아키텍처 설계
        │ 로컬 Express 서버, Config 시스템, UI 구현
        │ 자동 업데이트, System Tray, OS 통합
        │
2024.09 ─────────────────────────────────────────────────────
        │ CAM 소프트웨어 연동 (Go2dental, AccuWare)
        │ 환경별 빌드/배포 시스템 구축
        │ Code Signing 적용
        │ ★ v1.0.0 프로덕션 릴리즈 (2024.09.29)
        │
2025.02 ~ 2025.03 ──────────────────────────────────────────
        │ hyperDent, nauta 소프트웨어 추가
        │ Health Check 시스템 개선
        │ ★ v1.0.1 릴리즈 (2025.03.16)
        │
2025.05 ~ 2025.07 ──────────────────────────────────────────
        │ AccuWare Export 버그 수정
        │ path 기반 SW 식별 방식 도입
        │ ★ v1.0.2 릴리즈 (2025.07.01)
        │
2025.11 ~ 2025.12 ──────────────────────────────────────────
        │ Chrome PNA 솔루션 조사 및 분석
        │ WebSocket / Custom Protocol POC
        │ Custom Protocol 핸들러 구현 (Phase 0-2)
        │ DRC → STL 변환 파이프라인
        │ ALPHA AI Protocol 연동 (Phase 1)
        │ ★ v1.0.3-0 릴리즈
```

---

## 📝 이력서 한줄 요약

> Electron 기반 치과 CAM 소프트웨어 연동 데스크톱 앱을 0부터 설계/개발하여 8개 버전 릴리즈, Chrome PNA 대응 Custom Protocol 아키텍처 도입 및 다수 CAM SW 연동 시스템 구축 - 223 커밋, 44K+ LOC

---

## 📝 경력기술서 예시

```
[프로젝트명] DentBird Linker - 치과 CAM 소프트웨어 연동 데스크톱 앱
[기간] 2024.08 ~ 2025.12 (17개월)
[역할] 프론트엔드 개발 (주 개발자, 78% 기여)
[기술] Electron, React, TypeScript, Vite, Express, draco3d, electron-builder

[담당 업무]
• Electron 기반 데스크톱 앱 0→1 신규 개발
  - Electron + Vite + React + TypeScript 아키텍처 설계
  - Main/Renderer 프로세스 IPC 통신 설계
  - 내장 Express 서버로 웹 ↔ 데스크톱 통신
  - Config 클래스 기반 동적 소프트웨어 관리 시스템
• Chrome PNA 대응 Custom Protocol 시스템 구현
  - WebSocket / Custom Protocol POC 수행 및 기술 의사결정
  - dentbird:// 프로토콜 핸들러 설계 및 구현
  - Deep Link 처리 (앱 미실행 시 URL 대기 → 처리)
  - DRC → STL 실시간 파일 변환 파이프라인
• CAM 소프트웨어 연동 시스템 구축
  - 다수 CAM SW 연동 (AccuWare, hyperDent, nauta 등)
  - Child Process 기반 SW 실행/모니터링
  - Health Check 시스템 (path 기반 식별)
• 빌드/배포 파이프라인 구축
  - electron-builder 기반 Windows 빌드
  - Code Signing 적용
  - 환경별(dev/qa/prod) 배포 시스템
• 자동 업데이트 시스템
  - electron-updater 기반 OTA 업데이트
  - 업데이트 단계별 UI 및 IPC 통신

[성과]
• 223개 커밋, 44,000+ 라인 코드 기여 (전체의 78%)
• v1.0.0 → v1.0.3-0 (8개 버전 릴리즈)
• Chrome PNA 정책 변경 대응 - Custom Protocol 아키텍처 도입으로 브라우저 독립적 통신 확보
• Windows/Mac 크로스 플랫폼 지원
```

---

**마지막 업데이트**: 2026-02-10
**분석 기준**: Git commit history (jwkim@imagoworks.ai)
