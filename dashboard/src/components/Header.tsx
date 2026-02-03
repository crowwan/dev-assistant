import React from 'react';
import { Box, Text } from 'ink';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface HeaderProps {
  lastUpdated: Date | null;
}

// 대시보드 헤더 컴포넌트
export function Header({ lastUpdated }: HeaderProps): React.ReactElement {
  const now = new Date();
  const timeStr = format(now, 'yyyy-MM-dd HH:mm:ss', { locale: ko });

  return (
    <Box
      borderStyle="round"
      borderColor="cyan"
      paddingX={1}
      justifyContent="space-between"
    >
      <Text bold color="cyan">
        Dev Assistant Dashboard
      </Text>
      <Text dimColor>{timeStr}</Text>
    </Box>
  );
}
