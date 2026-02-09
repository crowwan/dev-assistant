# Dashboard 크론잡 관리 기능 강화

**날짜**: 2026-02-09
**Feature**: dashboard-cronjob-manager
**Phase**: Plan

---

## 1. 문제 정의

### AS-IS (현재)

현재 Dashboard는 **하드코딩된 4개 작업만** 보여주고, 로그도 짧게 표시한다:

- `JOB_DEFINITIONS` 배열에 4개 작업(daily-summary, standup, burnout-radar, backlog-analyzer)이 고정
- `LogViewer`: 선택한 작업의 **마지막 7줄**만 표시 (height=8, slice(-7))
- `useLogs`: 파일에서 마지막 10줄만 읽음
- 크론잡 설정 변경 불가 (plist 직접 편집 + launchctl 수동 실행 필요)

**핵심 문제점**:

| 문제 | 원인 | 영향 |
|------|------|------|
| 특정 작업만 보임 | `JOB_DEFINITIONS` 하드코딩 | 시스템에 다른 크론잡이 있어도 확인 불가 |
| 다른 PC에서 사용 불가 | 절대 경로 하드코딩 | 이식성 없음 |
| 로그가 짧아 원인 파악 어려움 | `getLastLogLines(path, 10)` → `slice(-7)` | 에러 컨텍스트 부족 |
| 크론잡 설정 변경 불가 | plist 직접 편집 필요 | 수동 작업 번거로움 |

### TO-BE (목표)

1. **시스템 크론잡 자동 탐색**: `~/Library/LaunchAgents/`의 모든 plist를 동적으로 스캔하여 표시
2. **상세 로그 뷰어**: 로그를 더 많이 보여주고, 스크롤 가능
3. **크론잡 설정 편집**: Dashboard 내에서 실행 시간 변경 → plist 수정 → launchctl reload

---

## 2. 기능 범위

### F0: 시스템 크론잡 자동 탐색 (핵심 변경)

- **동적 스캔**: `~/Library/LaunchAgents/*.plist` 파일을 모두 읽어서 작업 목록 자동 생성
- **Apple 시스템 서비스 제외**: `com.apple.*` 패턴 필터링
- **plist 파싱**: 각 plist에서 Label, ProgramArguments, StartCalendarInterval, StandardOutPath/StandardErrorPath 추출
- **launchctl 상태 매칭**: `launchctl list`로 PID/ExitCode 가져와서 각 작업과 매칭
- **로그 경로 자동 감지**: plist의 StandardOutPath/StandardErrorPath에서 로그 경로 추출
- **어느 PC에서든 동작**: 하드코딩 제거, 시스템에서 동적으로 수집

### F1: 로그 뷰어 강화

- **더 많은 로그 표시**: 기본 7줄 → 20줄 이상, 터미널 높이에 맞게 조정
- **스크롤**: ↑↓ 키로 로그 내 스크롤
- **전체 로그 모드**: `Enter` 키로 전체 로그를 별도 뷰에서 조회
- **실행 단위 구분**: "=== 시작 ===" ~ "=== 완료 ===" 블록 단위로 구분선 표시

### F2: 크론잡 설정 편집

- **스케줄 확인**: 현재 plist의 `StartCalendarInterval` 값 표시
- **시간 변경**: 선택한 작업의 실행 시간(Hour/Minute) 수정
- **요일 변경**: 주간 작업의 실행 요일 수정
- **활성/비활성**: `launchctl load/unload`로 작업 토글
- **즉시 실행**: 선택한 작업을 수동으로 즉시 실행

### 기능 우선순위

| 우선순위 | 기능 | 이유 |
|---------|------|------|
| P0 (필수) | 시스템 크론잡 자동 탐색 | 핵심 요구사항 |
| P0 (필수) | 로그 표시량 증가 + 스크롤 | 핵심 문제 해결 |
| P0 (필수) | 실행 단위 구분 | 원인 파악 용이 |
| P1 (중요) | 전체 로그 모드 | 과거 히스토리 확인 |
| P1 (중요) | 스케줄 시간 변경 | 가장 자주 필요한 설정 변경 |
| P2 (선택) | 활성/비활성 토글 | 편의 기능 |
| P2 (선택) | 즉시 실행 | 테스트 시 유용 |

---

## 3. 기술 설계 개요

### 크론잡 자동 탐색 흐름

```
1. ~/Library/LaunchAgents/*.plist 스캔
   ↓
2. 각 plist XML 파싱 → Label, Schedule, LogPath, Script 추출
   ↓
3. com.apple.* 등 시스템 서비스 필터링
   ↓
4. launchctl list 실행 → PID/ExitCode 매핑
   ↓
5. 로그 파일 존재하면 마지막 실행 정보 추출
   ↓
6. JobStatus[] 배열 생성 → UI 렌더링
```

