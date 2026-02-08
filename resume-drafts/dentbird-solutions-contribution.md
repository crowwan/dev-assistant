# Dentbird Solutions 프로젝트 기여 분석

> 작성일: 2026-02-06
> 분석 기간: 2024.06 ~ 2026.02 (약 20개월)

---

## 📌 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **프로젝트명** | Dentbird Solutions (치과 CAD/CAM SaaS 플랫폼) |
| **회사** | ImagoWorks (이마고웍스) |
| **역할** | Frontend Developer / QA Automation Engineer |
| **기술 스택** | React, TypeScript, Electron, Playwright, NX Monorepo |
| **배포 환경** | Azure DevOps Pipeline, Kubernetes |

---

## 📊 기여 통계

| 지표 | 수치 |
|------|------|
| **총 커밋 수** | 307개 |
| **코드 추가** | +269,930줄 |
| **코드 삭제** | -32,911줄 |
| **변경 파일** | 4,245개 |
| **Merged PR** | 275개 |

### 커밋 유형별 분포

| 유형 | 커밋 수 | 비율 |
|------|--------|------|
| Merged PR | 275 | 90% |
| feat (기능 추가) | 10 | 3% |
| fix (버그 수정) | 4 | 1% |
| chore/refactor | 18 | 6% |

---

## 🏆 주요 성과

### 1. Linker Desktop - CAM 소프트웨어 연동 시스템 개발

**기간**: 2025.11 ~ 2026.02

**상세 내용**:
- Electron 기반 데스크톱 앱으로 16개+ CAM 소프트웨어 실시간 연동
- Protocol/HTTP 방식 CAM Export 좌표계 변환 구현
  - MILLBOX, D+CAM, Alpha AI, hyperDENT, PreForm 등
  - STL/PLY 파일 3D 좌표계 변환 알고리즘
- Export Session 방식 Protocol Handler 아키텍처 설계
- Windows EV 코드 서명 CI/CD 파이프라인 구축
- Datadog RUM/Logs 모니터링 통합 (Main/Renderer 프로세스)

**관련 커밋**:
```
feat(linker): Protocol 방식 MILLBOX/DGSHAPE CAM 좌표계 변환 구현
feat(linker): PROCESS 타입 CAM 소프트웨어 (hyperDENT, PreForm 등 8개)에 Protocol 방식 좌표계 변환 지원
feat(linker-desktop): Export Session 방식 Protocol Handler 구현 및 embed-modules 리팩토링
feat: Windows 코드 서명 파이프라인 구축 (linker-desktop, batch-desktop)
feat(linker-desktop): Datadog RUM 및 Logs API 모니터링 통합
```

**성과**:
- 16개+ CAM 소프트웨어 연동으로 사용자 워크플로우 통합
- Jest 테스트 커버리지 확보 (30+ 테스트 케이스, Qase 연동)
- Windows/macOS 크로스 플랫폼 빌드 자동화

---

### 2. Backoffice E2E 테스트 자동화 시스템 구축

**기간**: 2025.08 ~ 2025.10

**상세 내용**:
- Playwright 기반 E2E 테스트 프레임워크 아키텍처 설계
- Page Object 패턴 적용으로 테스트 코드 재사용성 향상
- Kubernetes CronJob 기반 일일 자동 테스트 환경 구축
- Teams 웹훅 연동으로 테스트 결과 실시간 알림
- 80+ E2E 테스트 케이스 작성
  - 로그인/인증 시나리오
  - 사용자 생성/수정/삭제
  - 구독 관리 및 결제 이력
  - 세션 관리 (멀티 브라우저 동시 로그인 감지)

**관련 커밋**:
```
feat(e2e): Backoffice 로그인 테스트 및 E2E 인프라 구축
feat: E2E 테스트 Kubernetes 통합 스케줄러 구축 (Phase 1, 2 완료)
feat(e2e-backoffice): Create new user Suite 완료 - 8개 테스트 구현
refactor: Backoffice E2E 테스트에서 로그인 중복 코드를 auth 헬퍼 함수로 추출하여 93% 코드 감소
tech: E2E 크론잡 Teams 웹훅 알림 구현
```

