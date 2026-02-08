# Landing Page Backoffice Client 프로젝트 기여 분석

> 작성일: 2026-02-06
> 분석 기간: 2023.12.07 ~ 2023.12.13 (약 1주)

---

## 📌 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **프로젝트명** | Landing Page Backoffice Client |
| **회사** | ImagoWorks (이마고웍스) |
| **역할** | Frontend Developer |
| **기술 스택** | React 17, MUI 5, React Query, React Hook Form, Axios, Emotion |
| **배포 환경** | Azure DevOps Pipeline |

---

## 📊 기여 통계

| 지표 | 수치 |
|------|------|
| **총 커밋 수** | 53개 |
| **코드 추가** | +1,871줄 |
| **코드 삭제** | -746줄 |
| **변경 파일** | 89개 |
| **Merged PR** | 6개 |

### 커밋 유형별 분포

| 유형 | 커밋 수 | 비율 |
|------|--------|------|
| feat (기능 추가) | 24 | 45% |
| fix (버그 수정) | 16 | 30% |
| refactor (리팩토링) | 5 | 10% |
| chore/merge | 8 | 15% |

---

## 🏆 주요 성과

### 1. Company 페이지 조직 관리 시스템 구축 [LANDING-129]

**기간**: 2023.12.07 ~ 2023.12.13
**역할**: 설계 및 구현 전담

#### 문제 상황
- 기존 Members 페이지가 단순 리스트 형태로 조직 구조 표현 불가
- Groups, Teams, Members 3계층 조직 관리 기능 필요
- 각 계층별 CRUD 기능 및 리더 지정 기능 요구

#### 해결 방안
- **3계층 조직 구조 설계**: Groups → Teams → Members 계층형 데이터 모델
- **React Query 캐시 전략**: 계층별 쿼리 키 관리 및 무효화 전략 수립
- **FormDialog 패턴 적용**: 재사용 가능한 생성/수정 다이얼로그 컴포넌트

#### 구현 상세
```yaml
Groups 관리:
  - Groups Section UI 구현
  - Group 생성/수정 Dialog 컴포넌트
  - Group Leader 지정 기능
  - Group 순서 변경 기능

Teams 관리:
  - Teams Section UI 구현
  - Team 생성/수정 Dialog 컴포넌트
  - Team Leader 이미지 표시
  - 상위 Group 선택 연동
  - Team 순서 변경 기능 (groupId 기반)

Members 관리:
  - Members Section UI 구현
  - Member 생성/수정 Dialog 컴포넌트
  - Member Autocomplete 검색 (이미지/정보 포함)
  - Group/Team 계층 선택 (상위 선택 시 하위 필터링)
  - Department Tag 관리

API 연동:
  - groups, teams, members API 모듈 구현
  - React Query hooks 생성
  - invalidate key 체계 통합 (IMAGO_KEY)
  - axios config 기반 params 전달 방식 적용
```

#### 기술 스택
`React` `MUI` `React Query` `React Hook Form` `Axios`

---

### 2. API 아키텍처 설계 및 구현

**기간**: 2023.12.07 ~ 2023.12.08

#### 문제 상황
- 신규 조직 관리 API 연동 필요
- 기존 API 구조와 일관성 유지 필요
- Query Key 관리 체계 정립 필요

#### 해결 방안
- **API 모듈 분리**: groups, teams, members 각각 독립 모듈로 구현
- **일관된 Query Key**: IMAGO_KEY 기반 통합 키 관리
- **axios config 패턴**: 문자열 대신 config 객체로 params 전달

#### 구현 상세
```yaml
API 모듈 (src/api/):
  - groups.js: CRUD + 순서 변경 API
  - teams.js: CRUD + 순서 변경 API
  - members.js: CRUD API

상수 정의:
  - apiUrl.js: groups, teams, members API 경로 추가
  - queryKey.js: IMAGO_KEY 통합 쿼리 키 추가

PropTypes:
  - propTypes.js: 3계층 데이터 타입 정의
```

#### 기술 스택
`Axios` `React Query` `PropTypes`

---

### 3. FormDialog UI/UX 개선

**기간**: 2023.12.07 ~ 2023.12.12

#### 문제 상황
- 각 계층별 생성/수정 폼의 일관성 필요
- 계층 연동 시 하위 필드 비활성화 처리 필요
- 리더 선택 UI/UX 개선 필요

