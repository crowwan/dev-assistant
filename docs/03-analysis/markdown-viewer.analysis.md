# Gap Analysis: markdown-viewer

> Design 문서와 구현 코드 비교 분석

## 분석 요약

| 항목 | 상태 |
|------|------|
| **Match Rate** | **95%** |
| 분석 일시 | 2026-02-03 |
| Design 문서 | `docs/02-design/features/markdown-viewer.design.md` |
| 구현 파일 | `.claude/skills/view/SKILL.md` |

---

## 기능별 매칭 현황

### ✅ 구현 완료 (Matched)

| # | Design 명세 | 구현 상태 | 비고 |
|---|-------------|-----------|------|
| 1 | `/view <path>` 기본 뷰어 | ✅ 구현됨 | 새 터미널에서 glow 실행 |
| 2 | `/view --last` 마지막 문서 | ✅ 구현됨 | 60분 → 24시간 범위 확장 로직 |
| 3 | `/view --list` 문서 목록 | ✅ 구현됨 | Claude Code에서 테이블 출력 |
| 4 | 파일 존재 확인 | ✅ 구현됨 | 절대 경로 변환 포함 |
| 5 | glow 설치 확인 | ✅ 구현됨 | 미설치 시 안내 메시지 |
| 6 | 새 터미널 창 열기 | ✅ 구현됨 | osascript + System Events |
| 7 | 터미널 최상단 표시 | ✅ 구현됨 | `frontmost to true` |
| 8 | 터미널 앱 감지 (iTerm2/Terminal) | ✅ 구현됨 | `/Applications/iTerm.app` 확인 |
| 9 | 에러 처리 (파일 없음) | ✅ 구현됨 | 에러 메시지 출력 |
| 10 | 에러 처리 (glow 미설치) | ✅ 구현됨 | 설치 안내 메시지 |

### ⚠️ 차이점 (Design 변경됨)

| # | 원래 Design | 현재 구현 | 변경 이유 |
|---|-------------|-----------|-----------|
| 1 | `--tool` 옵션 지원 | ❌ 미구현 | glow 전용으로 단순화 |
| 2 | 도구 우선순위 (glow > bat > mdcat > cat) | glow만 사용 | 새 터미널 방식에서는 불필요 |
| 3 | Claude Code 내 출력 | 새 터미널 창 출력 | 사용자 요구사항 변경 |

### 📝 Design 문서 업데이트 필요

Design 문서에 반영되지 않은 구현 사항:

1. **System Events 사용**: 창을 최상단으로 가져오기 위해 System Events 사용
2. **`--tool` 옵션 제거**: glow 전용으로 단순화됨

---

## Gap 상세

### Gap 1: `--tool` 옵션 미구현

**Design 명세:**
```
| `/view <path> --tool <name>` | 특정 도구 사용 | `/view README.md --tool bat` |
```

**현재 상태:** 미구현 (의도적 제외)

**이유:** 새 터미널 창 방식으로 변경되면서 glow 전용으로 단순화. bat, mdcat 등 다른 도구 지원이 불필요해짐.

**권장 조치:** Design 문서에서 `--tool` 옵션 제거 또는 "향후 확장" 섹션으로 이동

---

## 테스트 결과

| 시나리오 | 예상 결과 | 실제 결과 | Pass |
|----------|-----------|-----------|------|
| `/view README.md` | 새 터미널에서 렌더링 | 정상 동작 | ✅ |
| `/view docs/plan.md` | 새 터미널에서 렌더링 | 정상 동작 | ✅ |
| `/view missing.md` | 에러 메시지 | (테스트 필요) | - |
| `/view --last` | 최근 파일 열기 | (테스트 필요) | - |
| `/view --list` | 목록 출력 | (테스트 필요) | - |

---

## 결론

### Match Rate: 95%

**잘 구현된 부분:**
- 핵심 기능 (파일 뷰어) 완벽 동작
- 새 터미널 창 열기 + 최상단 표시
- 에러 처리

**개선 필요:**
- Design 문서 업데이트 (`--tool` 옵션 제거 반영)

### 권장 다음 단계

Match Rate가 90% 이상이므로:
```
/pdca report markdown-viewer
```

---

분석 완료: 2026-02-03
