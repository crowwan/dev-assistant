# DentBird Account Client - 프로젝트 성과

> **프로젝트**: DentBird Account (B2B SaaS 계정/구독 관리 시스템)
> **기간**: 2023.09 ~ 2025.07 (1년 10개월)
> **역할**: Frontend Developer (전담 개발)
> **기술 스택**: React 18, TypeScript, TanStack Query, MUI, i18next, MSW, Jest

---

## 🎯 핵심 성과 요약

| 지표 | 성과 |
|------|------|
| **총 커밋** | 160+ 커밋 |
| **기능 개발** | SaaS 구독 시스템 전체 설계 및 구현 |
| **시스템 전환** | Seats → Members 시스템 리팩토링 |
| **국제화** | 다국어 지원 (i18n) 전체 적용 |
| **테스트 환경** | Jest + MSW 기반 테스트 인프라 구축 |

---

## 🚀 주요 개발 내역

### 1. SaaS 구독 관리 시스템 구축 (핵심 성과)

**기간**: 2024.01 ~ 2024.06
**역할**: 설계 및 구현 전담

#### 문제 상황
- 신규 SaaS 구독 모델 도입 필요
- 복잡한 과금 로직 (일할 계산, 추가 시트 구매)
- 다양한 결제 상태 관리 필요

#### 해결 방안
- **플랜 관리 시스템**: Free Plan / Paid Plan 상태 관리 및 UI 구현
- **추가 시트 구매**: 일할 계산 로직 구현, 가격 계산식 UI
- **결제 연동**: PostMessage 기반 Payment 페이지 연동, Ping-back 구현
- **상태 관리**: 구독 취소/재개(Resume), 환불 요청 플로우

#### 구현 상세
```yaml
구독 플랜:
  - Free Plan UI/UX 구현
  - Paid Plan 상태별 화면 분기
  - Plan Upgrade Dialogue 구현
  - Activate Plan Dialogue 구현

추가 시트 구매:
  - Additional Seats UI 구현
  - 일할 계산 로직 (Pro-rata calculation)
  - 가격 계산식 UI (View Details)
  - Purchase Estimate API 연동
  - Add Seats Buy API 연동

결제 시스템:
  - Payment Method 관리 구현
  - Billing Type Dialogue 구현
  - Payment Failed 재시도 버튼
  - View Credit History 구현

구독 취소/재개:
  - 취소 사유 선택 UI
  - Other reason 200자 제한 처리
  - Resume 버튼 기능 구현
  - Subscription 페이지 리다이렉트

쿠폰:
  - Coupon Input UI 구현
  - Coupon Information Dialogue
  - 쿠폰 테스트 스펙 작성
```

#### 기술 스택
`React` `TypeScript` `TanStack Query` `MUI` `react-hook-form`

---

### 2. 팀 멤버 관리 시스템

**기간**: 2023.12 ~ 2024.03
**역할**: 설계 및 구현 전담

#### 문제 상황
- 기존 Seats 기반 시스템에서 Members 시스템으로 전환 필요
- 멤버 초대 시 다양한 엣지 케이스 처리 필요
- 권한별 UI 분기 로직 복잡

#### 해결 방안
- **시스템 전환**: Seats → Members 네이밍 및 로직 전환
- **멤버 초대**: 이메일 검증, 다른 지역 유저 초대 처리
- **권한 관리**: Owner 표시, Dealership 유저 처리

#### 구현 상세
```yaml
시스템 리팩토링:
  - Seats → Members 시스템 전환
  - Member API 변경 대응
  - Seat Counter 리팩토링
  - Seats List Refactoring

멤버 초대:
  - Invite User 구현
  - 이메일 필드 입력 규칙 검증
  - 다른 지역 유저 초대 처리
  - 멤버 초대 에러 처리

Member List UI:
  - Member List UI 구현 및 변경
  - Owner 표시 기능 추가
  - List Divider 구현
  - List Header 구현
```

#### 기술 스택
`React` `TypeScript` `TanStack Query` `react-hook-form`

---

### 3. OAuth 회원가입 플로우 개선

**기간**: 2023.09 ~ 2023.11
**역할**: 구현 전담

