# Imago Design System - 프로젝트 성과

> **프로젝트**: @imago-cloud/design-system (MUI 기반 React 공용 디자인 시스템)
> **기간**: 2025.04 ~ 2025.08 (약 4개월)
> **역할**: Frontend Developer (디자인 시스템 기여)
> **기술 스택**: React 18/19, TypeScript, MUI 5, Storybook 7, dayjs

---

## 🎯 핵심 성과 요약

| 지표 | 성과 |
|------|------|
| **총 커밋** | 9개 |
| **React 19 마이그레이션** | 19개 파일 변경, 10,000+ 라인 수정 |
| **컴포넌트 개선** | DatePicker API 확장 (3건) |
| **릴리즈 관리** | v2.0.2, v3.0.0 시리즈 배포 |

### 커밋 유형별 분포

| 유형 | 커밋 수 | 비율 |
|------|--------|------|
| feat (기능 추가) | 2 | 22% |
| fix (버그 수정) | 2 | 22% |
| release (릴리즈) | 3 | 34% |
| chore (마이그레이션) | 1 | 11% |
| merge (PR 머지) | 1 | 11% |

---

## 🚀 주요 개발 내역

### 1. React 19 마이그레이션 작업

**기간**: 2025.04.23
**역할**: 마이그레이션 구현

#### 문제 상황
- React 19 출시에 따른 디자인 시스템 호환성 확보 필요
- Storybook 7과 React 19 간 호환성 이슈 존재
- 기존 컴포넌트 Stories 파일 업데이트 필요

#### 해결 방안
- **패키지 의존성 대폭 업데이트**: package.json 44개 라인 변경
- **Storybook 설정 수정**: main.js, preview.js 호환성 확보
- **ESLint 설정 최적화**: React 19 규칙 대응

#### 구현 상세
```yaml
변경 범위:
  - 19개 파일 수정
  - package-lock.json: +3,479줄 / -6,970줄 (총 10,311줄 변경)
  - 10개 이상 Stories 파일 업데이트

주요 작업:
  - ESLint 설정 업데이트
  - Storybook 설정 수정 (main.js, preview.js)
  - 컴포넌트 Stories 호환성 확보
  - 의존성 버전 충돌 해결
```

#### 기술 스택
`React 19` `TypeScript` `Storybook 7` `ESLint`

---

### 2. DatePicker 컴포넌트 API 확장

**기간**: 2025.08.26 ~ 2025.08.28
**역할**: 기능 개선 전담

#### 문제 상황
- DatePicker 컴포넌트의 placeholder 커스터마이징 불가
- onClick 이벤트를 외부에서 제어할 수 없는 한계
- 여러 제품에서 동일 컴포넌트 사용 시 유연성 부족

#### 해결 방안
- **placeholder props 추가**: 사용자 정의 placeholder 텍스트 지원
- **onClick handler props 추가**: 외부에서 클릭 이벤트 제어 가능
- **API 확장성 확보**: 기존 인터페이스 호환성 유지하며 기능 추가

#### 구현 상세
```yaml
2025.08.26 - baa1797:
  - DatePicker placeholder props 추가
  - 기본값 유지하며 선택적 오버라이드 지원
  - v3.0.0-13 릴리즈

2025.08.28 - b434772:
  - DatePicker onClick handler props 추가
  - 외부에서 클릭 이벤트 커스터마이징 가능
  - v3.0.0-15 릴리즈
```

#### 기술 스택
`React` `TypeScript` `MUI X Date Pickers` `dayjs`

---

### 3. DatePicker onClose 버그 긴급 수정

**기간**: 2025.08.06
**역할**: 버그 수정 및 배포

#### 문제 상황
- DatePicker의 onClose props가 내부 로직에 의해 덮어 씌워지는 버그 발생
- 사용 팀에서 onClose 콜백이 호출되지 않는 이슈 리포트

#### 해결 방안
- **onClose 호출 로직 수정**: 외부 props 우선 적용
- **당일 긴급 배포**: 버그 수정 후 v2.0.2 릴리즈

#### 구현 상세
```yaml
버그 분석:
  - 내부 onClose 핸들러가 외부 props를 덮어 씀
  - Picker 닫힘 시 사용자 콜백 미호출

수정 내역:
  - onClose 호출 순서 조정
  - 외부 props 콜백 호출 보장
  - PR 머지 후 즉시 릴리즈

영향:
  - 동일 버그 재발 방지
  - 사용 팀 영향 최소화 (당일 배포)
```

#### 기술 스택
`React` `TypeScript` `MUI X Date Pickers`

---

## 📊 기술 스택 상세

### Frontend Core
- **Framework**: React 18 / React 19 (마이그레이션)
- **Language**: TypeScript
- **UI Library**: MUI v5, MUI X Date Pickers
- **날짜 처리**: dayjs
- **문서화**: Storybook 7

