import { describe, it, expect } from 'vitest';
import { parseLaunchctlList, type LaunchdStatus } from './launchd.js';

describe('parseLaunchctlList', () => {
  it('launchctl list 출력에서 작업 상태를 파싱한다', () => {
    const output = `-	0	com.dev-assistant.daily
-	0	com.dev-assistant.standup
123	0	com.dev-assistant.burnout
-	78	com.dev-assistant.backlog-analyzer`;

    const statuses = parseLaunchctlList(output, [
      'com.dev-assistant.daily',
      'com.dev-assistant.standup',
      'com.dev-assistant.burnout',
      'com.dev-assistant.backlog-analyzer',
    ]);

    expect(statuses.length).toBe(4);

    // daily: PID 없음, 종료코드 0 -> 대기 중
    expect(statuses[0].label).toBe('com.dev-assistant.daily');
    expect(statuses[0].pid).toBeNull();
    expect(statuses[0].exitCode).toBe(0);
    expect(statuses[0].isRunning).toBe(false);

    // burnout: PID 있음 -> 실행 중
    expect(statuses[2].label).toBe('com.dev-assistant.burnout');
    expect(statuses[2].pid).toBe(123);
    expect(statuses[2].isRunning).toBe(true);

    // backlog-analyzer: 종료코드 78 -> 실패
    expect(statuses[3].exitCode).toBe(78);
    expect(statuses[3].isRunning).toBe(false);
  });

  it('등록되지 않은 작업은 unloaded 상태를 반환한다', () => {
    const output = `-	0	com.dev-assistant.daily`;

    const statuses = parseLaunchctlList(output, [
      'com.dev-assistant.daily',
      'com.dev-assistant.unknown',
    ]);

    expect(statuses.length).toBe(2);
    expect(statuses[1].label).toBe('com.dev-assistant.unknown');
    expect(statuses[1].isLoaded).toBe(false);
  });
});
