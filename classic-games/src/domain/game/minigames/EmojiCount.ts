// EmojiCount - Count specific emojis in a grid

export interface EmojiGrid {
  emojis: string[];
  targetEmoji: string;
  correctCount: number;
  options: number[];
}

export interface EmojiCountState {
  currentGrid: EmojiGrid | null;
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
export const GRID_SIZE = 16; // 4x4 grid
export const MIN_TARGET_COUNT = 2;
export const MAX_TARGET_COUNT = 6;
export const NUM_OPTIONS = 4;

export const EMOJI_SETS = [
  ['🍎', '🍊', '🍋', '🍇'],
  ['🐶', '🐱', '🐰', '🐻'],
  ['⭐', '🌙', '☀️', '🌈'],
  ['❤️', '💙', '💚', '💛'],
  ['🌸', '🌺', '🌻', '🌷'],
];

export function createEmojiCount(): EmojiCountState {
  return {
    currentGrid: null,
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

export function generateGrid(): EmojiGrid {
  // Pick a random emoji set
  const emojiSet = EMOJI_SETS[Math.floor(Math.random() * EMOJI_SETS.length)];

  // Choose target emoji
  const targetEmoji = emojiSet[Math.floor(Math.random() * emojiSet.length)];

  // Decide how many target emojis to place
  const targetCount = Math.floor(Math.random() * (MAX_TARGET_COUNT - MIN_TARGET_COUNT + 1)) + MIN_TARGET_COUNT;

  // Create grid with target count of target emojis
  const emojis: string[] = [];
  for (let i = 0; i < targetCount; i++) {
    emojis.push(targetEmoji);
  }

  // Fill rest with other emojis
  const otherEmojis = emojiSet.filter(e => e !== targetEmoji);
  for (let i = targetCount; i < GRID_SIZE; i++) {
    emojis.push(otherEmojis[Math.floor(Math.random() * otherEmojis.length)]);
  }

  // Shuffle the grid
  for (let i = emojis.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [emojis[i], emojis[j]] = [emojis[j], emojis[i]];
  }

  // Generate options (including correct answer)
  const options = generateOptions(targetCount);

  return {
    emojis,
    targetEmoji,
    correctCount: targetCount,
    options,
  };
}

function generateOptions(correctAnswer: number): number[] {
  const options = new Set<number>([correctAnswer]);

  // Generate nearby wrong options
  while (options.size < NUM_OPTIONS) {
    const offset = Math.floor(Math.random() * 3) + 1;
    const direction = Math.random() > 0.5 ? 1 : -1;
    const option = Math.max(0, Math.min(GRID_SIZE, correctAnswer + (offset * direction)));
    if (option !== correctAnswer && option >= 0) {
      options.add(option);
    }
  }

  // Shuffle options
  const optionsArray = Array.from(options);
  for (let i = optionsArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [optionsArray[i], optionsArray[j]] = [optionsArray[j], optionsArray[i]];
  }

  return optionsArray;
}

export function startGame(state: EmojiCountState): EmojiCountState {
  if (state.isRunning || state.isComplete) return state;
  return {
    ...state,
    isRunning: true,
    startTime: Date.now(),
    currentGrid: generateGrid(),
    lastResponseTime: Date.now(),
    correctCount: 0,
    wrongCount: 0,
    totalAttempts: 0,
    totalResponseTime: 0,
    timeLeft: GAME_DURATION,
  };
}

export function answer(state: EmojiCountState, selectedCount: number): EmojiCountState {
  if (!state.isRunning || state.isComplete || !state.currentGrid) return state;

  const responseTime = state.lastResponseTime ? Date.now() - state.lastResponseTime : 0;
  const isCorrect = selectedCount === state.currentGrid.correctCount;

  return {
    ...state,
    correctCount: isCorrect ? state.correctCount + 1 : state.correctCount,
    wrongCount: isCorrect ? state.wrongCount : state.wrongCount + 1,
    totalAttempts: state.totalAttempts + 1,
    totalResponseTime: isCorrect ? state.totalResponseTime + responseTime : state.totalResponseTime,
    currentGrid: generateGrid(),
    lastResponseTime: Date.now(),
  };
}

export function updateTime(state: EmojiCountState): EmojiCountState {
  if (!state.isRunning || !state.startTime) return state;

  const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
  const timeLeft = Math.max(0, GAME_DURATION - elapsed);

  if (timeLeft === 0) {
    return {
      ...state,
      timeLeft: 0,
      isRunning: false,
      isComplete: true,
      currentGrid: null,
    };
  }

  return {
    ...state,
    timeLeft,
  };
}

export function resetGame(): EmojiCountState {
  return createEmojiCount();
}

export function calculateScore(correctCount: number, avgResponseTime: number): number {
  // Base score: 150 points per correct answer (harder game)
  // Speed bonus: up to 2x multiplier for fast responses (under 1500ms)
  const baseScore = correctCount * 150;
  const speedMultiplier = avgResponseTime > 0
    ? Math.max(1, 2 - (avgResponseTime / 3000))
    : 1;
  return Math.round(baseScore * speedMultiplier);
}

export function getAverageResponseTime(state: EmojiCountState): number {
  if (state.correctCount === 0) return 0;
  return Math.round(state.totalResponseTime / state.correctCount);
}

export function getAccuracy(state: EmojiCountState): number {
  if (state.totalAttempts === 0) return 0;
  return Math.round((state.correctCount / state.totalAttempts) * 100);
}

export function getRating(correctCount: number): string {
  if (correctCount >= 6) return '이모지 마스터!';
  if (correctCount >= 4) return '훌륭해요!';
  if (correctCount >= 3) return '좋아요!';
  if (correctCount >= 2) return '괜찮아요';
  return '더 연습해보세요!';
}
