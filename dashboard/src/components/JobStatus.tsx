import React from 'react';
import { Box, Text } from 'ink';
import { format, formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { JobStatus as JobStatusType } from '../types.js';

interface JobStatusProps {
  jobs: JobStatusType[];
  selectedIndex: number;
}

// 상태에 따른 아이콘 반환
function getStatusIcon(status: JobStatusType['runStatus']): string {
  switch (status) {
    case 'success':
      return '✅';
    case 'running':
      return '⏳';
    case 'failed':
      return '❌';
    case 'skipped':
      return '⏭️';
    default:
      return '❓';
  }
}

// 상태에 따른 색상 반환
function getStatusColor(status: JobStatusType['runStatus']): string {
  switch (status) {
    case 'success':
      return 'green';
    case 'running':
      return 'yellow';
    case 'failed':
      return 'red';
    case 'skipped':
      return 'gray';
    default:
      return 'white';
  }
}

// 날짜를 상대 시간으로 포맷
function formatRelativeTime(date: Date | null): string {
  if (!date) return '-';
  return formatDistanceToNow(date, { addSuffix: true, locale: ko });
}

// 다음 실행 시간 포맷
function formatNextRun(date: Date | null): string {
  if (!date) return '-';

  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  // 24시간 이내면 시간만 표시
  if (diffHours < 24 && diffHours > 0) {
    return format(date, 'HH:mm');
  }

  // 그 외에는 요일 + 시간
  return format(date, 'E HH:mm', { locale: ko });
}

// 작업 상태 테이블 컴포넌트
export function JobStatusTable({
  jobs,
  selectedIndex,
}: JobStatusProps): React.ReactElement {
  // 열 너비 정의
  const colWidths = {
    index: 3,
    name: 18,
    status: 8,
    lastRun: 14,
    nextRun: 12,
  };

  return (
    <Box flexDirection="column" marginTop={1}>
      <Text bold color="white">
        작업 상태
      </Text>

      {/* 헤더 */}
      <Box marginTop={1}>
        <Text dimColor>
          {'  '}
          <Text bold>{'작업'.padEnd(colWidths.name)}</Text>
          <Text bold>{'상태'.padEnd(colWidths.status)}</Text>
          <Text bold>{'마지막 실행'.padEnd(colWidths.lastRun)}</Text>
          <Text bold>{'다음 예정'.padEnd(colWidths.nextRun)}</Text>
        </Text>
      </Box>

      {/* 구분선 */}
      <Text dimColor>{'─'.repeat(55)}</Text>

      {/* 작업 목록 */}
      {jobs.map((job, index) => {
        const isSelected = index === selectedIndex;
        const statusIcon = getStatusIcon(job.runStatus);
        const statusColor = getStatusColor(job.runStatus);

        return (
          <Box key={job.label}>
            <Text color={isSelected ? 'cyan' : 'white'}>
              {isSelected ? '▸ ' : '  '}
              <Text bold={isSelected}>
                {`[${index + 1}] ${job.name}`.padEnd(colWidths.name)}
              </Text>
              <Text color={statusColor}>
                {`${statusIcon}`.padEnd(colWidths.status)}
              </Text>
              <Text>{formatRelativeTime(job.lastRun).padEnd(colWidths.lastRun)}</Text>
              <Text dimColor>{formatNextRun(job.nextRun).padEnd(colWidths.nextRun)}</Text>
            </Text>
          </Box>
        );
      })}
    </Box>
  );
}
