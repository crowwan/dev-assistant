import { exec } from 'child_process';
import { promisify } from 'util';
import type { ScheduleInterval } from './schedule.js';

const execAsync = promisify(exec);

// ScheduleInterval을 plist JSON 형식으로 변환
function toCalendarIntervalJson(schedule: ScheduleInterval): string {
  const obj: Record<string, number> = {};
  if (schedule.weekday !== undefined) obj['Weekday'] = schedule.weekday;
  if (schedule.hour !== undefined) obj['Hour'] = schedule.hour;
  if (schedule.minute !== undefined) obj['Minute'] = schedule.minute;
  return JSON.stringify(obj);
}

// 스케줄 변경: plutil -replace 명령 사용
export async function updateSchedule(plistPath: string, schedule: ScheduleInterval): Promise<void> {
  try {
    if (schedule.interval !== undefined) {
      // StartInterval (초 단위 반복 간격)
      await execAsync(
        `plutil -replace StartInterval -integer ${schedule.interval} ${plistPath}`
      );
    } else {
      // StartCalendarInterval (시간 기반 스케줄)
      const json = toCalendarIntervalJson(schedule);
      await execAsync(
        `plutil -replace StartCalendarInterval -json '${json}' ${plistPath}`
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`스케줄 업데이트 실패: ${message}`);
  }
}

// 작업 재로드: unload 후 load
export async function reloadJob(_label: string, plistPath: string): Promise<void> {
  // unload는 실패할 수 있음 (이미 unloaded 상태 등)
  try {
    await execAsync(`launchctl unload ${plistPath}`);
  } catch {
    // unload 실패는 무시 (이미 언로드 상태일 수 있음)
  }

  try {
    await execAsync(`launchctl load ${plistPath}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`작업 로드 실패: ${message}`);
  }
}

// 작업 활성/비활성: load 또는 unload
export async function toggleJob(_label: string, plistPath: string, enable: boolean): Promise<void> {
  const action = enable ? 'load' : 'unload';
  try {
    await execAsync(`launchctl ${action} ${plistPath}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`작업 상태 변경 실패: ${message}`);
  }
}

// 즉시 실행: launchctl start
export async function startJobNow(label: string): Promise<void> {
  try {
    await execAsync(`launchctl start ${label}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`작업 즉시 실행 실패: ${message}`);
  }
}
