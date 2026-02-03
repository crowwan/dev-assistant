import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { parsePlist, getNextScheduledTime, type ScheduleInterval } from './schedule.js';

describe('parsePlist', () => {
  it('plist 파일에서 Label과 StartCalendarInterval을 파싱한다', async () => {
    // 실제 plist 파일 경로 사용
    const plistPath = '/Users/kimjin-wan/Works/personal/dev-assistant/scripts/com.dev-assistant.daily.plist';
    const result = await parsePlist(plistPath);

    expect(result.label).toBe('com.dev-assistant.daily');
    expect(result.schedule).toBeDefined();
    expect(result.schedule?.hour).toBe(18);
    expect(result.schedule?.minute).toBe(0);
  });

  it('주간 스케줄(Weekday)이 있는 plist를 파싱한다', async () => {
    const plistPath = '/Users/kimjin-wan/Works/personal/dev-assistant/scripts/com.dev-assistant.burnout.plist';
    const result = await parsePlist(plistPath);

    expect(result.label).toBe('com.dev-assistant.burnout');
    expect(result.schedule?.weekday).toBe(1); // 월요일
    expect(result.schedule?.hour).toBe(9);
  });
});

describe('getNextScheduledTime', () => {
  beforeEach(() => {
    // 2026-02-03 14:30:00 (화요일)로 시간 고정
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-03T14:30:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('오늘 18:00 스케줄이면 오늘 18:00을 반환한다', () => {
    const schedule: ScheduleInterval = { hour: 18, minute: 0 };
    const next = getNextScheduledTime(schedule);

    expect(next.getFullYear()).toBe(2026);
    expect(next.getMonth()).toBe(1); // 2월 (0-indexed)
    expect(next.getDate()).toBe(3);
    expect(next.getHours()).toBe(18);
    expect(next.getMinutes()).toBe(0);
  });

  it('이미 지난 시간이면 내일을 반환한다', () => {
    // 현재 14:30, 스케줄은 02:00
    const schedule: ScheduleInterval = { hour: 2, minute: 0 };
    const next = getNextScheduledTime(schedule);

    expect(next.getDate()).toBe(4); // 내일
    expect(next.getHours()).toBe(2);
  });

  it('주간 스케줄(월요일 09:00)이면 다음 월요일을 반환한다', () => {
    // 현재 화요일 14:30, 다음 월요일은 2월 9일
    const schedule: ScheduleInterval = { weekday: 1, hour: 9, minute: 0 };
    const next = getNextScheduledTime(schedule);

    expect(next.getDate()).toBe(9); // 다음 월요일
    expect(next.getDay()).toBe(1); // 월요일
    expect(next.getHours()).toBe(9);
  });

  it('오늘이 월요일이고 아직 시간이 안됐으면 오늘을 반환한다', () => {
    // 2026-02-09 08:00 (월요일)로 시간 변경
    vi.setSystemTime(new Date('2026-02-09T08:00:00'));

    const schedule: ScheduleInterval = { weekday: 1, hour: 9, minute: 0 };
    const next = getNextScheduledTime(schedule);

    expect(next.getDate()).toBe(9); // 오늘
    expect(next.getHours()).toBe(9);
  });
});
