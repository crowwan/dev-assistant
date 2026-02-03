import { readFile } from 'fs/promises';
import { parse as plistParse } from '@plist/parse';

// StartCalendarInterval 스케줄 타입
export interface ScheduleInterval {
  weekday?: number; // 0 = 일요일, 1 = 월요일, ...
  hour?: number;
  minute?: number;
}

// plist 파싱 결과 타입
export interface PlistInfo {
  label: string;
  schedule?: ScheduleInterval;
  programArguments?: string[];
  standardOutPath?: string;
  standardErrorPath?: string;
}

// plist 파일을 파싱하여 작업 정보 추출
export async function parsePlist(plistPath: string): Promise<PlistInfo> {
  const content = await readFile(plistPath, 'utf-8');
  const parsed = plistParse(content) as Record<string, unknown>;

  const label = parsed['Label'] as string;
  const scheduleDict = parsed['StartCalendarInterval'] as Record<string, number> | undefined;

  let schedule: ScheduleInterval | undefined;
  if (scheduleDict) {
    schedule = {
      weekday: scheduleDict['Weekday'],
      hour: scheduleDict['Hour'],
      minute: scheduleDict['Minute'],
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
