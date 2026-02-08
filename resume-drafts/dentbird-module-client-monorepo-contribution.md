# Dentbird Module Client Monorepo - 프로젝트 기여 분석

> **프로젝트**: DentBird Module Client (치과 CAD/CAM 마이크로 프론트엔드 모듈)
> **기간**: 2024.11 ~ 2025.07 (약 8개월)
> **역할**: Frontend Developer
> **기술 스택**: React, TypeScript, VTK.js, pnpm Monorepo, Module Federation

---

## 🎯 핵심 성과 요약

| 지표 | 성과 |
|------|------|
| **총 커밋** | 109개 |
| **Merged PR** | 7개 |
| **담당 모듈** | 5개 (explorer, export, viewer, setting, mobile) |
| **외부 연동** | 3개 서비스 (Medit, Shining 3D, Connect) |
| **코드 변경량** | +149,768 / -155,867 lines |

---

## 📊 커밋 유형별 분포

| 유형 | 커밋 수 | 비율 |
|------|---------|------|
| **chore** (유지보수) | 28개 | 42% |
| **fix** (버그 수정) | 22개 | 33% |
| **feat** (신규 기능) | 16개 | 24% |

---

## 📁 모듈별 기여

| 모듈 | 커밋 수 | 주요 작업 |
|------|---------|----------|
| **explorer-module** | 24개 | 케이스 탐색기, 외부 스캐너 연동 |
| **export-module** | 22개 | 내보내기 기능, Crown IO 관리 |
| **viewer-module** | 10개 | 3D 뷰어, 케이스 정보 표시 |
| **setting-module** | 5개 | 설정 UI, 도메인 관리 |
| **mobile** | 2개 | 모바일 도메인 대응 |

---

## 🚀 주요 개발 내역

### 1. 외부 스캐너 연동 시스템 (3rd Party Integration)

**기간**: 2025.03 ~ 2025.05
**역할**: 구현 전담

#### 문제 상황
- Medit, Shining 3D 등 외부 치과 스캐너와 연동 필요
- Legacy API 변경에 따른 대응 필요
- 크로스 도메인 인증 플로우 처리

#### 해결 방안
- **Medit 스캐너 연동**: Legacy API 변경 대응, 로그인/콜백 처리 구현
- **Shining 3D 연동**: 자동 로그인 버그 수정, 환경변수 관리 체계화
- **Connect 도메인**: Allow origin 설정, 크로스 도메인 대응

#### 구현 상세
```yaml
Medit 연동:
  - Legacy API 변경 대응
  - OAuth 콜백 페이지 redirect URL 처리
  - 환경별 도메인 분기 처리

Shining 3D 연동:
  - 자동 로그인 버그 수정
  - QMS 환경변수 관리
  - 인증 플로우 안정화

Connect 도메인:
  - Allow origin 설정 추가
  - 크로스 도메인 API 요청 처리
```

#### 기술 스택
`React` `TypeScript` `OAuth` `Cross-Origin`

---

### 2. 서브 도메인 마이그레이션 프로젝트

**기간**: 2025.03
**역할**: 전체 모듈 동시 변경 담당
**관련 PR**: #21245

#### 문제 상황
- 기존 도메인에서 서브 도메인 체계로 전환 필요
- 5개 모듈에서 동시에 도메인 변경 대응 필요
- 환경별 (dev/qa/prod) 도메인 분기 처리

#### 해결 방안
- 전체 모듈 (explorer, export, viewer, setting, mobile) 도메인 변경
- 환경변수 기반 도메인 관리 체계 구축
- 누락된 부분 추가 대응

#### 구현 상세
```yaml
도메인 변경:
  - dentbird 서브 도메인 전환
  - mobile 도메인 변경 대응
  - milling 도메인 변경 대응
  - 누락된 서브 도메인 추가

환경 관리:
  - dev/qa/prod 환경별 분기
  - 환경변수 기반 설정 통일
```

#### 성과
- 5개 모듈 동시 배포 성공
- 무중단 도메인 전환 완료

---

### 3. SDK 및 패키지 버전 관리

**기간**: 2025.04 ~ 2025.06
**역할**: 버전 업그레이드 전담

#### 문제 상황
- File API SDK 버전 업그레이드 필요
- pnpm 9 마이그레이션으로 lock 파일 포맷 변경
- axios 버전 불일치로 인한 호환성 문제

#### 해결 방안
- **File API SDK**: 버전업 대응 및 axios 헤더 설정 방식 개선
- **pnpm 9 마이그레이션**: lock 파일 포맷 변경, 버전 요구사항 설정
- **axios 버전 통일**: v1.7.8로 표준화

#### 구현 상세
```yaml
File API SDK:
  - SDK 버전업 대응
  - axios 헤더 설정 방식 개선
  - 인증 헤더 아키텍처 정리

pnpm 9:
  - lockfile 포맷 변경 대응
  - 버전 요구사항 설정 (package.json)
  - 의존성 정리

axios:
  - 전체 모듈 v1.7.8 통일
  - 공통 인스턴스 관리
```

