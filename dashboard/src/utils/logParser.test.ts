import { describe, it, expect } from 'vitest';
import { parseLogLine, getLastRunInfo, insertRunSeparators, type LogEntry, type RunInfo } from './logParser.js';

describe('parseLogLine', () => {
  it('타임스탬프와 메시지를 파싱한다', () => {
    const line = '[2026-02-03 18:00:05] === Daily Summary 시작 ===';
    const entry = parseLogLine(line);

    expect(entry).not.toBeNull();
    expect(entry?.timestamp).toEqual(new Date('2026-02-03T18:00:05'));
    expect(entry?.message).toBe('=== Daily Summary 시작 ===');
  });

  it('타임스탬프 없는 라인은 null을 반환한다', () => {
    const line = '일반 텍스트 메시지';
    const entry = parseLogLine(line);

    expect(entry).toBeNull();
  });

  it('완료 메시지를 감지한다', () => {
    const line = '[2026-02-03 18:02:26] === Daily Summary 완료 ===';
    const entry = parseLogLine(line);

    expect(entry?.isComplete).toBe(true);
  });

  it('시작 메시지를 감지한다', () => {
    const line = '[2026-02-03 18:00:05] === Daily Summary 시작 ===';
    const entry = parseLogLine(line);

    expect(entry?.isStart).toBe(true);
  });
});

describe('getLastRunInfo', () => {
  it('로그 파일에서 마지막 실행 정보를 추출한다', async () => {
    const logPath = '/Users/kimjin-wan/Works/personal/dev-assistant/logs/daily-summary.log';
    const info = await getLastRunInfo(logPath);

    expect(info).not.toBeNull();
    expect(info?.lastRun).toBeInstanceOf(Date);
    // 마지막 실행이 완료되었거나 진행 중인지 확인
    expect(['success', 'running', 'failed', 'skipped']).toContain(info?.status);
  });

  it('주말 스킵 상태를 감지한다', async () => {
    // 샘플 로그에 주말 스킵 라인이 있음
    const sampleLog = `[2026-01-04 18:00:00] === Daily Summary 시작 ===
[2026-01-04 18:00:00] 주말이므로 스킵`;

    const info = getLastRunInfoFromContent(sampleLog);
    expect(info?.status).toBe('skipped');
  });
});

describe('insertRunSeparators', () => {
  it('시작 패턴 앞에 구분선을 삽입한다', () => {
    const lines = [
      '[2026-02-09 18:00:00] === Daily Summary 시작 ===',
      '[2026-02-09 18:00:01] 작업 중...',
      '[2026-02-09 18:00:02] === Daily Summary 완료 ===',
      '[2026-02-10 18:00:00] === Daily Summary 시작 ===',
      '[2026-02-10 18:00:01] 작업 중...',
    ];

    const result = insertRunSeparators(lines);

    // 첫 번째 시작 앞에는 구분선 없음
    expect(result[0]).toContain('시작');
    // 두 번째 시작 앞에 구분선 있음
    expect(result[3]).toContain('─');
    expect(result[4]).toContain('시작');
  });

  it('빈 배열을 처리한다', () => {
    expect(insertRunSeparators([])).toEqual([]);
  });

  it('시작 패턴이 없으면 구분선을 추가하지 않는다', () => {
    const lines = ['일반 로그 1', '일반 로그 2'];
    expect(insertRunSeparators(lines)).toEqual(lines);
  });
});

// 테스트용 헬퍼 - 문자열에서 직접 파싱
function getLastRunInfoFromContent(content: string): RunInfo | null {
  const lines = content.trim().split('\n');
  let lastStart: Date | null = null;
  let lastComplete: Date | null = null;
  let isSkipped = false;

  for (const line of lines) {
    const entry = parseLogLine(line);
    if (entry?.isStart) {
      lastStart = entry.timestamp;
      lastComplete = null;
      isSkipped = false;
    }
    if (entry?.isComplete) {
      lastComplete = entry.timestamp;
    }
    if (line.includes('주말이므로 스킵')) {
      isSkipped = true;
    }
  }

  if (!lastStart) return null;

  let status: RunInfo['status'] = 'running';
  if (isSkipped) {
    status = 'skipped';
  } else if (lastComplete) {
    status = 'success';
  }

  return {
    lastRun: lastStart,
    status,
  };
}
