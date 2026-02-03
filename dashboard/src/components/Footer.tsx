import React from 'react';
import { Box, Text } from 'ink';

// 하단 도움말 컴포넌트
export function Footer(): React.ReactElement {
  return (
    <Box
      borderStyle="single"
      borderColor="gray"
      paddingX={1}
      marginTop={1}
    >
      <Text dimColor>
        <Text color="cyan">[q]</Text> 종료{'  '}
        <Text color="cyan">[r]</Text> 새로고침{'  '}
        <Text color="cyan">[1-4]</Text> 작업 선택{'  '}
        <Text color="cyan">[Tab]</Text> 로그 전환
      </Text>
    </Box>
  );
}