#### 문제 상황
- 글로벌 서비스를 위한 Storage Region 선택 필요
- OAuth 플로우에 추가 단계 삽입 필요
- 다양한 유효성 검증 처리

#### 해결 방안
- **Storage Location 선택**: 글로벌 리전 선택 UI 추가
- **플로우 개선**: OAuth 회원가입 후 Storage 선택 단계 삽입
- **MFA 인증**: MFA Verification 모달 구현

#### 구현 상세
```yaml
Storage Location:
  - Storage Region 정보 요청 API 연동
  - Storage 지역 선택 페이지 구현
  - 유효성 검증 rule 추가
  - '(Recommended)' 표시 로직

OAuth 개선:
  - OAuth 회원가입 플로우에 Storage Location 추가
  - loginToken payload 추가 대응
  - 회원가입 기능 컴포넌트 분리

MFA 인증:
  - MFA Verification 모달 구현
  - 비밀번호 변경 기능 (데스크톱/모바일)
  - Password Tooltip 추가
```

#### 기술 스택
`React` `TypeScript` `OAuth` `react-hook-form`

---

### 4. 워크스페이스 관리 시스템

**기간**: 2024.02 ~ 2024.05
**역할**: 구현 전담

#### 구현 상세
```yaml
워크스페이스:
  - Workspace ID 기반 API 요청 구조 설계
  - Workspace 이름 입력 규칙 변경
  - 초대된 Workspace 관리
  - Workspace Default Value 처리

버그 수정:
  - 초대된 워크스페이스명 공란 저장 문제
  - Workspace 관련 UI 버그 수정
```

---

### 5. 반응형 UI/UX 시스템 구축

**기간**: 2023.11 ~ 2024.01
**역할**: 설계 및 구현 전담

#### 문제 상황
- 모바일/태블릿 대응 필요
- 반응형 브레이크포인트 정의 필요
- 네비게이션 구조 개선 필요

#### 해결 방안
- **반응형 시스템**: 브레이크포인트 변경 및 컨테이너 너비 조정
- **모바일 UI**: Mobile Header, Page Wrapper 구현
- **네비게이션**: SNB (Side Navigation Bar) 구현

#### 구현 상세
```yaml
반응형:
  - 반응형 Break Point 변경
  - 반응형 컨테이너 너비 변경
  - Tablet Responsive Hook 구현
  - 특정 Viewport 사이즈 UI 대응

모바일:
  - Mobile Header 구현
  - Mobile Header Title i18n 적용
  - 모바일 아이콘 제거 및 Page Wrapper 추가
  - Mobile Change Password Page 추가

네비게이션:
  - SNB 구현
  - 폴더 구조 설정
  - 라우터 구조 설계
```

#### 기술 스택
`React` `styled-components` `MUI` `반응형 디자인`

---

### 6. 국제화(i18n) 적용

**기간**: 2024.03 ~ 2024.05
**역할**: 구현 전담

#### 구현 상세
```yaml
i18n 적용:
  - Members 페이지 i18n 적용
  - Layout 요소 i18n 적용
  - Member의 이전 활동 시간 i18n 적용
  - Mobile Header Title i18n 적용
  - Cloud Mobile i18n 파일 정리
```

#### 기술 스택
`i18next` `react-i18next`

---

### 7. 테스트 환경 구축

**기간**: 2024.01 ~ 2024.04
**역할**: 설계 및 구현 전담

#### 문제 상황
- 테스트 환경 부재
- Mock API 필요
- 테스트 코드 작성 기반 필요

#### 해결 방안
- **Jest 환경 구축**: 설정 및 추가 세팅
- **MSW 도입**: Mock Service Worker 핸들러 구현
- **테스트 작성**: 주요 페이지 테스트 코드 작성

#### 구현 상세
```yaml
테스트 환경:
  - Jest 추가 세팅
  - MSW Handler에 passthrough 추가
  - Seat 관련 Mock Server 구현
  - MyPlan Mock API 구현

테스트 코드:
  - My Plan 테스트 코드 작성
  - Subscription Page 테스트 코드 수정
  - Members Page 테스트 코드 작성
  - Add Seats 동작 구현 및 테스트 작성
  - Coupon 테스트 스펙 작성
```

#### 기술 스택
`Jest` `MSW` `Testing Library`

---

## 📊 버그 수정 및 개선 (주요 항목)