### Development Tools
- **Linting**: ESLint, Prettier
- **Git Hooks**: Husky
- **버전 관리**: Git, Azure DevOps

### Package Distribution
- **배포 형식**: npm (ESM/CJS dual export)
- **버전 관리**: Semantic Versioning

---

## 🛠️ 기술적 도전 및 해결

### 1. React 19 + Storybook 7 호환성

**문제**: React 19의 새로운 API와 Storybook 7 간 호환성 이슈

**해결**:
- Storybook 설정 파일 전면 수정
- Stories 파일 문법 업데이트
- 의존성 버전 충돌 해결

### 2. DatePicker API 확장 시 하위 호환성

**문제**: 새 props 추가 시 기존 사용 코드에 영향 없어야 함

**해결**:
- Optional props로 설계 (기본값 유지)
- 기존 동작 보장하며 기능 확장
- 타입 정의 업데이트

### 3. 프로덕션 버그 긴급 대응

**문제**: onClose props 오버라이드로 사용 팀 기능 동작 불가

**해결**:
- 버그 원인 분석 및 수정
- PR 생성, 리뷰, 머지 당일 완료
- v2.0.2 긴급 릴리즈로 영향 최소화

---

## ✍️ 이력서 요약 문구

### 한 줄 요약
> MUI 기반 React 디자인 시스템 기여 - React 19 마이그레이션(19개 파일, 10K+ LOC), DatePicker API 확장 및 버그 수정, v2/v3 릴리즈 관리

### 상세 버전
> - React 19 마이그레이션 작업 수행 (19개 파일 변경, Storybook/ESLint 설정 업데이트)
> - DatePicker 컴포넌트 API 확장 (placeholder, onClick handler 커스터마이징 지원)
> - 프로덕션 버그 긴급 대응 (onClose props 오버라이드 버그 당일 수정 및 배포)
> - 디자인 시스템 릴리즈 관리 (v2.0.2, v3.0.0-13, v3.0.0-15)

---

## 📅 활동 타임라인

```
2025.04.23 ─────────────────────────────────────────────────────
        │ React 19 마이그레이션 착수
        │ 19개 파일 변경
        │ Storybook/ESLint 설정 업데이트
        │ 패키지 의존성 대폭 업데이트 (10K+ LOC)
        │
2025.08.06 ─────────────────────────────────────────────────────
        │ DatePicker onClose 버그 긴급 수정
        │ PR 머지 및 v2.0.2 릴리즈
        │ 프로덕션 버그 당일 대응 완료
        │
2025.08.26 ─────────────────────────────────────────────────────
        │ DatePicker placeholder props 추가
        │ v3.0.0-13 릴리즈
        │
2025.08.28 ─────────────────────────────────────────────────────
        │ DatePicker onClick handler props 추가
        │ v3.0.0-15 릴리즈
        │ DatePicker API 확장 완료
```

---

## 📝 경력기술서 예시

```
[프로젝트명] Imago Cloud Design System
[기간] 2025.04 ~ 2025.08 (4개월)
[역할] 프론트엔드 개발 (디자인 시스템 기여)
[기술] React 18/19, TypeScript, MUI 5, Storybook 7, dayjs

[담당 업무]
• React 19 마이그레이션 작업
  - 19개 파일 변경, 10,000+ 라인 수정
  - Storybook 7 호환성 확보 및 ESLint 설정 최적화
  - 패키지 의존성 업데이트 및 버전 충돌 해결

• DatePicker 컴포넌트 API 확장
  - placeholder props 추가로 사용자 정의 텍스트 지원
  - onClick handler 외부 주입 가능하도록 인터페이스 확장
  - 하위 호환성 유지하며 기능 확장

• 프로덕션 버그 긴급 대응
  - onClose props 오버라이드 버그 당일 수정 및 배포
  - 사용 팀 영향 최소화

• 디자인 시스템 릴리즈 관리
  - Semantic Versioning 기반 버전 관리
  - v2(production) 및 v3(next) 브랜치 릴리즈 담당

[성과]
• React 19 대응을 위한 v3 브랜치 기반 마련
• DatePicker 컴포넌트 유연성 향상으로 다수 제품에서 활용
• 프로덕션 버그 당일 대응으로 사용 팀 영향 최소화
```

---

## 🔗 관련 문서

- **프로젝트 경로**: `/Users/kimjin-wan/Works/devops/imago-design-system`
- **기술 스택**: React 18/19, TypeScript, MUI 5, Storybook 7, dayjs
- **패키지명**: @imago-cloud/design-system
- **브랜치**: v2 (production), v3 (next)

---

**마지막 업데이트**: 2026-02-06
**분석 기준**: Git commit history (jwkim@imagoworks.ai)
