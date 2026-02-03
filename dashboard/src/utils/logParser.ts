import { readFile } from 'fs/promises';

// 로그 라인 파싱 결과 타입
export interface LogEntry {
  timestamp: Date;
  message: string;
  isStart?: boolean;
  isComplete?: boolean;
}

// 마지막 실행 정보 타입
export interface RunInfo {
  lastRun: Date;
  status: 'success' | 'running' | 'failed' | 'skipped';
}

// 타임스탬프 정규식: [YYYY-MM-DD HH:MM:SS]
const TIMESTAMP_REGEX = /^\[(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\]\s*(.*)$/;

// 로그 라인을 파싱하여 LogEntry 반환
export function parseLogLine(line: string): LogEntry | null {
  const match = line.match(TIMESTAMP_REGEX);
  if (!match) {
    return null;
  }

  const [, timestampStr, message] = match;
  const timestamp = new Date(timestampStr.replace(' ', 'T'));

  return {
    timestamp,
    message: message.trim(),
    isStart: message.includes('시작'),
    isComplete: message.includes('완료'),
  };
}

// 로그 파일에서 마지막 실행 정보 추출
export async function getLastRunInfo(logPath: string): Promise<RunInfo | null> {
  try {
    const content = await readFile(logPath, 'utf-8');
    return getLastRunInfoFromContent(content);
  } catch {
    return null;
  }
}

// 로그 내용에서 마지막 실행 정보 추출 (테스트용으로 분리)
export function getLastRunInfoFromContent(content: string): RunInfo | null {
  const lines = content.trim().split('\n');
  let lastStart: Date | null = null;
  let lastComplete: Date | null = null;
  let isSkipped = false;
  let hasFailed = false;

  for (const line of lines) {
    const entry = parseLogLine(line);

    if (entry?.isStart) {
      lastStart = entry.timestamp;
      lastComplete = null;
      isSkipped = false;
      hasFailed = false;
    }

    if (entry?.isComplete) {
      lastComplete = entry.timestamp;
    }

    // 실패 패턴 감지
    if (
      line.includes('Error:') ||
      line.includes('hit your limit') ||
      line.includes('Connection error')
    ) {
      hasFailed = true;
    }

    // 스킵 패턴 감지
    if (line.includes('주말이므로 스킵')) {
      isSkipped = true;
    }
  }

  if (!lastStart) return null;

  let status: RunInfo['status'] = 'running';
  if (isSkipped) {
    status = 'skipped';
  } else if (lastComplete) {
    status = 'success';
  } else if (hasFailed) {
    status = 'failed';
  }

  return {
    lastRun: lastStart,
    status,
  };
}

// 로그 파일에서 마지막 N줄 읽기
export async function getLastLogLines(logPath: string, lineCount: number = 10): Promise<string[]> {
  try {
    const content = await readFile(logPath, 'utf-8');
    const lines = content.trim().split('\n');
    return lines.slice(-lineCount);
  } catch {
    return [];
  }
}
