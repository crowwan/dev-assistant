import React from 'react';
import { Box, Text } from 'ink';

interface LogViewerProps {
  jobName: string;
  lines: string[];
  isLoading: boolean;
}

// 로그 뷰어 컴포넌트
export function LogViewer({
  jobName,
  lines,
  isLoading,
}: LogViewerProps): React.ReactElement {
  return (
    <Box flexDirection="column" marginTop={1}>
      <Box justifyContent="space-between">
        <Text bold color="white">
          최근 로그 ({jobName})
        </Text>
        <Text dimColor>[Tab: 전환]</Text>
      </Box>

      <Text dimColor>{'─'.repeat(55)}</Text>

      <Box flexDirection="column" height={8}>
        {isLoading ? (
          <Text dimColor>로딩 중...</Text>
        ) : lines.length === 0 ? (
          <Text dimColor>로그 없음</Text>
        ) : (
          lines.slice(-7).map((line, index) => (
            <Text key={index} wrap="truncate">
              {formatLogLine(line)}
            </Text>
          ))
        )}
      </Box>
    </Box>
  );
}

// 로그 라인 포맷팅
function formatLogLine(line: string): React.ReactElement {
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
