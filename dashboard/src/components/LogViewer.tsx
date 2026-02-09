import React from 'react';
import { Box, Text } from 'ink';
import { insertRunSeparators } from '../utils/logParser.js';

interface LogPanelProps {
  jobName: string;
  lines: string[];       // getVisibleLines() 결과를 받음
  totalLines: number;
  scrollOffset: number;
  isLoading: boolean;
  isFocused: boolean;    // 포커스 상태 (스크롤 가능 여부 표시)
}

// 스크롤 가능한 로그 패널 컴포넌트
export function LogViewer({
  jobName,
  lines,
  totalLines,
  scrollOffset,
  isLoading,
  isFocused,
}: LogPanelProps): React.ReactElement {
  // 구분선이 삽입된 라인
  const processedLines = insertRunSeparators(lines);

  return (
    <Box flexDirection="column" marginTop={1}>
      <Box justifyContent="space-between">
        <Text bold color={isFocused ? 'cyan' : 'white'}>
          {isFocused ? '\u25b8 ' : '  '}{/* 포커스 표시 마커 */}
          최근 로그 ({jobName})
        </Text>
        <Box>
          {totalLines > 0 && (
            <Text dimColor>
              {scrollOffset > 0 ? `\u2191${scrollOffset} ` : ''}
              {totalLines}줄
            </Text>
          )}
        </Box>
      </Box>

      <Text dimColor>{'\u2500'.repeat(55)}</Text>

      <Box flexDirection="column" height={15}>
        {isLoading ? (
          <Text dimColor>로딩 중...</Text>
        ) : processedLines.length === 0 ? (
          <Text dimColor>로그 없음</Text>
        ) : (
          processedLines.map((line, index) => (
            <Text key={index} wrap="truncate">
              {formatLogLine(line)}
            </Text>
          ))
        )}
      </Box>
    </Box>
  );
}

// 로그 라인 포맷팅 (구분선 처리 포함)
function formatLogLine(line: string): React.ReactElement {
  // 구분선인 경우
  if (line.startsWith('\u2500')) {
    return <Text dimColor>{line}</Text>;
  }

  // 타임스탬프 추출
  const timestampMatch = line.match(/^\[(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\]/);

  if (timestampMatch) {
    const timestamp = timestampMatch[1];
    const message = line.slice(timestampMatch[0].length).trim();

    // 상태에 따른 색상
    let color: string = 'white';
    if (message.includes('완료')) color = 'green';
    else if (message.includes('시작')) color = 'cyan';
    else if (message.includes('Error') || message.includes('실패')) color = 'red';
    else if (message.includes('스킵')) color = 'yellow';

    return (
      <Text>
        <Text dimColor>[{timestamp.split(' ')[1]}]</Text>
        <Text color={color}> {message}</Text>
      </Text>
    );
  }

  // 일반 텍스트
  return <Text dimColor>{line}</Text>;
}
