import { useState, useEffect, useCallback } from 'react';
import { JOB_DEFINITIONS, type JobStatus } from '../types.js';
import { getLaunchdStatuses } from '../utils/launchd.js';
import { getLastRunInfo } from '../utils/logParser.js';
import { parsePlist, getNextScheduledTime } from '../utils/schedule.js';

// 작업 상태를 주기적으로 조회하는 hook
export function useJobs(pollingInterval: number = 1000) {
  const [jobs, setJobs] = useState<JobStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // 작업 상태 새로고침
  const refresh = useCallback(async () => {
    const labels = JOB_DEFINITIONS.map((job) => job.label);
    const launchdStatuses = await getLaunchdStatuses(labels);

    const jobStatuses: JobStatus[] = await Promise.all(
      JOB_DEFINITIONS.map(async (job, index) => {
        const launchd = launchdStatuses[index];
        const runInfo = await getLastRunInfo(job.logPath);

        // plist에서 스케줄 정보 가져오기
        let nextRun: Date | null = null;
        try {
          const plistInfo = await parsePlist(job.plistPath);
          if (plistInfo.schedule) {
            nextRun = getNextScheduledTime(plistInfo.schedule);
          }
        } catch {
          // plist 파싱 실패 시 무시
        }

        return {
          name: job.name,
          label: job.label,
          isRunning: launchd.isRunning,
          isLoaded: launchd.isLoaded,
          lastRun: runInfo?.lastRun ?? null,
          runStatus: launchd.isRunning ? 'running' : runInfo?.status ?? 'unknown',
          nextRun,
          exitCode: launchd.exitCode,
        };
      })
    );

    setJobs(jobStatuses);
    setLastUpdated(new Date());
    setIsLoading(false);
  }, []);

  // 초기 로드 및 폴링
  useEffect(() => {
    refresh();

    const interval = setInterval(refresh, pollingInterval);
    return () => clearInterval(interval);
  }, [refresh, pollingInterval]);

  return { jobs, isLoading, lastUpdated, refresh };
}
