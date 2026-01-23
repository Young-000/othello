/**
 * Daily Challenge Domain Types
 *
 * Provides interfaces and functions for the daily challenge system.
 * Each day has a deterministic challenge based on the date.
 */

export interface DailyChallenge {
  gameId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  targetScore: number;
  seed: number;
  gameName: string;
  gameIcon: string;
  gamePath: string;
}

export interface ChallengeResult {
  date: string;
  gameId: string;
  completed: boolean;
  score: number;
  targetScore: number;
  completedAt: string;
}

export interface ChallengeData {
  lastPlayedDate: string;
  currentStreak: number;
  longestStreak: number;
  results: ChallengeResult[];
}

// Game configurations for challenges
interface ChallengeGameConfig {
  id: string;
  name: string;
  icon: string;
  path: string;
  baseTargetScore: number;
  scoreVariance: number;
}

const CHALLENGE_GAMES: ChallengeGameConfig[] = [
  {
    id: 'klondike',
    name: 'Klondike',
    icon: '1F0CF', // Playing card emoji
    path: '/klondike',
    baseTargetScore: 800,
    scoreVariance: 200,
  },
  {
    id: 'freecell',
    name: 'Freecell',
    icon: '1F3B4', // Flower card emoji
    path: '/freecell',
    baseTargetScore: 700,
    scoreVariance: 200,
  },
  {
    id: 'spider',
    name: 'Spider',
    icon: '1F577', // Spider emoji
    path: '/spider',
    baseTargetScore: 600,
    scoreVariance: 200,
  },
  {
    id: 'pyramid',
    name: 'Pyramid',
    icon: '1F53A', // Triangle emoji
    path: '/pyramid',
    baseTargetScore: 1000,
    scoreVariance: 300,
  },
  {
    id: '2048',
    name: '2048',
    icon: '1F522', // Numbers emoji
    path: '/2048',
    baseTargetScore: 5000,
    scoreVariance: 2000,
  },
  {
    id: 'sudoku',
    name: 'Sudoku',
    icon: '0039FE0F20E3', // 9 emoji
    path: '/sudoku',
    baseTargetScore: 400,
    scoreVariance: 100,
  },
  {
    id: 'minesweeper',
    name: 'Minesweeper',
    icon: '1F4A3', // Bomb emoji
    path: '/minesweeper',
    baseTargetScore: 400,
    scoreVariance: 100,
  },
  {
    id: 'memory',
    name: 'Memory',
    icon: '1F9E0', // Brain emoji
    path: '/memory',
    baseTargetScore: 700,
    scoreVariance: 200,
  },
  {
    id: 'button-masher',
    name: 'Button Masher',
    icon: '1F446', // Pointing up emoji
    path: '/button-masher',
    baseTargetScore: 80,
    scoreVariance: 20,
  },
  {
    id: 'timer-challenge',
    name: 'Timer Challenge',
    icon: '23F1', // Stopwatch emoji
    path: '/timer-challenge',
    baseTargetScore: 900,
    scoreVariance: 50,
  },
  {
    id: 'reaction-test',
    name: 'Reaction Test',
    icon: '26A1', // Lightning emoji
    path: '/reaction-test',
    baseTargetScore: 700,
    scoreVariance: 200,
  },
];

// Game icon mapping (using actual emoji characters)
const GAME_ICONS: Record<string, string> = {
  'klondike': '\uD83C\uDCCF',
  'freecell': '\uD83C\uDCB4',
  'spider': '\uD83D\uDD77\uFE0F',
  'pyramid': '\uD83D\uDD3A',
  '2048': '\uD83D\uDD22',
  'sudoku': '9\uFE0F\u20E3',
  'minesweeper': '\uD83D\uDCA3',
  'memory': '\uD83E\uDDE0',
  'button-masher': '\uD83D\uDC46',
  'timer-challenge': '\u23F1\uFE0F',
  'reaction-test': '\u26A1',
};

/**
 * Simple seeded random number generator (mulberry32)
 * Produces deterministic results for the same seed
 */
function seededRandom(seed: number): () => number {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/**
 * Generates a seed from a date string
 * The seed is deterministic for the same date
 */
function dateToSeed(dateString: string): number {
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    const char = dateString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Gets today's date in YYYY-MM-DD format (local timezone)
 */
export function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Generates a daily challenge based on the date
 * The challenge is deterministic - same date always produces same challenge
 */
export function generateDailyChallenge(dateString?: string): DailyChallenge {
  const date = dateString || getTodayDateString();
  const seed = dateToSeed(date);
  const random = seededRandom(seed);

  // Select a game based on the date
  const gameIndex = Math.floor(random() * CHALLENGE_GAMES.length);
  const game = CHALLENGE_GAMES[gameIndex];

  // Calculate target score with some variance
  const variance = Math.floor(random() * game.scoreVariance * 2) - game.scoreVariance;
  const targetScore = game.baseTargetScore + variance;

  return {
    gameId: game.id,
    date,
    targetScore,
    seed,
    gameName: game.name,
    gameIcon: GAME_ICONS[game.id] || '\uD83C\uDFAE',
    gamePath: game.path,
  };
}

/**
 * Creates initial challenge data
 */
export function createInitialChallengeData(): ChallengeData {
  return {
    lastPlayedDate: '',
    currentStreak: 0,
    longestStreak: 0,
    results: [],
  };
}

/**
 * Type guard for ChallengeData
 */
export function isChallengeData(obj: unknown): obj is ChallengeData {
  if (!obj || typeof obj !== 'object') return false;
  const data = obj as Record<string, unknown>;
  return (
    typeof data.lastPlayedDate === 'string' &&
    typeof data.currentStreak === 'number' &&
    typeof data.longestStreak === 'number' &&
    Array.isArray(data.results)
  );
}

/**
 * Type guard for ChallengeResult
 */
export function isChallengeResult(obj: unknown): obj is ChallengeResult {
  if (!obj || typeof obj !== 'object') return false;
  const result = obj as Record<string, unknown>;
  return (
    typeof result.date === 'string' &&
    typeof result.gameId === 'string' &&
    typeof result.completed === 'boolean' &&
    typeof result.score === 'number' &&
    typeof result.targetScore === 'number' &&
    typeof result.completedAt === 'string'
  );
}