### 현재 plist 구조 예시

```xml
<dict>
  <key>Label</key>
  <string>com.dev-assistant.daily</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>/path/to/script.sh</string>
  </array>
  <key>StartCalendarInterval</key>
  <dict>
    <key>Hour</key><integer>18</integer>
    <key>Minute</key><integer>0</integer>
  </dict>
  <key>StandardOutPath</key>
  <string>/path/to/logs/output.log</string>
  <key>StandardErrorPath</key>
  <string>/path/to/logs/error.log</string>
</dict>
```

### 타입 변경

```typescript
// AS-IS: 하드코딩된 정의
export const JOB_DEFINITIONS: JobDefinition[] = [
  { name: 'daily-summary', label: '...', plistPath: '...', logPath: '...' },
  // ...
];

// TO-BE: 동적 탐색 결과
export interface DiscoveredJob {
  label: string;              // launchd 레이블
  plistPath: string;          // plist 파일 경로
  script: string | null;      // 실행 스크립트 경로
  schedule: ScheduleInfo | null;  // 스케줄 정보
  logPath: string | null;     // stdout 로그 경로
  errorLogPath: string | null;  // stderr 로그 경로
  isLoaded: boolean;          // launchctl에 로드 여부
  isRunning: boolean;         // 현재 실행 중 여부
  pid: number | null;
  exitCode: number | null;
}

export interface ScheduleInfo {
  hour?: number;
  minute?: number;
  weekday?: number;  // 0=일, 1=월, ..., 6=토
}
```

---

## 4. 기술 제약 사항

### 터미널 UI 한계 (Ink/React)

- **ink** 라이브러리 기반 → 웹 UI 수준의 스크롤은 불가
- 키보드 네비게이션 위주로 UX 설계 필요
- 작업 목록이 동적이므로 숫자키(1-4) 대신 ↑↓/Tab으로 선택 변경

### plist 파싱

- macOS `plutil -convert json` 명령으로 JSON 변환 후 파싱 가능
- 또는 XML 직접 파싱 (추가 의존성 없음)

### plist 편집

- `plutil -replace` 명령으로 특정 키 수정 가능
- 변경 후 `launchctl unload && launchctl load` 필요
- 실행 중인 작업은 unload 전 종료 필요

### 파일 크기

- 로그 파일이 클 수 있음 → 파일 끝에서부터 역방향 읽기 고려
- 현재 `getLastLogLines`은 파일 전체를 읽고 마지막 N줄 반환

---

## 5. 구현 접근법

### 옵션 A: 기존 Dashboard 확장 (권장)

기존 Ink 기반 터미널 대시보드를 리팩토링하여 동적 탐색 + 새 기능 추가

**장점**:
- 기존 코드 활용 (hooks, utils, 테스트)
- 통합된 사용자 경험
- 추가 의존성 최소

**단점**:
- 터미널 UI 제약 (복잡한 폼 어려움)
- 작업 수가 많아지면 화면이 좁을 수 있음

### 옵션 B: 웹 대시보드로 전환

**단점이 너무 큼**: 전면 재작성, 서버 필요, 범위 과다

**선택: 옵션 A** - 기존 Ink 대시보드 확장

---

## 6. 구현 단계

### Phase 1: 크론잡 자동 탐색 (P0)

1. `utils/plistScanner.ts` 신규: `~/Library/LaunchAgents/*.plist` 스캔
2. `plutil -convert json` 로 plist → JSON 변환 후 파싱
3. `com.apple.*` 등 시스템 서비스 필터링
4. `types.ts` 변경: `JOB_DEFINITIONS` 하드코딩 → `DiscoveredJob` 동적 타입
5. `useJobs.ts` 변경: 하드코딩 대신 `scanLaunchAgents()` 호출
6. `JobStatusTable` 수정: 동적 개수 대응, 선택/스크롤 UI

### Phase 2: 로그 뷰어 강화 (P0)

1. `useLogs` 훅 수정: lineCount 증가 (10 → 50+)
2. `LogViewer` 스크롤 기능: ↑↓ 키로 로그 내 이동
3. 실행 단위 구분선 추가: "=== 시작 ===" 패턴 감지 → 구분선 삽입
4. 로그 경로를 plist에서 자동 추출 (하드코딩 불필요)
5. 로그 읽기 최적화: 파일 끝에서부터 역방향 읽기 (큰 파일 대응)

### Phase 3: 전체 로그 뷰 (P1)

