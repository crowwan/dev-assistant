import React from 'react';
import { Box, Text } from 'ink';
import { format, formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { DiscoveredJob } from '../types.js';
import { formatSchedule } from '../utils/schedule.js';

interface JobStatusProps {
  jobs: DiscoveredJob[];
  selectedIndex: number;
  maxVisible?: number; // 최대 표시 개수 (기본 8)
}

// 상태에 따른 아이콘 반환
function getStatusIcon(status: DiscoveredJob['runStatus']): string {
  switch (status) {
    case 'success':
      return '✅';
    case 'running':
      return '⏳';
    case 'failed':
      return '❌';
    case 'skipped':
      return '⏭️';
    case 'pending':
      return '🕐';
    default:
      return '❓';
  }
}

// 상태에 따른 색상 반환
function getStatusColor(status: DiscoveredJob['runStatus']): string {
  switch (status) {
    case 'success':
      return 'green';
    case 'running':
      return 'yellow';
    case 'failed':
      return 'red';
    case 'skipped':
      return 'gray';
    case 'pending':
      return 'blue';
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
  maxVisible = 8,
}: JobStatusProps): React.ReactElement {
  // 스크롤: selectedIndex가 보이도록 오프셋 계산
  const scrollStart = Math.max(0, Math.min(
    selectedIndex - Math.floor(maxVisible / 2),
    Math.max(0, jobs.length - maxVisible)
  ));
  const visibleJobs = jobs.slice(scrollStart, scrollStart + maxVisible);

  // 열 너비 정의
  const colWidths = {
    name: 28,     // displayName이 길 수 있으므로 확대
    status: 4,
    loaded: 6,
    lastRun: 14,
    schedule: 16,
  };

  return (
    <Box flexDirection="column" marginTop={1}>
      <Box justifyContent="space-between">
        <Text bold color="white">작업 상태</Text>
        <Text dimColor>{jobs.length}개 작업</Text>
      </Box>

      {/* 헤더 */}
      <Box marginTop={1}>
        <Text dimColor>
          {'  '}
          <Text bold>{'작업'.padEnd(colWidths.name)}</Text>
          <Text bold>{''.padEnd(colWidths.status)}</Text>
          <Text bold>{'상태'.padEnd(colWidths.loaded)}</Text>
          <Text bold>{'마지막 실행'.padEnd(colWidths.lastRun)}</Text>
          <Text bold>{'스케줄'.padEnd(colWidths.schedule)}</Text>
        </Text>
      </Box>

      {/* 구분선 */}
      <Text dimColor>{'─'.repeat(70)}</Text>

      {/* 위쪽 스크롤 표시 */}
      {scrollStart > 0 && <Text dimColor>  ↑ {scrollStart}개 더</Text>}

      {/* 작업 목록 */}
      {visibleJobs.map((job, visibleIdx) => {
        const actualIndex = scrollStart + visibleIdx;
        const isSelected = actualIndex === selectedIndex;
        const statusIcon = getStatusIcon(job.runStatus);
        const statusColor = getStatusColor(job.runStatus);

        return (
          <Box key={job.label}>
            <Text color={isSelected ? 'cyan' : 'white'}>
              {isSelected ? '▸ ' : '  '}
              <Text bold={isSelected}>
                {job.displayName.slice(0, colWidths.name - 1).padEnd(colWidths.name)}
              </Text>
              <Text color={statusColor}>
                {statusIcon.padEnd(colWidths.status)}
              </Text>
              <Text color={job.isLoaded ? 'green' : 'gray'}>
                {(job.isLoaded ? '활성' : '비활성').padEnd(colWidths.loaded)}
              </Text>
              <Text>{formatRelativeTime(job.lastRun).padEnd(colWidths.lastRun)}</Text>
              <Text dimColor>
                {(job.schedule ? formatSchedule(job.schedule) : '-').padEnd(colWidths.schedule)}
              </Text>
            </Text>
          </Box>
        );
      })}

      {/* 아래쪽 스크롤 표시 */}
      {scrollStart + maxVisible < jobs.length && (
        <Text dimColor>  ↓ {jobs.length - scrollStart - maxVisible}개 더</Text>
      )}
    </Box>
  );
}
