import { useState, useEffect, useCallback } from 'react';
import { watch } from 'fs';
import { getLastLogLines } from '../utils/logParser.js';

// 로그 파일을 감시하고 마지막 N줄을 반환하는 hook
export function useLogs(logPath: string, lineCount: number = 10) {
  const [lines, setLines] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 로그 다시 읽기
  const reload = useCallback(async () => {
    const newLines = await getLastLogLines(logPath, lineCount);
    setLines(newLines);
    setIsLoading(false);
  }, [logPath, lineCount]);

  // 초기 로드
  useEffect(() => {
    reload();
  }, [reload]);

  // 파일 변경 감시
  useEffect(() => {
    let watcher: ReturnType<typeof watch> | null = null;

    try {
      watcher = watch(logPath, (eventType) => {
        if (eventType === 'change') {
          reload();
        }
      });
    } catch {
      // 파일이 없거나 감시 실패 시 무시
    }

    return () => {
      watcher?.close();
    };
  }, [logPath, reload]);

  return { lines, isLoading, reload };
}
