import { readdir } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';
import { parsePlist } from './schedule.js';
import type { PlistInfo } from './schedule.js';

// 시스템 서비스 필터 패턴
const SYSTEM_PREFIXES = ['com.apple.'];

// label에서 표시 이름 생성
// "com.dev-assistant.daily" -> "dev-assistant.daily"
// "com.google.GoogleUpdater.wake" -> "google.GoogleUpdater.wake"
export function getDisplayName(label: string): string {
  const parts = label.split('.');
  // "com.X.Y..." 형태일 때만 com 접두사 제거 (3개 이상 파트 필요)
  if (parts.length > 2 && parts[0] === 'com') {
    return parts.slice(1).join('.');
  }
  return label;
}

// 시스템 서비스 여부 확인
export function isSystemService(label: string): boolean {
  return SYSTEM_PREFIXES.some(prefix => label.startsWith(prefix));
}

// ~/Library/LaunchAgents/*.plist 스캔
export async function scanLaunchAgents(): Promise<PlistInfo[]> {
  const launchAgentsDir = join(homedir(), 'Library', 'LaunchAgents');

  try {
    const files = await readdir(launchAgentsDir);
    const plistFiles = files.filter(f => f.endsWith('.plist'));

    const results: PlistInfo[] = [];

    for (const file of plistFiles) {
      const fullPath = join(launchAgentsDir, file);
      try {
        const info = await parsePlist(fullPath);
        // plist 파일 경로 설정
        info.plistPath = fullPath;
        // 시스템 서비스는 제외
        if (!isSystemService(info.label)) {
          results.push(info);
        }
      } catch {
        // 파싱 실패한 파일은 무시
      }
    }

    return results;
  } catch {
    return [];
  }
}