#### 해결 방안
- **계층적 필드 연동**: 상위 필드 미선택 시 하위 필드 disable
- **Autocomplete 개선**: 멤버 이미지와 정보 함께 표시
- **로딩 상태 처리**: dialog open 시 필요 데이터만 호출

#### 구현 상세
```yaml
GroupFormDialog:
  - Group 생성/수정 폼
  - Group Leader Autocomplete

TeamFormDialog:
  - Team 생성/수정 폼
  - Team Leader 이미지 표시
  - Group 선택 연동

MemberFormDialog:
  - Member 생성/수정 폼
  - Group → Team 계층 선택
  - 상위 미선택 시 하위 disable
  - newDepartmentTag 필드 처리
```

#### 기술 스택
`React Hook Form` `MUI Autocomplete` `MUI Dialog`

---

### 4. News/Recruit Tag 관리 기능 추가

**기간**: 2023.12.08

#### 구현 상세
```yaml
News Tag:
  - 소문자 Tag 표시 가능하도록 변경
  - 소문자 Tag 전송 가능하도록 변경

Recruit:
  - Recruit Tag/Affiliation 수정 모달 구현
  - EditTagDialog 컴포넌트 추가
```

---

## 📋 버그 수정 및 개선

### 주요 버그 수정
```yaml
Team 관련:
  - team 업데이트 시 _id 쿼리 파라미터 누락 수정
  - Team leader 이미지 CSS 수정
  - Edit team 모달 에러 제거

Member 관련:
  - 멤버 수정 시 이미지 변경 안해도 요청 보낼 수 있게 수정
  - 이름에 대문자로 group, team 포함 시 replace 안되는 문제 수정
  - member dialog typo 수정

Group/Team 리더:
  - 그룹/팀 선택 시 leader 정보 받아오지 못하는 문제 수정
  - 그룹/팀 리더가 없을 때 스타일 수정

API/데이터:
  - photo_url → photo 필드명 통일
  - members api path 변경
  - isEdit 시 초기값 없는 문제 수정
  - group field required로 변경
  - payload에 groupId 안 담기는 문제 해결
```

### 코드 품질 개선
```yaml
리팩토링:
  - api 요청 시 params를 axios config로 변경
  - get api를 dialog로 이동 (컴포넌트 책임 분리)
  - Member의 Groups, Teams, Members 각 컴포넌트 UI 변경
  - get-imago 사용으로 데이터 요청 최적화

코드 컨벤션:
  - 컨벤션에 맞게 코드 수정
  - 백틱 제거
  - key props 추가
  - PropTypes 추가
```

---

## 📁 주요 변경 파일

### 가장 많이 수정한 파일 TOP 10
| 순위 | 파일 | 수정 횟수 |
|------|------|----------|
| 1 | src/compositions/members/MemberFormDialog.js | 11회 |
| 2 | src/compositions/members/TeamFormDialog.js | 10회 |
| 3 | src/compositions/members/GroupFormDialog.js | 9회 |
| 4 | src/compositions/members/Teams.js | 8회 |
| 5 | src/compositions/members/Members.js | 6회 |
| 6 | src/api/teams.js | 6회 |
| 7 | src/api/members.js | 6회 |
| 8 | src/types/propTypes.js | 5회 |
| 9 | src/compositions/members/Groups.js | 5회 |
| 10 | src/api/groups.js | 5회 |

---

## 🛠️ 기술적 도전 및 해결

### 1. 계층형 데이터 연동

**문제**: Groups → Teams → Members 3계층 데이터 연동 시 상위 선택에 따른 하위 필터링 및 비활성화 처리

**해결**:
- 상위 필드 선택 상태 watch
- 하위 필드 disabled 상태 동적 제어
- React Query로 계층별 데이터 캐싱

### 2. 순서 변경 기능의 groupId 전달

**문제**: 순서 변경 mutation에서 groupId가 필요하지만 기존 훅에서 지원하지 않음

**해결**:
- mutation 훅 수정하여 groupId 파라미터 추가
- 호출부에서 groupId 전달하도록 변경

### 3. 대소문자 혼용 이름 처리

**문제**: 이름에 대문자로 "Group", "Team" 포함 시 replace가 안되는 문제

**해결**:
- 정규식 패턴 수정으로 대소문자 구분 없이 처리

---

## 📈 기술 스택 상세

