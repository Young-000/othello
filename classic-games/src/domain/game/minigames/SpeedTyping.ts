// Speed Typing - Type words as fast as possible in 5 seconds

export interface SpeedTypingState {
  currentWord: string
  wordsCompleted: number
  currentInput: string
  timeLeft: number
  isRunning: boolean
  isComplete: boolean
  startTime: number | null
  score: number
  totalCharacters: number
}

export const GAME_DURATION = 5 // seconds

// Simple words for speed typing (3-6 characters)
const WORDS = [
  // Korean words
  '사과', '바나나', '컴퓨터', '게임', '음악',
  '영화', '책상', '의자', '창문', '문',
  '하늘', '바다', '산', '강', '꽃',
  '나무', '새', '고양이', '강아지', '물고기',
  '커피', '차', '빵', '밥', '국',
  // English words (for variety)
  'cat', 'dog', 'sun', 'moon', 'star',
  'tree', 'book', 'game', 'play', 'run',
  'fast', 'slow', 'big', 'small', 'new',
  'code', 'type', 'win', 'go', 'fun',
]

export function createSpeedTyping(): SpeedTypingState {
  return {
    currentWord: '',
    wordsCompleted: 0,
    currentInput: '',
    timeLeft: GAME_DURATION,
    isRunning: false,
    isComplete: false,
    startTime: null,
    score: 0,
    totalCharacters: 0,
  }
}

export function getRandomWord(): string {
  return WORDS[Math.floor(Math.random() * WORDS.length)]
}

export function startGame(state: SpeedTypingState): SpeedTypingState {
  if (state.isRunning || state.isComplete) return state

  return {
    ...state,
    isRunning: true,
    startTime: Date.now(),
    currentWord: getRandomWord(),
    currentInput: '',
    wordsCompleted: 0,
    timeLeft: GAME_DURATION,
    score: 0,
    totalCharacters: 0,
  }
}

export function updateInput(state: SpeedTypingState, input: string): SpeedTypingState {
  if (!state.isRunning || state.isComplete) return state

  // Check if word is completed correctly
  if (input === state.currentWord) {
    const charCount = state.currentWord.length
    return {
      ...state,
      wordsCompleted: state.wordsCompleted + 1,
      totalCharacters: state.totalCharacters + charCount,
      currentWord: getRandomWord(),
      currentInput: '',
    }
  }

  return {
    ...state,
    currentInput: input,
  }
}

export function updateTime(state: SpeedTypingState): SpeedTypingState {
  if (!state.isRunning || !state.startTime) return state

  const elapsed = (Date.now() - state.startTime) / 1000
  const timeLeft = Math.max(0, GAME_DURATION - elapsed)

  if (timeLeft === 0) {
    const baseScore = state.wordsCompleted * 100
    const charBonus = state.totalCharacters * 5
    const speedBonus = state.wordsCompleted >= 5 ? 200 : 0

    return {
      ...state,
      timeLeft: 0,
      isRunning: false,
      isComplete: true,
      score: baseScore + charBonus + speedBonus,
    }
  }

  return {
    ...state,
    timeLeft,
  }
}

export function resetGame(): SpeedTypingState {
  return createSpeedTyping()
}

export function calculateScore(state: SpeedTypingState): number {
  return state.score
}

export function getWordsPerMinute(wordsCompleted: number): number {
  // Based on 5 seconds, calculate WPM
  return Math.round((wordsCompleted / GAME_DURATION) * 60)
}

export function getCharactersPerSecond(totalCharacters: number): string {
  return (totalCharacters / GAME_DURATION).toFixed(1)
}

export function isInputCorrectSoFar(currentWord: string, input: string): boolean {
  return currentWord.startsWith(input)
}
