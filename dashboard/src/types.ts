// 작업 정의 타입
export interface JobDefinition {
  name: string; // 표시 이름 (예: "daily-summary")
  label: string; // launchd 레이블 (예: "com.dev-assistant.daily")
  plistPath: string;
  logPath: string;
}

// 작업 상태 타입
export interface JobStatus {
  name: string;
  label: string;
  isRunning: boolean;
  isLoaded: boolean;
  lastRun: Date | null;
  runStatus: 'success' | 'running' | 'failed' | 'skipped' | 'unknown';
  nextRun: Date | null;
  exitCode: number | null;
}

// 대시보드에서 관리할 작업 목록
export const JOB_DEFINITIONS: JobDefinition[] = [
  {
    name: 'daily-summary',
    label: 'com.dev-assistant.daily',
    plistPath: '/Users/kimjin-wan/Works/personal/dev-assistant/scripts/com.dev-assistant.daily.local.plist',
    logPath: '/Users/kimjin-wan/Works/personal/dev-assistant/logs/daily-summary.log',
  },
  {
    name: 'standup',
    label: 'com.dev-assistant.standup',
    plistPath: '/Users/kimjin-wan/Works/personal/dev-assistant/scripts/com.dev-assistant.standup.local.plist',
    logPath: '/Users/kimjin-wan/Works/personal/dev-assistant/logs/standup.log',
  },
  {
    name: 'burnout-radar',
    label: 'com.dev-assistant.burnout',
    plistPath: '/Users/kimjin-wan/Works/personal/dev-assistant/scripts/com.dev-assistant.burnout.plist',
    logPath: '/Users/kimjin-wan/Works/personal/dev-assistant/logs/launchd-burnout.log',
  },
  {
    name: 'backlog-analyzer',
    label: 'com.dev-assistant.backlog-analyzer',
    plistPath: '/Users/kimjin-wan/Works/personal/dev-assistant/scripts/com.dev-assistant.backlog-analyzer.plist',
    logPath: '/Users/kimjin-wan/Works/personal/dev-assistant/logs/backlog-analyzer.log',
  },
];
