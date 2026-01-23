// NumberCompare - Click the larger number between two options

export interface NumberPair {
  left: number;
  right: number;
}

export type Answer = 'left' | 'right';

export interface NumberCompareState {
  currentPair: NumberPair | null;
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
export const MIN_NUMBER = 1;
export const MAX_NUMBER = 99;
export const MIN_DIFFERENCE = 3; // Ensure numbers are different enough

export function createNumberCompare(): NumberCompareState {
  return {
    currentPair: null,
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

export function getRandomPair(): NumberPair {
  const left = Math.floor(Math.random() * (MAX_NUMBER - MIN_NUMBER + 1)) + MIN_NUMBER;
  let right: number;

  // Ensure numbers are different by at least MIN_DIFFERENCE
  do {
    right = Math.floor(Math.random() * (MAX_NUMBER - MIN_NUMBER + 1)) + MIN_NUMBER;
  } while (Math.abs(left - right) < MIN_DIFFERENCE);

  return { left, right };
}

export function getCorrectAnswer(pair: NumberPair): Answer {
  return pair.left > pair.right ? 'left' : 'right';
}

export function getLargerNumber(pair: NumberPair): number {
  return Math.max(pair.left, pair.right);
}

export function startGame(state: NumberCompareState): NumberCompareState {
  if (state.isRunning || state.isComplete) return state;
  return {
    ...state,
    isRunning: true,
    startTime: Date.now(),
    currentPair: getRandomPair(),
    lastResponseTime: Date.now(),
    correctCount: 0,
    wrongCount: 0,
    totalAttempts: 0,
    totalResponseTime: 0,
    timeLeft: GAME_DURATION,
  };
}

export function answer(state: NumberCompareState, userAnswer: Answer): NumberCompareState {
  if (!state.isRunning || state.isComplete || !state.currentPair) return state;

  const responseTime = state.lastResponseTime ? Date.now() - state.lastResponseTime : 0;
  const correctAnswer = getCorrectAnswer(state.currentPair);
  const isCorrect = userAnswer === correctAnswer;

  return {
    ...state,
    correctCount: isCorrect ? state.correctCount + 1 : state.correctCount,
    wrongCount: isCorrect ? state.wrongCount : state.wrongCount + 1,
    totalAttempts: state.totalAttempts + 1,
    totalResponseTime: isCorrect ? state.totalResponseTime + responseTime : state.totalResponseTime,
    currentPair: getRandomPair(),
    lastResponseTime: Date.now(),
  };
}

export function updateTime(state: NumberCompareState): NumberCompareState {
  if (!state.isRunning || !state.startTime) return state;

  const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
  const timeLeft = Math.max(0, GAME_DURATION - elapsed);

  if (timeLeft === 0) {
    return {
      ...state,
      timeLeft: 0,
      isRunning: false,
      isComplete: true,
      currentPair: null,
    };
  }

  return {
    ...state,
    timeLeft,
  };
}

export function resetGame(): NumberCompareState {
  return createNumberCompare();
}

export function calculateScore(correctCount: number, avgResponseTime: number): number {
  // Base score: 100 points per correct answer
  // Speed bonus: up to 2x multiplier for fast responses (under 500ms)
  const baseScore = correctCount * 100;
  const speedMultiplier = avgResponseTime > 0
    ? Math.max(1, 2 - (avgResponseTime / 1000))
    : 1;
  return Math.round(baseScore * speedMultiplier);
}

export function getAverageResponseTime(state: NumberCompareState): number {
  if (state.correctCount === 0) return 0;
  return Math.round(state.totalResponseTime / state.correctCount);
}

export function getAccuracy(state: NumberCompareState): number {
  if (state.totalAttempts === 0) return 0;
  return Math.round((state.correctCount / state.totalAttempts) * 100);
}

export function getRating(correctCount: number): string {
  if (correctCount >= 10) return '비교의 달인!';
  if (correctCount >= 8) return '훌륭해요!';
  if (correctCount >= 6) return '좋아요!';
  if (correctCount >= 4) return '괜찮아요';
  return '더 연습해보세요!';
}
