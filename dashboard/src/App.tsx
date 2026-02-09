import React, { useState } from 'react';
import { Box, Text, useApp, useStdin, useInput } from 'ink';
import { Header, JobStatusTable, LogViewer, Footer, ScheduleEditor } from './components/index.js';
import { useJobs } from './hooks/useJobs.js';
import { useScrollableLog } from './hooks/useScrollableLog.js';
import type { ViewMode, FocusArea } from './types.js';

// 키보드 입력이 있는 Interactive 앱
function InteractiveApp(): React.ReactElement {
  const { exit } = useApp();

  // 뷰 상태
  const [viewMode, setViewMode] = useState<ViewMode>('main');
  const [selectedJobIndex, setSelectedJobIndex] = useState(0);
  const [focusArea, setFocusArea] = useState<FocusArea>('jobs');

  // 데이터
  const { jobs, isLoading, lastUpdated, refresh } = useJobs(5000);

  // 선택된 작업의 로그
  const selectedJob = jobs[selectedJobIndex];
  const logPath = selectedJob?.logPath ?? null;
  const log = useScrollableLog(logPath, 100);

  // 메인 뷰 키 처리
  function handleMainViewInput(input: string, key: { tab: boolean; upArrow: boolean; downArrow: boolean; return: boolean; escape: boolean }) {
    // r: 새로고침
    if (input === 'r') {
      refresh();
      return;
    }

    // Tab: 포커스 전환 (jobs <-> logs)
    if (key.tab) {
      setFocusArea(prev => prev === 'jobs' ? 'logs' : 'jobs');
      return;
    }

    // Enter: 전체 로그 모드
    if (key.return) {
      if (selectedJob?.logPath) {
        setViewMode('fullLog');
      }
      return;
    }

    // e: 스케줄 편집
    if (input === 'e') {
      if (selectedJob?.schedule) {
        setViewMode('scheduleEdit');
      }
      return;
    }

    // 방향키: 포커스 영역에 따라 동작
    if (focusArea === 'jobs') {
      if (key.upArrow) {
        setSelectedJobIndex(prev => Math.max(0, prev - 1));
      } else if (key.downArrow) {
        setSelectedJobIndex(prev => Math.min(jobs.length - 1, prev + 1));
      }
    } else {
      // logs 영역 포커스
      if (key.upArrow) {
        log.scrollUp();
      } else if (key.downArrow) {
        log.scrollDown();
      }
    }
  }

  // 전체 로그 뷰 키 처리
  function handleFullLogInput(_input: string, key: { upArrow: boolean; downArrow: boolean; escape: boolean }) {
    if (key.escape) {
      setViewMode('main');
      return;
    }
    if (key.upArrow) log.scrollUp();
    if (key.downArrow) log.scrollDown();
  }

  // 키보드 입력 처리
  // scheduleEdit 모드에서는 ScheduleEditor가 자체 useInput을 사용하므로
  // App.tsx에서는 q키 종료만 처리한다
  useInput((input: string, key: { tab: boolean; upArrow: boolean; downArrow: boolean; return: boolean; escape: boolean }) => {
    // scheduleEdit 모드: ScheduleEditor가 키 입력을 처리하므로 q만 처리
    if (viewMode === 'scheduleEdit') {
      return;
    }

    // 공통: q로 종료
    if (input === 'q') {
      exit();
      return;
    }

    // viewMode별 키 처리
    if (viewMode === 'main') {
      handleMainViewInput(input, key);
    } else if (viewMode === 'fullLog') {
      handleFullLogInput(input, key);
    }
  });

  // 로딩 중
  if (isLoading) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text bold color="cyan">Dev Assistant Dashboard</Text>
        <Text dimColor>작업 상태 불러오는 중...</Text>
      </Box>
    );
  }

  // 메인 뷰
  if (viewMode === 'main') {
    const visibleLines = log.getVisibleLines(13);
    return (
      <Box flexDirection="column" padding={1}>
        <Header lastUpdated={lastUpdated} />
        <JobStatusTable jobs={jobs} selectedIndex={selectedJobIndex} />
        <LogViewer
          jobName={selectedJob?.displayName ?? ''}
          lines={visibleLines}
          totalLines={log.totalLines}
          scrollOffset={log.scrollOffset}
          isLoading={log.isLoading}
          isFocused={focusArea === 'logs'}
        />
        <Footer viewMode={viewMode} focusArea={focusArea} />
      </Box>
    );
  }

  // 전체 로그 뷰
  if (viewMode === 'fullLog') {
    const visibleLines = log.getVisibleLines(20);
    return (
      <Box flexDirection="column" padding={1}>
        <Box justifyContent="space-between">
          <Text bold color="cyan">전체 로그 - {selectedJob?.displayName ?? ''}</Text>
          <Text dimColor>{log.totalLines}줄 | 오프셋: {log.scrollOffset}</Text>
        </Box>
        <Text dimColor>{'\u2500'.repeat(70)}</Text>
        <Box flexDirection="column" height={20}>
          {visibleLines.map((line, i) => (
            <Text key={i} wrap="truncate" dimColor>{line}</Text>
          ))}
        </Box>
        <Footer viewMode={viewMode} focusArea={focusArea} />
      </Box>
    );
  }

  // 스케줄 편집 뷰
  if (viewMode === 'scheduleEdit' && selectedJob) {
    return (
      <Box flexDirection="column" padding={1}>
        <ScheduleEditor
          job={selectedJob}
          onDone={() => {
            setViewMode('main');
            refresh(); // 변경 반영을 위해 새로고침
          }}
        />
        <Footer viewMode={viewMode} focusArea={focusArea} />
      </Box>
    );
  }

  // fallback (도달하지 않아야 함)
  return (
    <Box flexDirection="column" padding={1}>
      <Text dimColor>알 수 없는 뷰 모드</Text>
    </Box>
  );
}

// 키보드 입력 없는 ReadOnly 앱
function ReadOnlyApp(): React.ReactElement {
  const { jobs, isLoading, lastUpdated } = useJobs(5000);
  const selectedJob = jobs[0];
  const logPath = selectedJob?.logPath ?? null;
  const log = useScrollableLog(logPath, 100);

  if (isLoading) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text bold color="cyan">Dev Assistant Dashboard</Text>
        <Text dimColor>작업 상태 불러오는 중...</Text>
      </Box>
    );
  }

  const visibleLines = log.getVisibleLines(13);
  return (
    <Box flexDirection="column" padding={1}>
      <Header lastUpdated={lastUpdated} />
      <JobStatusTable jobs={jobs} selectedIndex={0} />
      <LogViewer
        jobName={selectedJob?.displayName ?? ''}
        lines={visibleLines}
        totalLines={log.totalLines}
        scrollOffset={log.scrollOffset}
        isLoading={log.isLoading}
        isFocused={false}
      />
      <Box marginTop={1}>
        <Text dimColor>
          (키보드 단축키 사용하려면 TTY에서 실행하세요. Ctrl+C로 종료)
        </Text>
      </Box>
    </Box>
  );
}

// 메인 앱 - raw mode 지원 여부에 따라 분기
export function App(): React.ReactElement {
  const { isRawModeSupported } = useStdin();

  if (isRawModeSupported) {
    return <InteractiveApp />;
  }

  return <ReadOnlyApp />;
}
