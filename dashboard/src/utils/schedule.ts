import { readFile } from 'fs/promises';
import { parse as plistParse } from '@plist/parse';

// StartCalendarInterval 또는 StartInterval 스케줄 타입
export interface ScheduleInterval {
  weekday?: number; // 0 = 일요일, 1 = 월요일, ...
  hour?: number;
  minute?: number;
  interval?: number; // StartInterval (초 단위)
}

// plist 파싱 결과 타입
export interface PlistInfo {
  label: string;
  schedule?: ScheduleInterval;
  programArguments?: string[];
  standardOutPath?: string;
  standardErrorPath?: string;
  plistPath?: string; // plist 파일 경로 (scanLaunchAgents에서 설정)
}

// plist 파일을 파싱하여 작업 정보 추출
export async function parsePlist(plistPath: string): Promise<PlistInfo> {
  const content = await readFile(plistPath, 'utf-8');
  const parsed = plistParse(content) as Record<string, unknown>;

  const label = parsed['Label'] as string;
  const scheduleDict = parsed['StartCalendarInterval'] as Record<string, number> | undefined;
  const startInterval = parsed['StartInterval'] as number | undefined;

  let schedule: ScheduleInterval | undefined;
  if (scheduleDict) {
    schedule = {
      weekday: scheduleDict['Weekday'],
      hour: scheduleDict['Hour'],
      minute: scheduleDict['Minute'],
    };
  } else if (startInterval) {
    // StartInterval: 초 단위 반복 간격
    schedule = {
      interval: startInterval,
    };
  }

  return {
    label,
    schedule,
    programArguments: parsed['ProgramArguments'] as string[] | undefined,
    standardOutPath: parsed['StandardOutPath'] as string | undefined,
    standardErrorPath: parsed['StandardErrorPath'] as string | undefined,
  };
}

// 스케줄 기준 다음 실행 시간 계산
export function getNextScheduledTime(schedule: ScheduleInterval): Date {
  const now = new Date();
  const next = new Date(now);

  // 시간/분 설정
  next.setHours(schedule.hour ?? 0);
  next.setMinutes(schedule.minute ?? 0);
  next.setSeconds(0);
  next.setMilliseconds(0);

  // 주간 스케줄인 경우
  if (schedule.weekday !== undefined) {
    const currentDay = now.getDay();
    const targetDay = schedule.weekday;
    let daysUntilTarget = targetDay - currentDay;

    if (daysUntilTarget < 0) {
      // 이번 주 지남 -> 다음 주로
      daysUntilTarget += 7;
    } else if (daysUntilTarget === 0 && next <= now) {
      // 오늘인데 시간 지남 -> 다음 주로
      daysUntilTarget = 7;
    }

    next.setDate(now.getDate() + daysUntilTarget);
  } else {
    // 매일 스케줄인 경우
    if (next <= now) {
      // 오늘 이미 지남 -> 내일로
      next.setDate(next.getDate() + 1);
    }
  }

  return next;
}

// 스케줄 정보를 사람이 읽기 쉬운 문자열로 포맷
export function formatSchedule(schedule: ScheduleInterval): string {
  // StartInterval (초 단위 반복)
  if (schedule.interval) {
    const hours = Math.floor(schedule.interval / 3600);
    const minutes = Math.floor((schedule.interval % 3600) / 60);
    if (hours > 0 && minutes > 0) return `${hours}시간 ${minutes}분 간격`;
    if (hours > 0) return `${hours}시간 간격`;
    return `${minutes}분 간격`;
  }

  // StartCalendarInterval (시간 기반 스케줄)
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const time = `${String(schedule.hour ?? 0).padStart(2, '0')}:${String(schedule.minute ?? 0).padStart(2, '0')}`;

  if (schedule.weekday !== undefined) {
    return `매주 ${weekdays[schedule.weekday]} ${time}`;
  }

  return `매일 ${time}`;
}
