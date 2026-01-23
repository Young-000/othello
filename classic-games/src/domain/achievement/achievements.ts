/**
 * Achievement Definitions
 *
 * Defines all available achievements in the game.
 * Each achievement has an id, name, description, icon, category, and unlock condition.
 */

import { Achievement } from './types';

// All game IDs in the system
export const ALL_GAME_IDS = [
  'klondike',
  'freecell',
  'spider',
  'pyramid',
  '2048',
  'sudoku',
  'minesweeper',
  'memory',
  'button-masher',
  'timer-challenge',
  'reaction-test',
] as const;

export type GameId = typeof ALL_GAME_IDS[number];

/**
 * All achievements in the game
 */
export const ACHIEVEMENTS: Achievement[] = [
  // === Game Category (First Wins) ===
  {
    id: 'first_win',
    name: '첫 승리',
    description: '아무 게임에서 첫 승리를 거두세요',
    icon: '\uD83C\uDFC6', // Trophy
    category: 'game',
    condition: {
      type: 'total_wins',
      threshold: 1,
    },
  },
  {
    id: 'klondike_win',
    name: '클론다이크 마스터',
    description: 'Klondike 솔리테어에서 승리하세요',
    icon: '\uD83C\uDCCF', // Playing card
    category: 'game',
    condition: {
      type: 'game_win',
      gameId: 'klondike',
    },
  },
  {
    id: 'freecell_win',
    name: '프리셀 전략가',
    description: 'Freecell에서 승리하세요',
    icon: '\uD83C\uDCB4', // Flower card
    category: 'game',
    condition: {
      type: 'game_win',
      gameId: 'freecell',
    },
  },
  {
    id: 'spider_win',
    name: '스파이더 정복자',
    description: 'Spider 솔리테어에서 승리하세요',
    icon: '\uD83D\uDD77\uFE0F', // Spider
    category: 'game',
    condition: {
      type: 'game_win',
      gameId: 'spider',
    },
  },
  {
    id: 'pyramid_win',
    name: '피라미드 탐험가',
    description: 'Pyramid 솔리테어에서 승리하세요',
    icon: '\uD83D\uDD3A', // Triangle
    category: 'game',
    condition: {
      type: 'game_win',
      gameId: 'pyramid',
    },
  },
  {
    id: '2048_win',
    name: '2048 달성',
    description: '2048 타일을 만드세요',
    icon: '\uD83D\uDD22', // Numbers
    category: 'game',
    condition: {
      type: 'game_win',
      gameId: '2048',
    },
  },
  {
    id: 'sudoku_win',
    name: '스도쿠 해결사',
    description: 'Sudoku 퍼즐을 완성하세요',
    icon: '9\uFE0F\u20E3', // 9
    category: 'game',
    condition: {
      type: 'game_win',
      gameId: 'sudoku',
    },
  },
  {
    id: 'minesweeper_win',
    name: '지뢰 제거 전문가',
    description: 'Minesweeper에서 승리하세요',
    icon: '\uD83D\uDCA3', // Bomb
    category: 'game',
    condition: {
      type: 'game_win',
      gameId: 'minesweeper',
    },
  },
  {
    id: 'memory_win',
    name: '기억력 천재',
    description: 'Memory 게임에서 승리하세요',
    icon: '\uD83E\uDDE0', // Brain
    category: 'game',
    condition: {
      type: 'game_win',
      gameId: 'memory',
    },
  },

  // === Score Category ===
  {
    id: 'button_masher_100',
    name: '버튼 마스터',
    description: 'Button Masher에서 100점 이상 달성하세요',
    icon: '\uD83D\uDC46', // Pointing up
    category: 'score',
    condition: {
      type: 'high_score',
      gameId: 'button-masher',
      threshold: 100,
    },
  },
  {
    id: 'timer_challenge_950',
    name: '시간의 지배자',
    description: 'Timer Challenge에서 950점 이상 달성하세요',
    icon: '\u23F1\uFE0F', // Stopwatch
    category: 'score',
    condition: {
      type: 'high_score',
      gameId: 'timer-challenge',
      threshold: 950,
    },
  },
  {
    id: 'reaction_master',
    name: '번개 반사신경',
    description: 'Reaction Test에서 900점 이상 달성하세요',
    icon: '\u26A1', // Lightning
    category: 'score',
    condition: {
      type: 'high_score',
      gameId: 'reaction-test',
      threshold: 900,
    },
  },
  {
    id: 'total_score_10000',
    name: '점수왕',
    description: '총 누적 점수 10,000점을 달성하세요',
    icon: '\uD83D\uDCB0', // Money bag
    category: 'score',
    condition: {
      type: 'total_score',
      threshold: 10000,
    },
  },
  {
    id: 'total_score_50000',
    name: '전설의 플레이어',
    description: '총 누적 점수 50,000점을 달성하세요',
    icon: '\uD83D\uDC51', // Crown
    category: 'score',
    condition: {
      type: 'total_score',
      threshold: 50000,
    },
  },

  // === Streak Category ===
  {
    id: 'streak_3',
    name: '3일 연속 챌린지',
    description: '3일 연속으로 데일리 챌린지를 완료하세요',
    icon: '\uD83D\uDD25', // Fire
    category: 'streak',
    condition: {
      type: 'streak',
      threshold: 3,
    },
  },
  {
    id: 'streak_7',
    name: '1주일 연속 도전',
    description: '7일 연속으로 데일리 챌린지를 완료하세요',
    icon: '\uD83C\uDF1F', // Glowing star
    category: 'streak',
    condition: {
      type: 'streak',
      threshold: 7,
    },
  },
  {
    id: 'streak_30',
    name: '한 달의 헌신',
    description: '30일 연속으로 데일리 챌린지를 완료하세요',
    icon: '\uD83C\uDFC5', // Medal
    category: 'streak',
    condition: {
      type: 'streak',
      threshold: 30,
    },
  },

  // === Exploration Category ===
  {
    id: 'explorer_5',
    name: '초보 탐험가',
    description: '5개의 다른 게임을 플레이하세요',
    icon: '\uD83D\uDDFA\uFE0F', // Map
    category: 'exploration',
    condition: {
      type: 'games_played',
      threshold: 5,
    },
  },
  {
    id: 'explorer_all',
    name: '완벽한 탐험가',
    description: '모든 11개의 게임을 플레이하세요',
    icon: '\uD83C\uDF0D', // Globe
    category: 'exploration',
    condition: {
      type: 'games_played',
      threshold: 11,
    },
  },
  {
    id: 'perfect_memory',
    name: '완벽한 기억력',
    description: 'Memory 게임을 실수 없이 클리어하세요',
    icon: '\u2728', // Sparkles
    category: 'game',
    condition: {
      type: 'perfect_game',
      gameId: 'memory',
    },
  },
];

/**
 * Get achievement by ID
 */
export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find(a => a.id === id);
}

/**
 * Get achievements by category
 */
export function getAchievementsByCategory(category: Achievement['category']): Achievement[] {
  return ACHIEVEMENTS.filter(a => a.category === category);
}

/**
 * Get total achievement count
 */
export function getTotalAchievementCount(): number {
  return ACHIEVEMENTS.length;
}