#### 기술 스택
`pnpm` `axios` `SDK Integration`

---

### 4. 주요 버그 수정 (Critical Fixes)

**기간**: 2025.03 ~ 2025.07
**역할**: 버그 수정 및 품질 개선

#### 수정 내역
```yaml
케이스 관리:
  - "[DEN-4087]" 작업 중인 사용자가 있을 때 delete 버튼 비활성화
  - Explorer 케이스 리스트 thumbnail URL 누락 시 에러 처리
  - NC 단일 선택 불가 로직 추가

모듈 UI:
  - "[CRWN-2562]" opener 솔루션별 리스트 표시 문제 해결
  - opener 리다이렉트 하지 않는 경우 모듈 닫도록 변경
  - Setting unsaved modal 변경 사항 감지

Export 기능:
  - Export to CAM menu disabled 조건 수정
  - imported만 선택 시 export 비활성화 처리
  - getIsDeductable 조건 수정
```

---

### 5. 인프라 및 빌드 개선

**기간**: 2024.11 ~ 2025.07
**역할**: 빌드 환경 개선

#### 구현 상세
```yaml
라이브러리 통합:
  - libarchive Explorer 모듈 통합 (파일 압축)
  - 패키지 버전 업그레이드 관리

환경변수 관리:
  - QMS 환경변수 분리
  - Shining 3D 환경별 설정
  - 도메인별 환경 분기

빌드 개선:
  - pnpm-lock.yaml 최적화
  - 불필요한 의존성 정리
```

---

## 📅 월별 활동 분포

```
2024-11 ████░░░░░░░░░░░░░░░░  7개
2024-12 ░░░░░░░░░░░░░░░░░░░░  1개
2025-02 ░░░░░░░░░░░░░░░░░░░░  1개
2025-03 ████████████████████ 34개 (최고 활동 - 도메인 마이그레이션)
2025-04 ██████████░░░░░░░░░░ 11개
2025-05 ████████████████░░░░ 14개
2025-06 ██████████░░░░░░░░░░ 10개
2025-07 ████████████████░░░░ 15개
```

---

## 📈 기술 스택 상세

### Frontend Core
- **Framework**: React 18
- **Language**: TypeScript
- **3D Graphics**: VTK.js (3D 모델 뷰어)
- **Build**: pnpm Monorepo
- **Architecture**: Micro Frontend, Module Federation

### External Integration
- **Medit**: 치과 스캐너 API 연동
- **Shining 3D**: 3D 스캐너 연동
- **Connect**: 크로스 도메인 인증

### DevOps
- **Package Manager**: pnpm 9
- **HTTP Client**: axios v1.7.8
- **SDK**: File API SDK

---

## 🏆 핵심 역량 (이 프로젝트에서 증명)

### 1. 마이크로 프론트엔드 개발 경험
- 5개 독립 모듈 동시 유지보수
- Module Federation 기반 아키텍처 이해
- 모듈 간 의존성 관리

### 2. 외부 서비스 연동
- 3개 외부 스캐너 서비스 API 통합
- OAuth 인증 플로우 구현
- 크로스 도메인 처리

### 3. 대규모 마이그레이션 수행
- 서브 도메인 전환 (5개 모듈 동시 배포)
- pnpm 9 마이그레이션
- SDK 버전 업그레이드 관리

### 4. 품질 관리
- 22개 버그 수정 (Critical 포함)
- 환경별 설정 분리
- 패키지 버전 표준화

---

## 📝 이력서 한줄 요약

> 치과 CAD/CAM 웹 플랫폼 마이크로 프론트엔드 모노레포에서 5개 모듈 개발 및 외부 스캐너(Medit, Shining 3D) 연동 기능 구현 - 109 커밋, 7 PR

---

## 📝 경력기술서 예시

```
[프로젝트명] DentBird Module Client - 마이크로 프론트엔드 모노레포
[기간] 2024.11 ~ 2025.07 (8개월)
[역할] 프론트엔드 개발
[기술] React, TypeScript, VTK.js, pnpm Monorepo, Module Federation

[담당 업무]
• 5개 마이크로 프론트엔드 모듈 유지보수 및 기능 개발
  - explorer, export, viewer, setting, mobile 모듈 담당
• 외부 스캐너 연동 기능 개발
  - Medit, Shining 3D API 통합 및 OAuth 인증 플로우 구현
• 서브 도메인 마이그레이션 프로젝트 수행
  - 5개 모듈 동시 도메인 변경 및 무중단 배포
• SDK 버전 관리 및 패키지 표준화
  - File API SDK 업그레이드, pnpm 9 마이그레이션, axios v1.7.8 통일

[성과]
• 109개 커밋, 7개 PR 머지로 8개월간 지속적 기여
• 외부 스캐너 3개 서비스 연동으로 사용자 워크플로우 통합
• 서브 도메인 마이그레이션 성공 (5개 모듈 무중단 전환)
```

---

**마지막 업데이트**: 2026-02-06
**분석 기준**: Git commit history (jwkim@imagoworks.ai)
