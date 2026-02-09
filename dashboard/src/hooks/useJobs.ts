import { useState, useEffect, useCallback } from 'react';
import type { DiscoveredJob } from '../types.js';
import { scanLaunchAgents, getDisplayName } from '../utils/plistScanner.js';
import { getAllLaunchdStatuses } from '../utils/launchd.js';
import { getLastRunInfo } from '../utils/logParser.js';
import { getNextScheduledTime } from '../utils/schedule.js';

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

      // 3. 각 plist에 대해 DiscoveredJob 생성
      const discovered: DiscoveredJob[] = await Promise.all(
        plistInfos.map(async (info) => {
          const launchdStatus = launchdStatuses.get(info.label);
          const logPath = info.standardOutPath ?? null;
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

          const isRunning = launchdStatus?.isRunning ?? false;

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
            runStatus: isRunning ? 'running' : (runInfo?.status ?? 'unknown'),
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
