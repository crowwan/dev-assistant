# Dentbird Module Client Monorepo - 프로젝트 기여 분석

> **프로젝트**: DentBird Module Client (치과 CAD/CAM 마이크로 프론트엔드 모듈)
> **기간**: 2024.11 ~ 2025.07 (약 8개월)
> **역할**: Frontend Developer
> **기술 스택**: React, TypeScript, VTK.js, pnpm Monorepo, Module Federation
> **저장소**: dentbird-module-client-monorepo (Bitbucket -> Azure DevOps)

---

## 핵심 성과 요약

| 지표 | 수치 |
|------|------|
| **총 커밋** | 109개 (전체 412개 중 26.5%) |
| **Merged PR** | 7건 |
| **담당 모듈** | 5개 (explorer, export, viewer, setting, mobile) |
| **외부 연동** | 3개 서비스 (Medit, Shining 3D, Connect) |
| **코드 변경량** | +149,768 / -155,867 lines |
| **활동 기간** | 2024-11-21 ~ 2025-07-28 |

---

## 커밋 분석

### 유형별 분포

| 유형 | 커밋 수 | 비율 | 설명 |
|------|---------|------|------|
| **chore** (유지보수) | 28개 | 25.7% | 버전업, 환경변수, lock 파일 관리 |
| **fix** (버그 수정) | 27개 | 24.8% | 크리티컬 버그 수정, SDK 호환성 대응 |
| **release** (릴리즈 태그) | 23개 | 21.1% | 모듈별 버전 릴리즈 |
| **feat** (신규 기능) | 17개 | 15.6% | 외부 연동, 도메인 대응, 라이브러리 추가 |
| **merge** (PR 머지) | 7개 | 6.4% | Bitbucket/Azure DevOps PR 머지 |
| **기타** | 7개 | 6.4% | stash, index, squash 등 |

### 모듈별 분포

| 모듈 | 커밋 수 | 주요 작업 |
|------|---------|----------|
| **explorer-module** | 24개 | 케이스 탐색기, 외부 스캐너 연동, thumbnail SDK 전환 |
| **export-module** | 21개 | 내보내기 기능, Crown IO 관리, 인증 헤더 개선 |
| **viewer-module** | 10개 | 3D 뷰어, 케이스 정보 표시, File SDK 연동 |
| **setting-module** | 5개 | 설정 UI, 도메인 관리 |
| **mobile** | 2개 | 모바일 도메인 대응 |
| **공통** (SDK/패키지) | 26개 | pnpm 9 마이그레이션, axios 통일, File SDK 업그레이드 |

### 주제별 분포

| 주제 | 관련 커밋 수 | 비중 |
|------|------------|------|
| **SDK/패키지 관리** | 26개 | pnpm, axios, File API SDK |
| **도메인 전환** | 12개 | 서브 도메인 마이그레이션 |
| **외부 스캐너 연동** | 10개 | Medit, Shining 3D, Connect |

### 월별 활동 분포

```
2024-11 ████░░░░░░░░░░░░░░░░  7개  (프로젝트 시작, 초기 기능)
2024-12 ░░░░░░░░░░░░░░░░░░░░  1개  (setting unsaved modal)
2025-02 ░░░░░░░░░░░░░░░░░░░░  1개  (hyperDent health check)
2025-03 ████████████████████ 34개  (최고 활동 - 도메인 마이그레이션 + 외부 연동)
2025-04 ██████████░░░░░░░░░░ 11개  (SDK 버전업, QMS 환경)
2025-05 ████████████████░░░░ 14개  (pnpm 9, libarchive, institution)
2025-06 ██████████░░░░░░░░░░ 10개  (export designs 버전업, 도메인)
2025-07 ████████████████░░░░ 15개  (도메인 마무리, 버그 수정, 릴리즈)
```

---

## 주요 개발 내역

### 1. 외부 스캐너 연동 시스템 (3rd Party Integration)

**기간**: 2025.03 ~ 2025.05 | **관련 커밋**: 10개 | **역할**: 구현 전담

#### 배경
- Medit, Shining 3D 등 외부 치과 스캐너와의 데이터 연동 요구
- Legacy API 변경에 따른 호환성 대응 필요
- 크로스 도메인 인증 플로우 처리

#### 구현 상세

**Medit 스캐너 연동**
- Legacy API 변경 대응 (ab92fd7, a1fea0e)
- OAuth 콜백 페이지 redirect URL 처리 (c5e1263)
- 로그인 토큰 획득 방식 변경 (8a971b5)

**Shining 3D 연동**
- 자동 로그인 상태에서 로그아웃 클릭 시 로그인 창 미열림 버그 수정 (41962d1)
- QMS 환경변수 관리 체계화 (c19c8d0)

**Connect 도메인**
- Allow origin 설정 추가 (3c6f962, c1c2808)
- 크로스 도메인 API 요청 처리

