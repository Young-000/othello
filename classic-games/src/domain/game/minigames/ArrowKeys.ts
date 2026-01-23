// ArrowKeys - Press the correct arrow key as fast as possible

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface ArrowKeysState {
  currentDirection: Direction | null;
  correctCount: number;
  wrongCount: number;
  totalAttempts: number;
  timeLeft: number;
  isRunning: boolean;
  isComplete: boolean;
  startTime: number | null;
  lastResponseTime: number | null;
  totalResponseTime: number;
}

export const GAME_DURATION = 5; // seconds
export const DIRECTIONS: Direction[] = ['up', 'down', 'left', 'right'];
export const DIRECTION_ARROWS: Record<Direction, string> = {
  up: '↑',
  down: '↓',
  left: '←',
  right: '→',
};
export const DIRECTION_KEYS: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
};

export function createArrowKeys(): ArrowKeysState {
  return {
    currentDirection: null,
    correctCount: 0,
    wrongCount: 0,
    totalAttempts: 0,
    timeLeft: GAME_DURATION,
    isRunning: false,
    isComplete: false,
    startTime: null,
    lastResponseTime: null,
    totalResponseTime: 0,
  };
}

export function getRandomDirection(): Direction {
  return DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
}

export function startGame(state: ArrowKeysState): ArrowKeysState {
  if (state.isRunning || state.isComplete) return state;
  return {
    ...state,
    isRunning: true,
    startTime: Date.now(),
    currentDirection: getRandomDirection(),
    lastResponseTime: Date.now(),
    correctCount: 0,
    wrongCount: 0,
    totalAttempts: 0,
    totalResponseTime: 0,
    timeLeft: GAME_DURATION,
  };
}

export function pressKey(state: ArrowKeysState, key: string): ArrowKeysState {
  if (!state.isRunning || state.isComplete || !state.currentDirection) return state;

  const pressedDirection = DIRECTION_KEYS[key];
  if (!pressedDirection) return state; // Ignore non-arrow keys

  const responseTime = state.lastResponseTime ? Date.now() - state.lastResponseTime : 0;
  const isCorrect = pressedDirection === state.currentDirection;

  return {
    ...state,
    correctCount: isCorrect ? state.correctCount + 1 : state.correctCount,
    wrongCount: isCorrect ? state.wrongCount : state.wrongCount + 1,
    totalAttempts: state.totalAttempts + 1,
    totalResponseTime: isCorrect ? state.totalResponseTime + responseTime : state.totalResponseTime,
    currentDirection: getRandomDirection(),
    lastResponseTime: Date.now(),
  };
}

export function updateTime(state: ArrowKeysState): ArrowKeysState {
  if (!state.isRunning || !state.startTime) return state;

  const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
  const timeLeft = Math.max(0, GAME_DURATION - elapsed);

  if (timeLeft === 0) {
    return {
      ...state,
      timeLeft: 0,
      isRunning: false,
      isComplete: true,
      currentDirection: null,
    };
  }

  return {
    ...state,
    timeLeft,
  };
}

export function resetGame(): ArrowKeysState {
  return createArrowKeys();
}

export function calculateScore(correctCount: number, avgResponseTime: number): number {
  // Base score: 100 points per correct answer
  // Speed bonus: up to 2x multiplier for fast responses (under 300ms)
  const baseScore = correctCount * 100;
  const speedMultiplier = avgResponseTime > 0
    ? Math.max(1, 2 - (avgResponseTime / 600))
    : 1;
  return Math.round(baseScore * speedMultiplier);
}

export function getAverageResponseTime(state: ArrowKeysState): number {
  if (state.correctCount === 0) return 0;
  return Math.round(state.totalResponseTime / state.correctCount);
}

export function getAccuracy(state: ArrowKeysState): number {
  if (state.totalAttempts === 0) return 0;
  return Math.round((state.correctCount / state.totalAttempts) * 100);
}

export function getRating(correctCount: number): string {
  if (correctCount >= 15) return '번개 같은 반사신경!';
  if (correctCount >= 12) return '대단해요!';
  if (correctCount >= 9) return '좋아요!';
  if (correctCount >= 6) return '괜찮아요';
  return '더 연습해보세요!';
}