### Frontend Core
- **Framework**: React 17
- **Language**: JavaScript (PropTypes)
- **상태 관리**: React Query
- **UI Library**: MUI v5
- **스타일링**: Emotion
- **폼 관리**: React Hook Form
- **HTTP Client**: Axios

### DevOps
- **CI/CD**: Azure DevOps Pipeline
- **버전 관리**: Git (Bitbucket)

---

## 🏆 핵심 역량 (이 프로젝트에서 증명)

### 1. 계층형 데이터 모델 설계
- Groups → Teams → Members 3계층 조직 구조 설계 및 구현
- 계층 간 연동 로직 및 UI 상태 관리

### 2. 재사용 가능한 컴포넌트 설계
- FormDialog 패턴으로 생성/수정 로직 통합
- PropTypes 기반 타입 안정성 확보

### 3. React Query 활용
- 계층별 쿼리 키 관리 전략
- 캐시 무효화 및 데이터 동기화

### 4. API 아키텍처 설계
- 일관된 API 모듈 구조
- axios config 기반 파라미터 전달 패턴

---

## 📝 이력서 한줄 요약

> 랜딩 페이지 백오피스 조직 관리 시스템(Groups/Teams/Members) 전체 설계 및 구현, 1주 53커밋으로 3계층 CRUD 기능 개발

---

## 📝 경력기술서 예시

```
[프로젝트명] Landing Page Backoffice - 기업 랜딩 페이지 관리 시스템
[기간] 2023.12 (1주)
[역할] 프론트엔드 개발
[기술] React 17, MUI 5, React Query, React Hook Form, Axios

[담당 업무]
• Company 페이지 조직 관리 시스템 구축 [LANDING-129]
  - Groups, Teams, Members 3계층 조직 구조 설계 및 구현
  - 각 계층별 CRUD Dialog 컴포넌트 개발 (9개 컴포넌트)
  - 리더 지정, 순서 변경, 계층 연동 기능 구현
• API 아키텍처 설계 및 구현
  - groups, teams, members API 모듈 분리 설계
  - React Query 기반 캐시 전략 및 쿼리 키 관리 체계 구축
• FormDialog UI/UX 개선
  - 계층적 필드 연동 (상위 미선택 시 하위 disable)
  - Autocomplete 개선 (멤버 이미지/정보 표시)
• 버그 수정 및 코드 품질 개선
  - 16건 버그 수정
  - axios config 패턴 적용, 컴포넌트 책임 분리 리팩토링

[성과]
• 53 커밋, +1,871줄로 조직 관리 기능 전체 구현
• 9개 신규 컴포넌트, 3개 API 모듈 개발
• 3계층 조직 구조 관리 시스템 완성
```

---

## 📅 활동 타임라인

```
2023.12.07 ─────────────────────────────────────────────────────
           │ 프로젝트 시작
           │ Groups, Teams, Members API 및 Query Key 추가
           │ Groups, Teams Section 컴포넌트 구현
           │ FormDialog 컴포넌트 기본 구현
           │
2023.12.08 ─────────────────────────────────────────────────────
           │ get-imago API 추가
           │ 순서 변경 기능 구현
           │ News/Recruit Tag 기능 추가
           │ PropTypes 정의
           │
2023.12.11 ─────────────────────────────────────────────────────
           │ FormDialog 개선 (계층 연동, 로딩 상태)
           │ API 요청 방식 리팩토링 (axios config)
           │
2023.12.12 ─────────────────────────────────────────────────────
           │ Autocomplete 개선 (이미지/정보 표시)
           │ 코드 컨벤션 정리
           │ 버그 수정 (리더 정보, 스타일)
           │ QA v1.1.8-0 릴리즈
           │
2023.12.13 ─────────────────────────────────────────────────────
           │ 최종 버그 수정
           │ team 업데이트 시 _id 파라미터 수정
           │ 멤버 수정 관련 버그 수정
           │ v1.1.8-1 릴리즈
```

---

## 🔗 관련 문서

- 프로젝트 경로: `/Users/kimjin-wan/Works/workspace/landing-page-bo-client`
- 관련 프로젝트: Landing Page Client (프론트엔드)
- 기술 스택: React, MUI, React Query, Azure DevOps

---

**마지막 업데이트**: 2026-02-06
**분석 기준**: Git commit history (jwkim@imagoworks.ai)