#### 기술적 의의
- 3개 외부 서비스 API 통합으로 사용자가 단일 플랫폼에서 스캐너 데이터 활용 가능
- OAuth 인증 플로우 및 크로스 도메인 처리 경험 축적

---

### 2. 서브 도메인 마이그레이션 프로젝트

**기간**: 2025.06 ~ 2025.07 | **관련 커밋**: 12개 | **관련 PR**: #21245 | **역할**: 전체 모듈 동시 변경 담당

#### 배경
- 기존 도메인에서 dentbird 서브 도메인 체계로 전환 필요
- 5개 모듈에서 동시에 도메인 변경 대응 필요
- 환경별 (dev/qa/prod) 도메인 분기 처리

#### 구현 상세
- **explorer** - dentbird domain 추가 (64a2e93)
- **export** - dentbird domain 추가 (bdbeb51)
- **viewer** - dentbird domain 추가 (80a9d56)
- **setting** - dentbird domain 추가 (e934b4b)
- **mobile** - dentbird domain 추가 (762767f)
- milling 도메인 변경 (7c007de)
- 누락된 서브 도메인 추가 대응 (0cf6df8)
- Medit 콜백 redirect URL 레거시 유지 (c5e1263)

#### 성과
- 5개 모듈 동시 배포 성공
- 무중단 도메인 전환 완료
- 환경변수 기반 도메인 관리 체계 통일

---

### 3. SDK 및 패키지 버전 관리

**기간**: 2025.03 ~ 2025.06 | **관련 커밋**: 26개 | **역할**: 버전 업그레이드 전담

#### File API SDK 업그레이드
- Explorer thumbnail URL을 File Server에서 요청하도록 전환 (7f7ac59)
- Viewer 케이스 정보 용량을 File SDK로 계산 (40fdbbf)
- SDK 버전업에 따른 기존 코드 수정 (09df5a0, a3fd67d)
- axios 헤더에 access token 설정 방식 추가 (c4da63c, df46207, 77ff176)

#### pnpm 9 마이그레이션
- lock 파일 버전 9 포맷 변경 (7593012, 93e28a9, 33e299c, cedd58c)
- pnpm 8 버전 이상 사용하도록 엔진 제약 설정 (5e3a6c8, b2c9060, a3f88b5)
- 버전 9 사용 옵션 추가 (ec7a423, b1ae593, cc13402)

#### axios 버전 통일
- 전체 모듈 v1.7.8로 표준화 (7a1f2f5, 1f6acf2)
- QMS 환경 viewer axios 에러 수정 (8ea678f)

#### 기술적 의의
- 직접 API 호출에서 SDK 기반으로 전환하여 API 호출 효율성 향상
- 모노레포 전체 의존성 버전 통일로 빌드 안정성 확보

---

### 4. 주요 버그 수정 (Critical Fixes)

**기간**: 2024.11 ~ 2025.07 | **관련 커밋**: 27개

#### 케이스 관리
- **[DEN-4087]** 작업 중인 사용자가 있을 때 delete 버튼 비활성화 (72a07d2)
- Explorer 케이스 리스트 thumbnail URL 누락 시 에러 처리 (e91c7fe)
- Explorer batch 여부 확인을 platform 필드로 변경 (fdf88bb)
- Explorer institution list 수정 (217e0af)

#### 모듈 UI
- **[CRWN-2562]** opener 솔루션별 리스트 표시 문제 해결 (a8387e0)
- opener 리다이렉트 하지 않는 경우 모듈 닫도록 변경 (b5f22b9)
- Setting unsaved modal 변경 사항 감지 (259f9a2)
- filebucket set host 추가 (9109e07)

#### 인증/인프라
- Medit import 시 data가 있을 때 onImportSuccess 실행되도록 변경 (2c7405c)
- hyperDent health check API 수정 (580e6bb)
- QMS 환경 viewer axios 에러 수정 (8ea678f)

---

### 5. 인프라 및 빌드 개선

**기간**: 2024.11 ~ 2025.07

#### 라이브러리 통합
- Explorer 모듈에 libarchive(파일 압축) 라이브러리 추가 (a2edcad, b1185c1, 1b9fd63)

#### 환경변수 관리
- QMS 환경변수 분리 (.env 추가) (81da5ff)
- Shining 3D 환경별 설정 (c19c8d0)

#### 패키지 관리
- Export Designs 라이브러리 지속적 버전업 (6회)
- Crown IO 버전업 및 제거 (35b7c1b, f4494eb)
- pnpm lock 파일 관리 및 최적화

---

### 6. 릴리즈 관리

전체 23개 릴리즈 태그 생성으로 모듈별 버전 관리를 수행함.

