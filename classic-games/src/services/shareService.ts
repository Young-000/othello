/**
 * Share Service
 * Handles sharing game scores via Web Share API or clipboard fallback
 */

export interface ShareData {
  gameId: string;
  gameName: string;
  score: number;
  moves: number;
  time: string;
}

export interface ShareResult {
  success: boolean;
  method: 'share' | 'clipboard' | 'none';
  error?: string;
}

const BASE_URL = 'https://classic-games-kappa.vercel.app';

// Game ID to display name mapping (Korean)
const GAME_NAMES: Record<string, string> = {
  klondike: '클론다이크 솔리테어',
  freecell: '프리셀',
  spider: '스파이더 솔리테어',
  pyramid: '피라미드 솔리테어',
  '2048': '2048',
  sudoku: '스도쿠',
  minesweeper: '지뢰찾기',
  memory: '메모리 매치',
  'button-masher': '버튼 매셔',
  'timer-challenge': '타이머 챌린지',
  'reaction-test': '반응 테스트',
};

/**
 * Get the display name for a game ID
 */
export function getGameDisplayName(gameId: string): string {
  return GAME_NAMES[gameId] || gameId;
}

/**
 * Generate the shareable URL for a game
 */
export function generateShareUrl(gameId: string): string {
  return `${BASE_URL}/${gameId}`;
}

/**
 * Generate the share text message
 */
export function generateShareText(data: ShareData): string {
  const { gameId, score, moves, time } = data;
  const gameName = getGameDisplayName(gameId);
  const shareUrl = generateShareUrl(gameId);

  return `🎮 Classic Games - ${gameName}
🏆 점수: ${score.toLocaleString()}
⏱️ 시간: ${time}
🎯 이동: ${moves}

${shareUrl}`;
}

/**
 * Check if Web Share API is available
 */
export function isWebShareAvailable(): boolean {
  return typeof navigator !== 'undefined' && 'share' in navigator;
}

/**
 * Check if Clipboard API is available
 */
export function isClipboardAvailable(): boolean {
  return typeof navigator !== 'undefined' && 'clipboard' in navigator;
}

/**
 * Share score using Web Share API or clipboard fallback
 */
export async function shareScore(data: ShareData): Promise<ShareResult> {
  const shareText = generateShareText(data);
  const gameName = getGameDisplayName(data.gameId);

  // Try Web Share API first
  if (isWebShareAvailable()) {
    try {
      await navigator.share({
        title: `Classic Games - ${gameName}`,
        text: shareText,
        url: generateShareUrl(data.gameId),
      });
      return { success: true, method: 'share' };
    } catch (error) {
      // User cancelled or share failed
      if (error instanceof Error && error.name === 'AbortError') {
        // User cancelled, not an error
        return { success: false, method: 'none', error: 'cancelled' };
      }
      // Fall through to clipboard
      console.warn('Web Share failed, trying clipboard:', error);
    }
  }

  // Fallback to clipboard
  if (isClipboardAvailable()) {
    try {
      await navigator.clipboard.writeText(shareText);
      return { success: true, method: 'clipboard' };
    } catch (error) {
      console.error('Clipboard write failed:', error);
      return {
        success: false,
        method: 'clipboard',
        error: error instanceof Error ? error.message : 'Clipboard access denied',
      };
    }
  }

  // No sharing method available
  return {
    success: false,
    method: 'none',
    error: 'No sharing method available',
  };
}