**성과**:
- 80+ E2E 테스트 케이스로 회귀 테스트 자동화
- 로그인 중복 코드 93% 감소 (auth 헬퍼 함수 추출)
- 테스트 실행 성능 39% 개선

---

### 3. Cloud/Module 클라이언트 모노레포 마이그레이션

**기간**: 2024.06 ~ 2025.01

**상세 내용**:
- 분산된 5개+ 프론트엔드 프로젝트를 NX 모노레포로 통합
  - Cloud Desktop/Mobile
  - Viewer/Export/Explorer 모듈
  - Dealer Backoffice
- Azure DevOps Pipeline CI/CD 구성 (dev/qa/prod 환경)
- 공통 라이브러리 추출 및 모듈화
  - cloud-hooks, cloud-states, cloud-i18n
- Datadog RUM 모니터링 전사 적용

**관련 커밋**:
```
Cloud client desktop 이관
cloud mobile client 이관
dealer-backoffice client 이관
Module client 파이프라인 연동
Viewer module dev 파이프라인 연동
export module 파이프라인 연동
```

**성과**:
- 빌드 시간 단축 및 코드 공유로 개발 생산성 향상
- 환경별 배포 파이프라인 자동화
- i18n 다운로드/업로드 로직 중앙화

---

### 4. Export 기능 개선 및 API 마이그레이션

**기간**: 2025.12 ~ 2026.02

**상세 내용**:
- Modeler Export v5 API 마이그레이션 (solutionPayload 기반)
- productDisplayType 기반 Die/Base 분류 로직 개선
- crown-io 모듈 리팩토링
  - 순수 함수 추출
  - 기능별 파일 분리
  - 타입 안전성 강화
- Bridge Export CI 파일 통합 생성 및 Progress 개선

**관련 커밋**:
```
feat(export-dialog): Modeler Export v5 API 마이그레이션 - solutionPayload 활용
feat(export): Modeler Export v5 API 대응 - productDisplayType 기반 Die/Base 분류
refactor(crown-io): getCAMProtocolExportData 기능별 파일 분리 및 순수 함수 추출
fix(crown-io): Bridge Export 시 CI 파일 통합 생성 및 Progress 개선
fix: D+CAM export 시 INI 파일에 치아 정보가 비어있는 문제 수정
```

**성과**:
- v5 API 마이그레이션으로 Legacy fallback 코드 제거
- 순수 함수 추출로 테스트 용이성 향상

---

### 5. Viewer Module 기능 개선

**기간**: 2024.09 ~ 2025.08

**상세 내용**:
- 3D 모델 뷰어 기능 개선
  - Bridge 생성일자 표기
  - Model tree 정렬 로직 수정
  - RGBA PLY 파일 텍스처 지원
- Case Share 기능 구현
  - 공유 링크 생성 시 치식 표기법 적용
  - 만료된 링크 처리
- 모바일 최적화
  - 파일명 말줄임 처리
  - 스크롤 영역 버그 수정

**관련 커밋**:
```
viewer module model tree에서 bridge 생성일자 표기되지 않는 문제 수정
fix: viewer-module API 응답 순서 유지하도록 그룹 정렬 로직 수정
share 링크 생성 시 notation 기준으로 share page에서 치식 번호 표기되도록 변경
fix: viewer 에서 rgba를 가지는 ply에 대해 texture 표시되지 않는 문제 해결
```

---

## 📋 주요 PR 목록

| PR | 제목 | 내용 |
|----|------|------|
| #30537 | Cloud E2E manual_pass TC 자동화 | 44 TC 처리, 17 completed |
| #30509 | Modeler Export v5 API 대응 | productDisplayType 기반 분류 |
| #30182 | Windows 코드 서명 파이프라인 구축 | linker-desktop, batch-desktop |
| #28444 | Export Session 방식 Protocol Handler | 아키텍처 설계 및 구현 |
| #26047 | Backoffice E2E 인프라 구축 | Playwright 기반 테스트 환경 |
| #26427 | E2E K8s 통합 스케줄러 | Phase 1, 2 완료 |

