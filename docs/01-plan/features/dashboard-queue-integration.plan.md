# Dashboard 큐 + 디스패처 통합

**날짜**: 2026-02-11
**Feature**: dashboard-queue-integration
**Phase**: Plan
**선행 작업**: 큐 + 디스패처 아키텍처 도입 (enqueue.sh, dispatcher.sh, common.sh)

---

## 1. 문제 정의

### AS-IS (현재)

큐 + 디스패처 아키텍처 도입 후, dashboard가 변경된 구조를 인식하지 못함:

| 문제 | 원인 | 영향 |
|------|------|------|
| **로그가 안 보임** | plist가 enqueue.sh를 실행 → StandardOutPath에 enqueue 출력만 캡처 | 실제 스크립트 로그(daily-summary.log 등) 표시 불가 |
| **실행 상태 오판** | launchctl status가 enqueue.sh의 결과만 반영 (항상 성공) | 실제 스크립트 실패해도 dashboard에서 성공으로 표시 |
| **큐 상태 미표시** | queue/*.pending, *.running 파일을 읽지 않음 | 작업이 대기 중인지 실행 중인지 알 수 없음 |
| **dispatcher 미대응** | StartInterval(300s) 형식 plist가 목록에 나타남 | 다른 작업과 구분 없이 표시, 로그 경로도 다름 |

### TO-BE (목표)

1. **큐 상태 표시**: pending/running/idle 상태를 작업 테이블에 표시
2. **올바른 로그 표시**: enqueue.sh 로그가 아닌 실제 스크립트 로그 파일 표시
3. **실행 상태 정확도**: queue 파일 + 스크립트 로그 기반으로 실제 상태 판단
4. **dispatcher 적절한 표시**: dispatcher를 별도 섹션이나 구분으로 표시

---

## 2. 기능 범위

### F1: 큐 상태 읽기 (핵심)

- `scripts/queue/` 디렉토리 스캔
- `.pending` → 대기 중 (enqueue됨, 아직 실행 전)
- `.running` → 실행 중 (dispatcher가 실행 시작)
- 파일 없음 → idle (대기 작업 없음)
- 파일 mtime으로 대기/실행 시작 시간 표시

### F2: 로그 경로 보정 (핵심)

현재: plist StandardOutPath → `logs/launchd.log` (enqueue.sh stdout)
변경: job 이름 기반으로 실제 스크립트 로그 경로 추론

```
com.dev-assistant.daily → enqueue daily-summary → logs/daily-summary.log
com.dev-assistant.standup → enqueue standup → logs/standup.log
com.dev-assistant.backlog-analyzer → enqueue backlog-analyzer → logs/backlog-analyzer.log
com.dev-assistant.burnout → enqueue burnout-radar → logs/burnout-radar.log
com.dev-assistant.dispatcher → logs/dispatcher.log
```

**추론 로직**: plist ProgramArguments에서 `enqueue.sh` 호출을 감지 → 두 번째 인자(job name)로 로그 경로 결정

### F3: 실행 상태 보정 (핵심)

현재 상태 판단:
```
launchctl list → PID 있으면 running, exitCode로 성공/실패
logParser → 로그에서 "시작"/"완료" 패턴
```

변경 후 상태 판단:
```
queue/{job}.running 존재 → running (dispatcher가 실행 중)
queue/{job}.pending 존재 → pending (대기 중, 네트워크 미연결 등)
둘 다 없음 → logParser로 마지막 실행 결과 판단 (기존 로직)
```

### F4: dispatcher 표시 (개선)

- dispatcher는 5분마다 실행되는 인프라 작업 → 일반 작업과 구분
- 로그: `logs/dispatcher.log`
- 상태: 마지막 네트워크 체크 결과, 실행한 작업 수 등

### 기능 우선순위

| 우선순위 | 기능 | 이유 |
|---------|------|------|
| P0 (필수) | F2: 로그 경로 보정 | 이것 없으면 로그가 아예 안 보임 |
| P0 (필수) | F3: 실행 상태 보정 | 상태 정보가 부정확 |
| P1 (중요) | F1: 큐 상태 표시 | pending/running 가시성 |
| P2 (선택) | F4: dispatcher 구분 | UI 개선 |

---

## 3. 기술 설계 개요

### 변경 대상 파일

| 파일 | 변경 내용 |
|------|----------|
| `dashboard/src/types.ts` | `queueStatus` 필드 추가, `runStatus`에 `'pending'` 추가 |
| `dashboard/src/hooks/useJobs.ts` | queue 디렉토리 스캔 + 로그 경로 보정 로직 |
| `dashboard/src/components/JobStatus.tsx` | pending 아이콘/색상 추가 |
| `dashboard/src/utils/logParser.ts` | (변경 없음 - 기존 로직 유지) |

### 신규 파일

| 파일 | 용도 |
|------|------|
| `dashboard/src/utils/queueScanner.ts` | queue 디렉토리 스캔, pending/running 상태 반환 |

### 타입 변경

```typescript
// types.ts 변경
export interface DiscoveredJob {
  // ... 기존 필드 유지
  runStatus: 'success' | 'running' | 'failed' | 'skipped' | 'pending' | 'unknown';  // pending 추가
  queueStatus: 'pending' | 'running' | 'idle';  // 신규
  resolvedLogPath: string | null;  // 신규: 보정된 로그 경로
}
```

### 로그 경로 보정 로직

```
plist ProgramArguments 분석:
  ["/bin/bash", "enqueue.sh", "daily-summary"]
    → enqueue 방식 감지
    → job name = "daily-summary"
    → resolvedLogPath = "{PROJECT_DIR}/logs/daily-summary.log"

  ["/bin/bash", "dispatcher.sh"]
    → dispatcher 감지
    → resolvedLogPath = "{PROJECT_DIR}/logs/dispatcher.log"

  ["/bin/bash", "some-script.sh"]  (enqueue 아님)
    → 기존 방식: plist StandardOutPath 사용
```

---

## 4. 구현 단계

### Phase 1: queueScanner.ts 신규 (P0+P1)

1. `scripts/queue/` 디렉토리 읽기
2. `.pending`, `.running` 파일 존재 여부 + mtime 반환
3. job name → queue status 매핑

### Phase 2: useJobs.ts 수정 (P0)

1. plist ProgramArguments에서 enqueue.sh 감지 → job name 추출
2. job name 기반 로그 경로 결정 (`logs/{job-name}.log`)
3. queueScanner로 queue 상태 조회
4. runStatus 결정 로직 변경:
   - queue running → 'running'
   - queue pending → 'pending'
   - 그 외 → 기존 logParser 결과

### Phase 3: UI 수정 (P1)

1. `types.ts`에 `pending` 상태 추가
2. `JobStatus.tsx`에 pending 아이콘(🕐)/색상(blue) 추가
3. 상태 열에 "대기 중" 표시

### Phase 4: dispatcher 구분 (P2)

1. dispatcher job 감지 (label 또는 ProgramArguments 기반)
2. 표시명에 [인프라] 태그 또는 dimColor 적용

---

## 5. 리스크

| 리스크 | 대응 |
|--------|------|
| enqueue 아닌 기존 방식 plist와 공존 | ProgramArguments에서 enqueue.sh 감지 시에만 보정, 아니면 기존 로직 |
| queue 디렉토리 경로 하드코딩 | PROJECT_DIR을 plist의 enqueue.sh 경로에서 추론 |
| dispatcher가 다른 사용자의 LaunchAgents도 스캔 | 기존 동작과 동일, 문제 없음 |

---

## 6. 완료 조건 (DoD)

- [x] enqueue 방식 plist의 로그 경로가 실제 스크립트 로그 파일을 가리킴
- [x] queue/*.pending 존재 시 해당 작업이 "🕐 대기 중"으로 표시
- [x] queue/*.running 존재 시 해당 작업이 "⏳ 실행 중"으로 표시
- [x] launchctl exitCode가 아닌 queue + logParser 기반으로 실행 상태 판단
- [x] dispatcher 작업이 목록에 정상 표시
- [x] 기존 enqueue 아닌 plist도 정상 동작 (하위 호환)
- [x] 기존 테스트 통과 + 신규 queueScanner 테스트 작성

## 7. 구현 기록

**구현일**: 2026-02-11
**테스트 결과**: 46개 전체 통과 (기존 39 + 신규 7)
**타입 체크**: 통과

### 변경 파일
| 파일 | 변경 |
|------|------|
| `dashboard/src/utils/queueScanner.ts` | 신규: scanQueue, extractEnqueueJobName, resolveLogPath |
| `dashboard/src/utils/queueScanner.test.ts` | 신규: 7개 테스트 |
| `dashboard/src/types.ts` | runStatus에 'pending' 추가, queueStatus 필드 추가 |
| `dashboard/src/hooks/useJobs.ts` | enqueue 감지, 로그 경로 보정, 큐 상태 통합 |
| `dashboard/src/components/JobStatus.tsx` | pending 아이콘/색상 추가 |