```yaml
결제/구독:
  - Payment History 해지 사유 200자 제한
  - 구독 취소 시 Subscription 화면 리다이렉트
  - 시트 추가 시 팝업 닫히면 버튼 로딩 상태 유지 문제
  - Free Trial 기간 중 추가 시트 구매 불가 처리
  - Processing 상태에서 무한 폴링 수정
  - Remaining Days 0인 경우 계산식 처리

멤버:
  - Dealership 유저 Members 화면 진입 처리
  - Members 페이지 진입 상태에서 다른 워크스페이스 처리
  - Additional Seats 필드 처리

인증/계정:
  - 회원 가입 시 이메일 인증 페이지 처리
  - Account 팝업에서 브라우저 번역 기능 대응
  - Create Password Update 버튼 활성화

워크스페이스:
  - 초대된 워크스페이스명 공란 저장 문제
  - Invited Workspace 워크스페이스 처리
```

---

## 📈 기술 스택 상세

### Frontend Core
- **Framework**: React 18
- **Language**: TypeScript
- **상태 관리**: TanStack Query (React Query), Recoil
- **UI Library**: MUI v5
- **스타일링**: styled-components
- **폼 관리**: react-hook-form
- **국제화**: i18next, react-i18next
- **HTTP Client**: Axios

### Testing
- **Test Runner**: Jest
- **Mock Server**: MSW (Mock Service Worker)
- **Testing Library**: @testing-library/react

### DevOps
- **Build**: Create React App (CRACO)
- **Monitoring**: Datadog Browser RUM

---

## 🏆 핵심 역량 (이 프로젝트에서 증명)

### 1. SaaS 결제 시스템 구축 경험
- 구독 플랜, 추가 시트 구매, 일할 계산 등 복잡한 과금 로직 구현
- 결제 실패 재시도, 환불 요청, 구독 취소/재개 플로우 설계

### 2. 대규모 기능 리팩토링
- Seats → Members 시스템 전환
- 기존 로직 유지하면서 점진적 전환

### 3. 글로벌 서비스 대응
- 다국어 지원 (i18n) 전체 적용
- 글로벌 Storage Region 선택 기능

### 4. 테스트 문화 도입
- Jest + MSW 테스트 환경 구축
- 주요 기능 테스트 코드 작성

### 5. 반응형 UI 설계
- 모바일/태블릿/데스크톱 대응
- 반응형 컴포넌트 시스템 구축

---

## 📝 이력서 한줄 요약

> B2B SaaS 구독 관리 시스템(플랜/결제/멤버) 프론트엔드 전담 개발, 160+ 커밋으로 1년 10개월간 핵심 기능 구현

---

## 📝 경력기술서 예시

```
[프로젝트명] DentBird Account - B2B SaaS 계정 관리 시스템
[기간] 2023.09 ~ 2025.07 (1년 10개월)
[역할] 프론트엔드 개발 (전담)
[기술] React 18, TypeScript, TanStack Query, MUI, i18next, MSW, Jest

[담당 업무]
• SaaS 구독 관리 시스템 전체 설계 및 구현
  - 플랜 관리 (Free/Paid), 추가 시트 구매 (일할 계산)
  - 결제 방법 관리, 구독 취소/재개, 쿠폰 시스템
• 팀 멤버 관리 시스템 개발
  - Seats → Members 시스템 전환 리팩토링
  - 멤버 초대/권한 관리 (다지역 처리 포함)
• OAuth 회원가입 플로우 개선
  - Storage Location 선택 (글로벌 서비스)
  - MFA 인증 모달 구현
• 반응형 UI 시스템 설계 및 구현
  - 모바일/태블릿 대응, SNB 구현
• 테스트 환경 구축
  - Jest + MSW 기반 테스트 인프라 구축
  - 주요 페이지 테스트 코드 작성

[성과]
• 160+ 커밋으로 구독/멤버/워크스페이스 기능 전담 개발
• SaaS 구독 플로우 전체 구현으로 수익화 기반 마련
• 글로벌 서비스 대응을 위한 i18n 및 Region 선택 기능 구현
```

---

**마지막 업데이트**: 2026-02-06
**분석 기준**: Git commit history (jwkim@imagoworks.ai)
