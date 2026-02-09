import type { ScheduleInterval } from './utils/schedule.js';

// 동적으로 탐색된 크론잡 정보
export interface DiscoveredJob {
  label: string; // launchd 레이블 (예: "com.dev-assistant.daily")
  displayName: string; // 표시 이름 (예: "daily-summary")
  plistPath: string;
  script: string | null; // 실행 스크립트 경로
  schedule: ScheduleInterval | null; // 스케줄 정보
  logPath: string | null; // 표준 출력 로그 경로
  errorLogPath: string | null; // 에러 로그 경로
  isLoaded: boolean;
  isRunning: boolean;
  pid: number | null;
  exitCode: number | null;
  lastRun: Date | null;
  runStatus: 'success' | 'running' | 'failed' | 'skipped' | 'unknown';
  nextRun: Date | null;
}

// 대시보드 뷰 모드
export type ViewMode = 'main' | 'fullLog' | 'scheduleEdit';

// 포커스 영역
export type FocusArea = 'jobs' | 'logs';
