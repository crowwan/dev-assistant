import { describe, it, expect } from 'vitest';
import { getDisplayName, isSystemService } from './plistScanner.js';

describe('plistScanner', () => {
  describe('getDisplayName', () => {
    it('com 접두사를 제거하고 나머지를 반환한다', () => {
      expect(getDisplayName('com.dev-assistant.daily')).toBe('dev-assistant.daily');
    });

    it('com.apple 라벨도 처리한다', () => {
      expect(getDisplayName('com.apple.Finder')).toBe('apple.Finder');
    });

    it('com이 아닌 라벨은 그대로 반환한다', () => {
      expect(getDisplayName('io.salem.ScreenHint')).toBe('io.salem.ScreenHint');
    });

    it('짧은 라벨은 그대로 반환한다', () => {
      expect(getDisplayName('com.short')).toBe('com.short');
    });
  });

  describe('isSystemService', () => {
    it('com.apple.* 을 시스템 서비스로 판별한다', () => {
      expect(isSystemService('com.apple.Finder')).toBe(true);
    });

    it('com.dev-assistant.* 은 시스템 서비스가 아니다', () => {
      expect(isSystemService('com.dev-assistant.daily')).toBe(false);
    });
  });
});
