import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ScheduleInterval } from './schedule.js';

// vi.hoisted로 mock 함수를 호이스팅 가능하게 생성
const { mockExecAsync } = vi.hoisted(() => ({
  mockExecAsync: vi.fn(),
}));

// child_process와 util 모킹
vi.mock('child_process', () => ({
  exec: vi.fn(),
}));

vi.mock('util', () => ({
  promisify: () => mockExecAsync,
}));

import { updateSchedule, reloadJob, toggleJob, startJobNow } from './plistEditor.js';

function setupExecSuccess() {
  mockExecAsync.mockResolvedValue({ stdout: '', stderr: '' });
}

function setupExecFailure(errorMessage: string) {
  mockExecAsync.mockRejectedValue(new Error(errorMessage));
}

describe('plistEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('updateSchedule', () => {
    it('매일 스케줄을 plutil 명령으로 업데이트한다', async () => {
      setupExecSuccess();
      const schedule: ScheduleInterval = { hour: 19, minute: 30 };

      await updateSchedule('/path/to/job.plist', schedule);

      expect(mockExecAsync).toHaveBeenCalledTimes(1);
      const calledCmd = mockExecAsync.mock.calls[0][0];
      expect(calledCmd).toContain('plutil');
      expect(calledCmd).toContain('-replace');
      expect(calledCmd).toContain('StartCalendarInterval');
      expect(calledCmd).toContain('"Hour":19');
      expect(calledCmd).toContain('"Minute":30');
      expect(calledCmd).toContain('/path/to/job.plist');
    });

    it('주간 스케줄에 Weekday를 포함한다', async () => {
      setupExecSuccess();
      const schedule: ScheduleInterval = { weekday: 1, hour: 9, minute: 0 };

      await updateSchedule('/path/to/job.plist', schedule);

      const calledCmd = mockExecAsync.mock.calls[0][0];
      expect(calledCmd).toContain('"Weekday":1');
      expect(calledCmd).toContain('"Hour":9');
      expect(calledCmd).toContain('"Minute":0');
    });

    it('interval 타입이면 StartInterval을 사용한다', async () => {
      setupExecSuccess();
      const schedule: ScheduleInterval = { interval: 3600 };

      await updateSchedule('/path/to/job.plist', schedule);

      const calledCmd = mockExecAsync.mock.calls[0][0];
      expect(calledCmd).toContain('StartInterval');
      expect(calledCmd).not.toContain('StartCalendarInterval');
      expect(calledCmd).toContain('3600');
    });

    it('plutil 실행 실패 시 에러를 던진다', async () => {
      setupExecFailure('plutil: invalid plist');

      const schedule: ScheduleInterval = { hour: 19, minute: 0 };
      await expect(updateSchedule('/path/to/job.plist', schedule))
        .rejects.toThrow('스케줄 업데이트 실패');
    });
  });

  describe('reloadJob', () => {
    it('unload 후 load 순서로 실행한다', async () => {
      setupExecSuccess();

      await reloadJob('com.dev-assistant.daily', '/path/to/job.plist');

      expect(mockExecAsync).toHaveBeenCalledTimes(2);
      const firstCmd = mockExecAsync.mock.calls[0][0];
      const secondCmd = mockExecAsync.mock.calls[1][0];
      expect(firstCmd).toContain('launchctl unload');
      expect(firstCmd).toContain('/path/to/job.plist');
      expect(secondCmd).toContain('launchctl load');
      expect(secondCmd).toContain('/path/to/job.plist');
    });

    it('unload 실패해도 load를 시도한다', async () => {
      mockExecAsync
        .mockRejectedValueOnce(new Error('Could not find specified service'))
        .mockResolvedValueOnce({ stdout: '', stderr: '' });

      await reloadJob('com.dev-assistant.daily', '/path/to/job.plist');
      expect(mockExecAsync).toHaveBeenCalledTimes(2);
    });

    it('load 실패 시 에러를 던진다', async () => {
      mockExecAsync
        .mockResolvedValueOnce({ stdout: '', stderr: '' })
        .mockRejectedValueOnce(new Error('load failed'));

      await expect(reloadJob('com.dev-assistant.daily', '/path/to/job.plist'))
        .rejects.toThrow('작업 로드 실패');
    });
  });

  describe('toggleJob', () => {
    it('enable이면 launchctl load를 실행한다', async () => {
      setupExecSuccess();

      await toggleJob('com.dev-assistant.daily', '/path/to/job.plist', true);

      expect(mockExecAsync).toHaveBeenCalledTimes(1);
      const calledCmd = mockExecAsync.mock.calls[0][0];
      expect(calledCmd).toContain('launchctl load');
      expect(calledCmd).toContain('/path/to/job.plist');
    });

    it('disable이면 launchctl unload를 실행한다', async () => {
      setupExecSuccess();

      await toggleJob('com.dev-assistant.daily', '/path/to/job.plist', false);

      expect(mockExecAsync).toHaveBeenCalledTimes(1);
      const calledCmd = mockExecAsync.mock.calls[0][0];
      expect(calledCmd).toContain('launchctl unload');
      expect(calledCmd).toContain('/path/to/job.plist');
    });

    it('실행 실패 시 에러를 던진다', async () => {
      setupExecFailure('operation not permitted');

      await expect(toggleJob('com.dev-assistant.daily', '/path/to/job.plist', true))
        .rejects.toThrow('작업 상태 변경 실패');
    });
  });

  describe('startJobNow', () => {
    it('launchctl start 명령을 실행한다', async () => {
      setupExecSuccess();

      await startJobNow('com.dev-assistant.daily');

      expect(mockExecAsync).toHaveBeenCalledTimes(1);
      const calledCmd = mockExecAsync.mock.calls[0][0];
      expect(calledCmd).toContain('launchctl start');
      expect(calledCmd).toContain('com.dev-assistant.daily');
    });

    it('실행 실패 시 에러를 던진다', async () => {
      setupExecFailure('No such process');

      await expect(startJobNow('com.dev-assistant.daily'))
        .rejects.toThrow('작업 즉시 실행 실패');
    });
  });
});