1. `Enter` 키로 전체 로그 모드 진입
2. 별도 화면에서 전체 로그 표시 (메인 대시보드 숨김)
3. `ESC`로 메인 대시보드 복귀
4. 전체 로그 내 스크롤

### Phase 4: 크론잡 설정 편집 (P1)

1. `e` 키로 선택 작업의 설정 편집 모드 진입
2. 현재 스케줄 표시 (Hour, Minute, Weekday)
3. 숫자 입력으로 시간 변경
4. `plutil -replace` 로 plist 파일 수정
5. `launchctl unload/load`로 반영
6. 확인 프롬프트: "18:00 → 19:00으로 변경? (y/n)"

### Phase 5: 추가 기능 (P2)

1. 활성/비활성 토글 (`d` 키): launchctl load/unload
2. 즉시 실행 (`x` 키): launchctl start
3. 에러 필터 토글 (`f` 키)

---

## 7. 키보드 단축키 계획

| 키 | 현재 | 변경 |
|----|------|------|
| `1-4` | 작업 선택 (4개 고정) | 제거 (동적 개수 대응 불가) |
| `↑/↓` | - | 작업 목록 이동 + 로그 스크롤 |
| `Tab` | 다음 작업 | 포커스 전환 (작업 목록 ↔ 로그 영역) |
| `r` | 새로고침 | 유지 |
| `q` | 종료 | 유지 |
| `Enter` | - | 전체 로그 모드 진입 |
| `ESC` | - | 이전 화면 복귀 |
| `e` | - | 스케줄 편집 |
| `d` | - | 활성/비활성 토글 |
| `x` | - | 즉시 실행 |

---

## 8. 영향 범위

### 수정 파일

| 파일 | 변경 내용 |
|------|----------|
| `dashboard/src/types.ts` | `JOB_DEFINITIONS` 제거, `DiscoveredJob` 타입 추가 |
| `dashboard/src/hooks/useJobs.ts` | 하드코딩 → 동적 스캔 방식 |
| `dashboard/src/hooks/useLogs.ts` | lineCount 증가, 역방향 읽기 |
| `dashboard/src/components/LogViewer.tsx` | 스크롤, 구분선, 표시량 증가 |
| `dashboard/src/components/JobStatus.tsx` | 동적 목록 대응, ↑↓ 선택 |
| `dashboard/src/App.tsx` | 뷰 전환(메인/전체로그/편집), 키 변경 |
| `dashboard/src/utils/logParser.ts` | 실행 블록 파싱 |
| `dashboard/src/utils/launchd.ts` | 동적 탐색 활용 |
| `dashboard/src/utils/schedule.ts` | 동적 plist 대응 |

### 신규 파일

| 파일 | 용도 |
|------|------|
| `dashboard/src/utils/plistScanner.ts` | ~/Library/LaunchAgents 스캔 + plist 파싱 |
| `dashboard/src/components/FullLogViewer.tsx` | 전체 로그 뷰 |
| `dashboard/src/components/ScheduleEditor.tsx` | 스케줄 편집 UI |
| `dashboard/src/utils/plistEditor.ts` | plist 파일 수정 유틸 |

---

## 9. 리스크

| 리스크 | 대응 |
|--------|------|
| 작업 수가 많을 경우 화면 넘침 | 작업 목록도 스크롤 가능하게, 높이 제한 + 페이지네이션 |
| plist에 StandardOutPath 없는 경우 | 로그 미표시, "로그 경로 없음" 표시 |
| launchctl 권한 문제 | 사용자 LaunchAgents만 대상 (루트 권한 불필요) |
| plutil 명령 실패 | 에러 메시지 표시, 편집 취소 |

---

## 10. 완료 조건 (DoD)

- [ ] `~/Library/LaunchAgents/` 의 모든 plist를 자동으로 스캔하여 작업 목록 표시
- [ ] `com.apple.*` 등 시스템 서비스 자동 필터링
- [ ] 각 작업의 launchctl 상태(PID, ExitCode) 실시간 표시
- [ ] plist의 StandardOutPath에서 로그 경로 자동 감지
- [ ] 로그 뷰어에서 최소 20줄 이상 표시
- [ ] ↑↓ 키로 로그 스크롤 동작
- [ ] 실행 단위(시작~완료) 구분선 표시
- [ ] Enter로 전체 로그 모드 진입 / ESC로 복귀
- [ ] `e` 키로 스케줄 편집 → 시간 변경 → plist 반영 → launchctl reload
- [ ] 기존 하드코딩 제거, 어떤 macOS에서든 동작
- [ ] 모든 변경에 대한 테스트 작성
