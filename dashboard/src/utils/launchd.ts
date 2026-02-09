import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// launchd 작업 상태 타입
export interface LaunchdStatus {
  label: string;
  pid: number | null;
  exitCode: number | null;
  isRunning: boolean;
  isLoaded: boolean;
}

// launchctl list 출력을 파싱
export function parseLaunchctlList(output: string, labels: string[]): LaunchdStatus[] {
  const lines = output.trim().split('\n');

  // 출력을 맵으로 변환
  const statusMap = new Map<string, { pid: number | null; exitCode: number | null }>();

  for (const line of lines) {
    // 형식: PID  ExitCode  Label
    // "-"는 PID가 없음을 의미
    const parts = line.split('\t');
    if (parts.length >= 3) {
      const pidStr = parts[0].trim();
      const exitCodeStr = parts[1].trim();
      const label = parts[2].trim();

      statusMap.set(label, {
        pid: pidStr === '-' ? null : parseInt(pidStr, 10),
        exitCode: exitCodeStr === '-' ? null : parseInt(exitCodeStr, 10),
      });
    }
  }

  // 요청된 레이블에 대한 상태 반환
  return labels.map((label) => {
    const status = statusMap.get(label);

    if (!status) {
      return {
        label,
        pid: null,
        exitCode: null,
        isRunning: false,
        isLoaded: false,
      };
    }

    return {
      label,
      pid: status.pid,
      exitCode: status.exitCode,
      isRunning: status.pid !== null,
      isLoaded: true,
    };
  });
}

// 전체 launchd 상태를 Map으로 반환 (label -> LaunchdStatus)
export async function getAllLaunchdStatuses(): Promise<Map<string, LaunchdStatus>> {
  try {
    const { stdout } = await execAsync('launchctl list');
    const lines = stdout.trim().split('\n');
    const statusMap = new Map<string, LaunchdStatus>();

    for (const line of lines) {
      const parts = line.split('\t');
      if (parts.length >= 3) {
        const pidStr = parts[0].trim();
        const exitCodeStr = parts[1].trim();
        const label = parts[2].trim();

        statusMap.set(label, {
          label,
          pid: pidStr === '-' ? null : parseInt(pidStr, 10),
          exitCode: exitCodeStr === '-' ? null : parseInt(exitCodeStr, 10),
          isRunning: pidStr !== '-',
          isLoaded: true,
        });
      }
    }

    return statusMap;
  } catch {
    return new Map();
  }
}

// launchctl list 명령 실행
export async function getLaunchdStatuses(labels: string[]): Promise<LaunchdStatus[]> {
  try {
    const { stdout } = await execAsync('launchctl list');
    return parseLaunchctlList(stdout, labels);
  } catch {
    // 실패 시 모든 작업을 unloaded로 반환
    return labels.map((label) => ({
      label,
      pid: null,
      exitCode: null,
      isRunning: false,
      isLoaded: false,
    }));
  }
}
