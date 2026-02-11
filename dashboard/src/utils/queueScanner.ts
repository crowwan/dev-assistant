import { readdir, stat } from 'fs/promises';
import { join } from 'path';

export type QueueStatus = 'pending' | 'running' | 'idle';

export interface QueueInfo {
  status: QueueStatus;
  since: Date | null; // 파일 mtime (대기/실행 시작 시각)
}

// queue 디렉토리에서 모든 job의 큐 상태 조회
export async function scanQueue(
  queueDir: string,
): Promise<Map<string, QueueInfo>> {
  const result = new Map<string, QueueInfo>();

  try {
    const files = await readdir(queueDir);

    for (const file of files) {
      // .gitkeep 등 숨김 파일 무시
      if (file.startsWith('.')) continue;

      let jobName: string | null = null;
      let status: QueueStatus | null = null;

      if (file.endsWith('.running')) {
        jobName = file.replace('.running', '');
        status = 'running';
      } else if (file.endsWith('.pending')) {
        jobName = file.replace('.pending', '');
        status = 'pending';
      }

      if (jobName && status) {
        try {
          const fileStat = await stat(join(queueDir, file));
          result.set(jobName, { status, since: fileStat.mtime });
        } catch {
          result.set(jobName, { status, since: null });
        }
      }
    }
  } catch {
    // queue 디렉토리 없으면 빈 결과
  }

  return result;
}

// plist ProgramArguments에서 enqueue job name 추출
// ["/bin/bash", "/path/to/enqueue.sh", "daily-summary"] -> "daily-summary"
// enqueue 방식이 아니면 null 반환
export function extractEnqueueJobName(
  programArguments: string[] | undefined,
): string | null {
  if (!programArguments || programArguments.length < 3) return null;

  // enqueue.sh를 호출하는지 확인
  const scriptArg = programArguments[1] ?? '';
  if (scriptArg.endsWith('enqueue.sh') || scriptArg.includes('/enqueue.sh')) {
    return programArguments[2] ?? null;
  }

  return null;
}

// job name에서 스크립트 로그 경로 추론
// "daily-summary" -> "{logsDir}/daily-summary.log"
export function resolveLogPath(jobName: string, logsDir: string): string {
  return join(logsDir, `${jobName}.log`);
}