---

## 🛠️ 기술적 도전 및 해결

### 1. CAM 소프트웨어별 좌표계 변환

**문제**: CAM 소프트웨어마다 다른 좌표계 사용으로 Export 시 모델 방향 불일치

**해결**:
- Protocol/HTTP 방식별 변환 매트릭스 적용
- constructionInfo.transformMat 직접 사용으로 로직 단순화
- legacy-libs와 동기화하여 D+CAM 호환성 확보

### 2. Electron Main/Renderer 프로세스 에러 추적

**문제**: 데스크톱 앱에서 사용자 환경의 에러를 추적하기 어려움

**해결**:
- Datadog RUM/Logs API 통합
- Main 프로세스와 Renderer 프로세스 분리 로깅
- IPC 통신 에러 핸들링 강화

### 3. E2E 테스트 환경 안정성

**문제**: Docker/K8s 환경에서 브라우저 테스트 불안정

**해결**:
- EC2 기반 SSH 접근 방식으로 전환
- beforeAll + describe.serial 패턴 적용
- 테스트별 로그인 세션 공유로 성능 39% 개선

### 4. 모노레포 마이그레이션 시 의존성 충돌

**문제**: 분산된 프로젝트들의 패키지 버전 불일치

**해결**:
- 단일 package.json 전략 채택
- NX enforce-module-boundaries로 의존성 엄격 제어
- 공통 라이브러리 추출로 코드 중복 제거

---

## ✍️ 이력서 요약 문구

### 한 줄 요약
> 치과 CAD/CAM SaaS 플랫폼에서 Electron 기반 CAM 연동 시스템, Playwright E2E 자동화(80+ TC), NX 모노레포 마이그레이션 주도 - 307 커밋, 275 PR, 270K+ LOC

### 상세 버전
> - Electron 기반 CAM 소프트웨어 연동 시스템 개발 (16개+ SW, Protocol/HTTP 방식 좌표계 변환)
> - Playwright E2E 테스트 자동화 시스템 구축 (80+ TC, 코드 중복 93% 감소, K8s CronJob)
> - 5개+ 프론트엔드 프로젝트 NX 모노레포 마이그레이션 및 CI/CD 파이프라인 구축
> - Windows EV 코드 서명 파이프라인 구축 및 Datadog 모니터링 통합

---

## 📅 활동 타임라인

```
2024.06 ─────────────────────────────────────────────────────
        │ 모노레포 마이그레이션 시작
        │ Cloud Desktop/Mobile 이관
        │
2024.09 ~ 2025.01 ───────────────────────────────────────────
        │ Viewer/Export/Explorer 모듈 이관
        │ Dealer Backoffice 마이그레이션
        │ Azure Pipeline CI/CD 구축
        │
2025.08 ~ 2025.10 ───────────────────────────────────────────
        │ E2E 테스트 인프라 구축 (Playwright)
        │ Backoffice 80+ 테스트 케이스 작성
        │ K8s CronJob 자동화
        │
2025.11 ~ 2025.12 ───────────────────────────────────────────
        │ Linker Desktop 핵심 개발
        │ Protocol 방식 CAM Export 구현
        │ Windows 코드 서명 파이프라인
        │
2026.01 ~ 2026.02 ───────────────────────────────────────────
        │ Export v5 API 마이그레이션
        │ crown-io 리팩토링
        │ Batch Native 빌드 파이프라인
```

---

## 🔗 관련 문서

- 프로젝트 경로: `/Users/kimjin-wan/Works/devops/dentbird-solutions`
- 기술 스택: React, TypeScript, Electron, Playwright, NX, Jest, Azure DevOps, Datadog
