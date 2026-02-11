import { describe, it, expect } from 'vitest';
import { extractEnqueueJobName, resolveLogPath } from './queueScanner.js';

describe('extractEnqueueJobName', () => {
  it('enqueue.sh 호출에서 job name을 추출한다', () => {
    const args = ['/bin/bash', '/path/to/scripts/enqueue.sh', 'daily-summary'];
    expect(extractEnqueueJobName(args)).toBe('daily-summary');
  });

  it('enqueue.sh가 아니면 null을 반환한다', () => {
    const args = ['/bin/bash', '/path/to/scripts/daily-summary.sh'];
    expect(extractEnqueueJobName(args)).toBeNull();
  });

  it('인자가 부족하면 null을 반환한다', () => {
    expect(extractEnqueueJobName(['/bin/bash'])).toBeNull();
    expect(extractEnqueueJobName(undefined)).toBeNull();
  });

  it('dispatcher.sh도 enqueue가 아니므로 null을 반환한다', () => {
    const args = ['/bin/bash', '/path/to/scripts/dispatcher.sh'];
    expect(extractEnqueueJobName(args)).toBeNull();
  });

  it('빈 배열이면 null을 반환한다', () => {
    expect(extractEnqueueJobName([])).toBeNull();
  });
});

describe('resolveLogPath', () => {
  it('job name으로 로그 경로를 생성한다', () => {
    expect(resolveLogPath('daily-summary', '/path/to/logs')).toBe(
      '/path/to/logs/daily-summary.log',
    );
  });

  it('다른 job name으로도 올바른 경로를 생성한다', () => {
    expect(resolveLogPath('standup', '/logs')).toBe('/logs/standup.log');
  });
});
