import { useState, useEffect, useCallback } from 'react';
import { dirname, join } from 'path';
import type { DiscoveredJob } from '../types.js';
import { scanLaunchAgents, getDisplayName } from '../utils/plistScanner.js';
import { getAllLaunchdStatuses } from '../utils/launchd.js';
import { getLastRunInfo } from '../utils/logParser.js';
import { getNextScheduledTime } from '../utils/schedule.js';
import { scanQueue, extractEnqueueJobName, resolveLogPath } from '../utils/queueScanner.js';
import type { QueueStatus } from '../utils/queueScanner.js';

// 동적으로 LaunchAgents를 스캔하여 작업 상태를 조회하는 hook
export function useJobs(pollingInterval: number = 5000) {
  const [jobs, setJobs] = useState<DiscoveredJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // 작업 상태 새로고침
  const refresh = useCallback(async () => {
    try {
      // 1. plist 파일 스캔
      const plistInfos = await scanLaunchAgents();

      // 2. launchctl 상태 가져오기
      const launchdStatuses = await getAllLaunchdStatuses();

      // 3. enqueue.sh 경로에서 queue/logs 디렉토리 추론
      let queueDir: string | null = null;
      let logsDir: string | null = null;
      for (const info of plistInfos) {
        const enqueueScript = info.programArguments?.[1] ?? '';
        if (enqueueScript.includes('enqueue.sh')) {
          const scriptsDir = dirname(enqueueScript);
          queueDir = join(scriptsDir, 'queue');
          logsDir = join(scriptsDir, '..', 'logs');
          break;
        }
      }

      // 4. 큐 상태 스캔
      const queueStatuses = queueDir
        ? await scanQueue(queueDir)
        : new Map<string, { status: QueueStatus; since: Date | null }>();

      // 5. 각 plist에 대해 DiscoveredJob 생성
      const discovered: DiscoveredJob[] = await Promise.all(
        plistInfos.map(async (info) => {
          const launchdStatus = launchdStatuses.get(info.label);

          // enqueue 방식 감지 + 로그 경로 보정
          const enqueueJobName = extractEnqueueJobName(info.programArguments);
          const logPath = enqueueJobName && logsDir
            ? resolveLogPath(enqueueJobName, logsDir)
            : (info.standardOutPath ?? null);

          const runInfo = logPath ? await getLastRunInfo(logPath) : null;

          // 스케줄 기반 다음 실행 시간 계산
          let nextRun: Date | null = null;
          if (info.schedule) {
            try {
              nextRun = getNextScheduledTime(info.schedule);
            } catch {
              // 스케줄 계산 실패 무시
            }
          }

          // 큐 상태 결정
          const queueInfo = enqueueJobName
            ? queueStatuses.get(enqueueJobName)
            : undefined;
          const queueStatus: QueueStatus = queueInfo?.status ?? 'idle';

          // 실행 상태 결정: 큐 상태 우선, 없으면 launchctl + logParser
          const isRunning = queueStatus === 'running' || (launchdStatus?.isRunning ?? false);
          let runStatus: DiscoveredJob['runStatus'];
          if (queueStatus === 'running') {
            runStatus = 'running';
          } else if (queueStatus === 'pending') {
            runStatus = 'pending';
          } else if (launchdStatus?.isRunning) {
            runStatus = 'running';
          } else {
            runStatus = runInfo?.status ?? 'unknown';
          }

          return {
            label: info.label,
            displayName: getDisplayName(info.label),
            plistPath: info.plistPath ?? '',
            script: info.programArguments?.[info.programArguments.length - 1] ?? null,
            schedule: info.schedule ?? null,
            logPath,
            errorLogPath: info.standardErrorPath ?? null,
            isLoaded: launchdStatus?.isLoaded ?? false,
            isRunning,
            pid: launchdStatus?.pid ?? null,
            exitCode: launchdStatus?.exitCode ?? null,
            lastRun: runInfo?.lastRun ?? null,
            runStatus,
            queueStatus,
            nextRun,
          } satisfies DiscoveredJob;
        })
      );

      setJobs(discovered);
      setLastUpdated(new Date());
      setIsLoading(false);
    } catch {
      setIsLoading(false);
    }
  }, []);

  // 초기 로드 및 폴링
  useEffect(() => {
    refresh();

    const interval = setInterval(refresh, pollingInterval);
    return () => clearInterval(interval);
  }, [refresh, pollingInterval]);

  return { jobs, isLoading, lastUpdated, refresh };
}
