import { useState, useEffect, useCallback } from 'react';
import { watch } from 'fs';
import { readFile } from 'fs/promises';

// 스크롤 가능한 로그 뷰어 Hook
export function useScrollableLog(logPath: string | null, bufferSize: number = 100) {
  const [allLines, setAllLines] = useState<string[]>([]);
  const [scrollOffset, setScrollOffset] = useState(0); // 끝 기준 오프셋 (0 = 가장 최신)
  const [isLoading, setIsLoading] = useState(true);

  // 파일에서 마지막 bufferSize줄 로드
  const reload = useCallback(async () => {
    if (!logPath) {
      setAllLines([]);
      setIsLoading(false);
      return;
    }

    try {
      const content = await readFile(logPath, 'utf-8');
      const lines = content.trim().split('\n');
      setAllLines(lines.slice(-bufferSize));
      setIsLoading(false);
    } catch {
      setAllLines([]);
      setIsLoading(false);
    }
  }, [logPath, bufferSize]);

  // 초기 로드
  useEffect(() => {
    reload();
  }, [reload]);

  // 파일 변경 감시
  useEffect(() => {
    if (!logPath) return;

    let watcher: ReturnType<typeof watch> | null = null;
    try {
      watcher = watch(logPath, (eventType) => {
        if (eventType === 'change') {
          reload();
          // 새 로그가 추가되면 스크롤 오프셋 초기화 (최신으로)
          setScrollOffset(0);
        }
      });
    } catch {
      // 파일이 없거나 감시 실패
    }

    return () => { watcher?.close(); };
  }, [logPath, reload]);

  // 스크롤 위로 이동
  const scrollUp = useCallback((count: number = 1) => {
    setScrollOffset(prev => Math.min(prev + count, Math.max(0, allLines.length - 1)));
  }, [allLines.length]);

  // 스크롤 아래로 이동
  const scrollDown = useCallback((count: number = 1) => {
    setScrollOffset(prev => Math.max(0, prev - count));
  }, []);

  // 맨 아래(최신)로 이동
  const scrollToEnd = useCallback(() => {
    setScrollOffset(0);
  }, []);

  // 맨 위(가장 오래된)로 이동
  const scrollToTop = useCallback(() => {
    setScrollOffset(Math.max(0, allLines.length - 1));
  }, [allLines.length]);

  // 화면에 표시할 줄 반환
  const getVisibleLines = useCallback((visibleCount: number): string[] => {
    if (allLines.length === 0) return [];

    const end = allLines.length - scrollOffset;
    const start = Math.max(0, end - visibleCount);
    return allLines.slice(start, end);
  }, [allLines, scrollOffset]);

  return {
    allLines,
    totalLines: allLines.length,
    scrollOffset,
    scrollUp,
    scrollDown,
    scrollToEnd,
    scrollToTop,
    getVisibleLines,
    isLoading,
    reload,
  };
}
