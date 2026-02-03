import React, { useState, useCallback } from 'react';
import { Box, Text, useApp, useStdin, useInput } from 'ink';
import { Header, JobStatusTable, LogViewer, Footer } from './components/index.js';
import { useJobs } from './hooks/useJobs.js';
import { useLogs } from './hooks/useLogs.js';
import { JOB_DEFINITIONS } from './types.js';

// 키보드 입력이 있는 Interactive 앱 (별도 컴포넌트로 분리)
function InteractiveApp(): React.ReactElement {
  const { exit } = useApp();
  const [selectedJobIndex, setSelectedJobIndex] = useState(0);

  const { jobs, isLoading, lastUpdated, refresh } = useJobs(3000);
  const selectedJob = JOB_DEFINITIONS[selectedJobIndex];
  const { lines: logLines, isLoading: logsLoading } = useLogs(
    selectedJob?.logPath ?? '',
    10
  );

  const handleTab = useCallback(() => {
    setSelectedJobIndex((prev) => (prev + 1) % JOB_DEFINITIONS.length);
  }, []);

  useInput((input: string, key: { tab: boolean }) => {
    if (input === 'q') {
      exit();
      return;
    }
    if (input === 'r') {
      refresh();
      return;
    }
    if (input >= '1' && input <= '4') {
      const index = parseInt(input, 10) - 1;
      if (index >= 0 && index < JOB_DEFINITIONS.length) {
        setSelectedJobIndex(index);
      }
      return;
    }
    if (key.tab) {
      handleTab();
      return;
    }
  });

  if (isLoading) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text bold color="cyan">
          Dev Assistant Dashboard
        </Text>
        <Text dimColor>작업 상태 불러오는 중...</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Header lastUpdated={lastUpdated} />
      <JobStatusTable jobs={jobs} selectedIndex={selectedJobIndex} />
      <LogViewer
        jobName={selectedJob?.name ?? ''}
        lines={logLines}
        isLoading={logsLoading}
      />
      <Footer />
    </Box>
  );
}

// 키보드 입력 없는 ReadOnly 앱
function ReadOnlyApp(): React.ReactElement {
  const [selectedJobIndex] = useState(0);

  const { jobs, isLoading, lastUpdated } = useJobs(3000);
  const selectedJob = JOB_DEFINITIONS[selectedJobIndex];
  const { lines: logLines, isLoading: logsLoading } = useLogs(
    selectedJob?.logPath ?? '',
    10
  );

  if (isLoading) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text bold color="cyan">
          Dev Assistant Dashboard
        </Text>
        <Text dimColor>작업 상태 불러오는 중...</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Header lastUpdated={lastUpdated} />
      <JobStatusTable jobs={jobs} selectedIndex={selectedJobIndex} />
      <LogViewer
        jobName={selectedJob?.name ?? ''}
        lines={logLines}
        isLoading={logsLoading}
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
