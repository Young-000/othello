// OddEven - Quickly determine if a number is odd or even

export type Answer = 'odd' | 'even';

export interface OddEvenState {
  currentNumber: number | null;
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

export function createOddEven(): OddEvenState {
  return {
    currentNumber: null,
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

export function getRandomNumber(): number {
  return Math.floor(Math.random() * (MAX_NUMBER - MIN_NUMBER + 1)) + MIN_NUMBER;
}

export function isOdd(num: number): boolean {
  return num % 2 !== 0;
}

export function getCorrectAnswer(num: number): Answer {
  return isOdd(num) ? 'odd' : 'even';
}

export function startGame(state: OddEvenState): OddEvenState {
  if (state.isRunning || state.isComplete) return state;
  return {
    ...state,
    isRunning: true,
    startTime: Date.now(),
    currentNumber: getRandomNumber(),
    lastResponseTime: Date.now(),
    correctCount: 0,
    wrongCount: 0,
    totalAttempts: 0,
    totalResponseTime: 0,
    timeLeft: GAME_DURATION,
  };
}

export function answer(state: OddEvenState, userAnswer: Answer): OddEvenState {
  if (!state.isRunning || state.isComplete || state.currentNumber === null) return state;

  const responseTime = state.lastResponseTime ? Date.now() - state.lastResponseTime : 0;
  const correctAnswer = getCorrectAnswer(state.currentNumber);
  const isCorrect = userAnswer === correctAnswer;

  return {
    ...state,
    correctCount: isCorrect ? state.correctCount + 1 : state.correctCount,
    wrongCount: isCorrect ? state.wrongCount : state.wrongCount + 1,
    totalAttempts: state.totalAttempts + 1,
    totalResponseTime: isCorrect ? state.totalResponseTime + responseTime : state.totalResponseTime,
    currentNumber: getRandomNumber(),
    lastResponseTime: Date.now(),
  };
}

export function updateTime(state: OddEvenState): OddEvenState {
  if (!state.isRunning || !state.startTime) return state;

  const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
  const timeLeft = Math.max(0, GAME_DURATION - elapsed);

  if (timeLeft === 0) {
    return {
      ...state,
      timeLeft: 0,
      isRunning: false,
      isComplete: true,
      currentNumber: null,
    };
  }

  return {
    ...state,
    timeLeft,
  };
}

export function resetGame(): OddEvenState {
  return createOddEven();
}

export function calculateScore(correctCount: number, avgResponseTime: number): number {
  // Base score: 100 points per correct answer
  // Speed bonus: up to 2x multiplier for fast responses (under 400ms)
  const baseScore = correctCount * 100;
  const speedMultiplier = avgResponseTime > 0
    ? Math.max(1, 2 - (avgResponseTime / 800))
    : 1;
  return Math.round(baseScore * speedMultiplier);
}

export function getAverageResponseTime(state: OddEvenState): number {
  if (state.correctCount === 0) return 0;
  return Math.round(state.totalResponseTime / state.correctCount);
}

export function getAccuracy(state: OddEvenState): number {
  if (state.totalAttempts === 0) return 0;
  return Math.round((state.correctCount / state.totalAttempts) * 100);
}

export function getRating(correctCount: number): string {
  if (correctCount >= 12) return '수학 천재!';
  if (correctCount >= 9) return '훌륭해요!';
  if (correctCount >= 6) return '좋아요!';
  if (correctCount >= 3) return '괜찮아요';
  return '더 연습해보세요!';
}