| 모듈 | 릴리즈 버전 범위 | 릴리즈 수 |
|------|----------------|----------|
| **explorer-module** | v1.0.3 ~ v1.0.7-0 | 7개 |
| **export-module** | v1.1.0 ~ v1.1.2-3 | 8개 |
| **viewer-module** | v1.0.3 ~ v1.0.5-1 | 5개 |
| **setting-module** | v1.0.1 ~ v1.0.2-0 | 3개 |

---

## PR 목록

| PR | 제목 | 날짜 | 소스 |
|----|------|------|------|
| #7 | storage-usage 계산 방식 수정 | 2025-03-06 | Bitbucket |
| #8 | explorer login 문제 수정 | 2025-03-06 | Bitbucket |
| #9 | file-sdk 사용해서 thumbnail 보여주도록 변경 | 2025-03-06 | Bitbucket |
| #10 | explorer 허용 도메인에 connect 추가 | 2025-03-25 | Bitbucket |
| #21245 | sub-domain 변경 대응 | 2025-07-10 | Azure DevOps |
| #21685 | [DEN-4087] 작업 중인 사용자 delete 버튼 비활성화 | 2025-07-24 | Azure DevOps |
| #21835 | [CRWN-2562] opener 솔루션별 리스트 표시 수정 | 2025-07-28 | Azure DevOps |

---

## 기술 스택 상세

### Frontend Core
- **Framework**: React 18
- **Language**: TypeScript
- **3D Graphics**: VTK.js (치과 3D 모델 뷰어)
- **Build**: pnpm Monorepo
- **Architecture**: Micro Frontend, Module Federation

### External Integration
- **Medit**: 치과 스캐너 API 연동, OAuth 콜백 처리
- **Shining 3D**: 3D 스캐너 연동, 자동 로그인 처리
- **Connect**: 크로스 도메인 인증

### DevOps
- **Package Manager**: pnpm 8 -> 9 마이그레이션
- **HTTP Client**: axios v1.7.8 (전체 모듈 통일)
- **SDK**: Dentbird File API SDK
- **환경**: QMS, dev/qa/prod 다중 환경 관리

---

## 핵심 역량 (이 프로젝트에서 증명)

### 1. 마이크로 프론트엔드 운영 경험
- 5개 독립 모듈(explorer, export, viewer, setting, mobile) 동시 유지보수
- Module Federation 기반 아키텍처 이해 및 모듈 간 의존성 관리
- 모듈별 독립 릴리즈 체계 운영 (23개 릴리즈 태그)

### 2. 외부 서비스 연동
- 3개 외부 치과 스캐너 서비스 API 통합
- OAuth 인증 플로우 구현 및 크로스 도메인 처리
- Legacy API 변경에 대한 호환성 대응

### 3. 대규모 마이그레이션 수행
- 서브 도메인 전환 (5개 모듈 무중단 동시 배포)
- pnpm 9 마이그레이션 (lock 파일 포맷 + 엔진 제약 설정)
- File API SDK 전환 (직접 호출 -> SDK 기반)

### 4. 패키지/의존성 표준화
- axios v1.7.8 전체 모듈 통일
- Export Designs, Crown IO 등 내부 라이브러리 지속 관리
- 27개 버그 수정으로 플랫폼 안정성 기여

---

## 경력기술서 예시

```
[프로젝트명] DentBird Module Client - 마이크로 프론트엔드 모노레포
[기간] 2024.11 ~ 2025.07 (8개월)
[역할] 프론트엔드 개발
[기술] React, TypeScript, VTK.js, pnpm Monorepo, Module Federation

[담당 업무]
- 5개 마이크로 프론트엔드 모듈(explorer, export, viewer, setting, mobile) 유지보수 및 기능 개발
- 외부 치과 스캐너 3개 서비스(Medit, Shining 3D, Connect) API 통합 및 OAuth 인증 플로우 구현
- 서브 도메인 마이그레이션 수행 (5개 모듈 동시 도메인 변경 및 무중단 배포)
- File API SDK 전환, pnpm 9 마이그레이션, axios v1.7.8 전체 모듈 표준화

[성과]
- 109개 커밋, 7개 PR 머지로 8개월간 지속적 기여 (전체 저장소의 26.5%)
- 외부 스캐너 3개 서비스 연동으로 사용자 워크플로우 통합
- 서브 도메인 마이그레이션 5개 모듈 무중단 전환 성공
- 23개 릴리즈 태그 관리, 27개 버그 수정으로 플랫폼 안정성 기여
```

---

## 이력서 한줄 요약

> 치과 CAD/CAM 웹 플랫폼 마이크로 프론트엔드 모노레포에서 5개 모듈(explorer, export, viewer, setting, mobile) 개발 및 외부 스캐너(Medit, Shining 3D, Connect) 연동 기능 구현 - 109 커밋, 7 PR, 23 릴리즈

---

**마지막 업데이트**: 2026-02-10
**분석 기준**: Git commit history (jwkim@imagoworks.ai) 기반 전체 커밋 분석
