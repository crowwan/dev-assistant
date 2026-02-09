import React from 'react';
import { Box, Text } from 'ink';
import type { ViewMode, FocusArea } from '../types.js';

interface FooterProps {
  viewMode: ViewMode;
  focusArea: FocusArea;
}

// 하단 도움말 컴포넌트 - 뷰 모드/포커스에 따라 다른 안내 표시
export function Footer({ viewMode, focusArea }: FooterProps): React.ReactElement {
  let helpText = '';

  switch (viewMode) {
    case 'main':
      if (focusArea === 'jobs') {
        helpText = '[↑↓] 선택  [Tab] 로그  [Enter] 전체로그  [e] 편집  [r] 새로고침  [q] 종료';
      } else {
        helpText = '[↑↓] 스크롤  [Tab] 작업목록  [Enter] 전체로그  [q] 종료';
      }
      break;
    case 'fullLog':
      helpText = '[↑↓] 스크롤  [ESC] 돌아가기  [q] 종료';
      break;
    case 'scheduleEdit':
      helpText = '[h] 시간  [m] 분  [w] 요일  [ESC] 취소  [q] 종료';
      break;
  }

  return (
    <Box
      borderStyle="single"
      borderColor="gray"
      paddingX={1}
      marginTop={1}
    >
      <Text dimColor>{helpText}</Text>
    </Box>
  );
}
