import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import type { DiscoveredJob } from '../types.js';
import type { ScheduleInterval } from '../utils/schedule.js';
import { formatSchedule } from '../utils/schedule.js';
import { updateSchedule, reloadJob } from '../utils/plistEditor.js';

// 편집 모드 상태
type EditMode = 'view' | 'editHour' | 'editMinute' | 'editWeekday' | 'confirm' | 'saving' | 'result';

interface ScheduleEditorProps {
  job: DiscoveredJob;
  onDone: () => void; // 편집 완료/취소 시 메인 뷰로 복귀
}

// 요일 이름 매핑
const WEEKDAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

export function ScheduleEditor({ job, onDone }: ScheduleEditorProps): React.ReactElement {
  const schedule = job.schedule;

  // 편집 상태
  const [editMode, setEditMode] = useState<EditMode>('view');
  const [inputBuffer, setInputBuffer] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [resultMessage, setResultMessage] = useState('');

  // 편집 중인 스케줄 값
  const [editedHour, setEditedHour] = useState(schedule?.hour ?? 0);
  const [editedMinute, setEditedMinute] = useState(schedule?.minute ?? 0);
  const [editedWeekday, setEditedWeekday] = useState<number | undefined>(schedule?.weekday);

  // interval 타입은 편집 불가
  const isIntervalType = schedule?.interval !== undefined;

  // 변경 사항 있는지 확인
  function hasChanges(): boolean {
    if (!schedule) return false;
    return (
      editedHour !== (schedule.hour ?? 0) ||
      editedMinute !== (schedule.minute ?? 0) ||
      editedWeekday !== schedule.weekday
    );
  }

  // 변경 전/후 스케줄 포맷
  function formatEditedSchedule(): string {
    const edited: ScheduleInterval = {
      hour: editedHour,
      minute: editedMinute,
      weekday: editedWeekday,
    };
    return formatSchedule(edited);
  }

  // 스케줄 저장 실행
  async function saveSchedule(): Promise<void> {
    setEditMode('saving');
    try {
      const newSchedule: ScheduleInterval = {
        hour: editedHour,
        minute: editedMinute,
        weekday: editedWeekday,
      };
      await updateSchedule(job.plistPath, newSchedule);
      await reloadJob(job.label, job.plistPath);
      setResultMessage('스케줄이 변경되었습니다.');
      setEditMode('result');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setResultMessage(`변경 실패: ${message}`);
      setEditMode('result');
    }
  }

  // 키 입력 처리
  useInput((input, key) => {
    // 결과 화면에서 아무 키나 누르면 복귀
    if (editMode === 'result') {
      onDone();
      return;
    }

    // 저장 중에는 입력 무시
    if (editMode === 'saving') return;

    // ESC: 현재 편집 취소 또는 전체 종료
    if (key.escape) {
      if (editMode === 'view') {
        onDone();
      } else if (editMode === 'confirm') {
        setEditMode('view');
      } else {
        // 편집 모드에서 ESC → view로 복귀
        setInputBuffer('');
        setErrorMessage('');
        setEditMode('view');
      }
      return;
    }

    // 확인 대화상자
    if (editMode === 'confirm') {
      if (input === 'y') {
        void saveSchedule();
      } else if (input === 'n') {
        setEditMode('view');
      }
      return;
    }

    // 기본 view 모드: h, m, w로 편집 시작
    if (editMode === 'view') {
      if (isIntervalType) return; // interval 타입은 편집 불가

      if (input === 'h') {
        setEditMode('editHour');
        setInputBuffer('');
        setErrorMessage('');
      } else if (input === 'm') {
        setEditMode('editMinute');
        setInputBuffer('');
        setErrorMessage('');
      } else if (input === 'w') {
        setEditMode('editWeekday');
        setInputBuffer('');
        setErrorMessage('');
      }
      return;
    }

    // 숫자 입력 모드 (editHour, editMinute, editWeekday)
    if (key.return) {
      // Enter: 값 확정
      const value = parseInt(inputBuffer, 10);

      if (isNaN(value)) {
        setErrorMessage('숫자를 입력하세요');
        return;
      }

      if (editMode === 'editHour') {
        if (value < 0 || value > 23) {
          setErrorMessage('0-23 범위로 입력하세요');
          return;
        }
        setEditedHour(value);
      } else if (editMode === 'editMinute') {
        if (value < 0 || value > 59) {
          setErrorMessage('0-59 범위로 입력하세요');
          return;
        }
        setEditedMinute(value);
      } else if (editMode === 'editWeekday') {
        if (value < 0 || value > 6) {
          setErrorMessage('0-6 범위로 입력하세요 (0=일, 1=월, ..., 6=토)');
          return;
        }
        setEditedWeekday(value);
      }

      setInputBuffer('');
      setErrorMessage('');

      // 변경사항이 있으면 바로 확인 프롬프트로
      // 주의: setEdited* 후 바로 hasChanges() 호출하면 아직 이전 state일 수 있음
      // 따라서 여기서는 직접 비교
      const willHaveChanges = (() => {
        if (!schedule) return false;
        if (editMode === 'editHour') return value !== (schedule.hour ?? 0) || editedMinute !== (schedule.minute ?? 0) || editedWeekday !== schedule.weekday;
        if (editMode === 'editMinute') return editedHour !== (schedule.hour ?? 0) || value !== (schedule.minute ?? 0) || editedWeekday !== schedule.weekday;
        if (editMode === 'editWeekday') return editedHour !== (schedule.hour ?? 0) || editedMinute !== (schedule.minute ?? 0) || value !== schedule.weekday;
        return false;
      })();

      if (willHaveChanges) {
        setEditMode('confirm');
      } else {
        setEditMode('view');
      }
      return;
    }

    // 백스페이스: 마지막 문자 삭제
    if (key.backspace || key.delete) {
      setInputBuffer(prev => prev.slice(0, -1));
      setErrorMessage('');
      return;
    }

    // 숫자 입력 (최대 2자리)
    if (/^\d$/.test(input) && inputBuffer.length < 2) {
      setInputBuffer(prev => prev + input);
      setErrorMessage('');
    }
  });

  // interval 타입 안내
  if (isIntervalType) {
    return (
      <Box flexDirection="column">
        <Text bold color="cyan">스케줄 편집 - {job.displayName}</Text>
        <Text dimColor>{'\u2500'.repeat(40)}</Text>
        <Box marginTop={1}>
          <Text>현재 스케줄: </Text>
          <Text color="yellow">{schedule ? formatSchedule(schedule) : '없음'}</Text>
        </Box>
        <Box marginTop={1}>
          <Text color="gray">간격(interval) 타입은 편집을 지원하지 않습니다.</Text>
        </Box>
        <Box marginTop={1}>
          <Text dimColor>ESC로 돌아가기</Text>
        </Box>
      </Box>
    );
  }

  // 스케줄이 없는 경우
  if (!schedule) {
    return (
      <Box flexDirection="column">
        <Text bold color="cyan">스케줄 편집 - {job.displayName}</Text>
        <Text dimColor>{'\u2500'.repeat(40)}</Text>
        <Box marginTop={1}>
          <Text color="gray">스케줄 정보가 없습니다.</Text>
        </Box>
        <Box marginTop={1}>
          <Text dimColor>ESC로 돌아가기</Text>
        </Box>
      </Box>
    );
  }

  // 결과 화면
  if (editMode === 'result') {
    return (
      <Box flexDirection="column">
        <Text bold color="cyan">스케줄 편집 - {job.displayName}</Text>
        <Text dimColor>{'\u2500'.repeat(40)}</Text>
        <Box marginTop={1}>
          <Text color={resultMessage.startsWith('변경 실패') ? 'red' : 'green'}>
            {resultMessage}
          </Text>
        </Box>
        <Box marginTop={1}>
          <Text dimColor>아무 키나 눌러서 돌아가기</Text>
        </Box>
      </Box>
    );
  }

  // 저장 중
  if (editMode === 'saving') {
    return (
      <Box flexDirection="column">
        <Text bold color="cyan">스케줄 편집 - {job.displayName}</Text>
        <Text dimColor>{'\u2500'.repeat(40)}</Text>
        <Box marginTop={1}>
          <Text color="yellow">저장 중...</Text>
        </Box>
      </Box>
    );
  }

  // 확인 프롬프트
  if (editMode === 'confirm') {
    return (
      <Box flexDirection="column">
        <Text bold color="cyan">스케줄 편집 - {job.displayName}</Text>
        <Text dimColor>{'\u2500'.repeat(40)}</Text>
        <Box marginTop={1} flexDirection="column">
          <Text>
            {formatSchedule(schedule)} <Text color="yellow">{'\u2192'}</Text> {formatEditedSchedule()}
          </Text>
          <Box marginTop={1}>
            <Text bold color="yellow">변경하시겠습니까? (y/n)</Text>
          </Box>
        </Box>
      </Box>
    );
  }

  // 편집 항목 라벨
  const editingLabel = editMode === 'editHour' ? '시간' : editMode === 'editMinute' ? '분' : editMode === 'editWeekday' ? '요일' : '';

  return (
    <Box flexDirection="column">
      <Text bold color="cyan">스케줄 편집 - {job.displayName}</Text>
      <Text dimColor>{'\u2500'.repeat(40)}</Text>

      <Box marginTop={1}>
        <Text>현재 스케줄: </Text>
        <Text color="yellow">{formatSchedule(schedule)}</Text>
        {hasChanges() && (
          <Text color="gray"> {'\u2192'} {formatEditedSchedule()}</Text>
        )}
      </Box>

      <Box marginTop={1} flexDirection="column">
        <Text>
          <Text color={editMode === 'editHour' ? 'green' : 'white'}>[h] 시간: </Text>
          <Text bold>{String(editedHour).padStart(2, '0')}</Text>
          {editMode === 'editHour' && (
            <Text color="green"> {'\u2190'} {inputBuffer || '_'}</Text>
          )}
        </Text>
        <Text>
          <Text color={editMode === 'editMinute' ? 'green' : 'white'}>[m] 분:   </Text>
          <Text bold>{String(editedMinute).padStart(2, '0')}</Text>
          {editMode === 'editMinute' && (
            <Text color="green"> {'\u2190'} {inputBuffer || '_'}</Text>
          )}
        </Text>
        <Text>
          <Text color={editMode === 'editWeekday' ? 'green' : 'white'}>[w] 요일: </Text>
          <Text bold>
            {editedWeekday !== undefined ? `${editedWeekday} (${WEEKDAY_NAMES[editedWeekday]})` : '-'}
          </Text>
          {editMode === 'editWeekday' && (
            <Text color="green"> {'\u2190'} {inputBuffer || '_'}</Text>
          )}
        </Text>
      </Box>

      {errorMessage && (
        <Box marginTop={1}>
          <Text color="red">{errorMessage}</Text>
        </Box>
      )}

      <Box marginTop={1}>
        {editMode === 'view' ? (
          <Text dimColor>편집할 항목의 키를 누르세요 | ESC 돌아가기</Text>
        ) : (
          <Text dimColor>{editingLabel} 입력 후 Enter | ESC 취소</Text>
        )}
      </Box>
    </Box>
  );
}
