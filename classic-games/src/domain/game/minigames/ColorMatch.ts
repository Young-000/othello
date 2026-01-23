// Color Match - Stroop effect game: identify if text matches its color

export interface ColorMatchState {
  displayText: string
  displayColor: string
  isMatching: boolean
  correctCount: number
  wrongCount: number
  timeLeft: number
  isRunning: boolean
  isComplete: boolean
  startTime: number | null
  score: number
  streak: number
  bestStreak: number
}

export const GAME_DURATION = 5 // seconds

// Colors with their Korean names and hex values
export const COLOR_DATA = [
  { name: '빨강', color: '#f44336' },
  { name: '파랑', color: '#2196F3' },
  { name: '초록', color: '#4CAF50' },
  { name: '노랑', color: '#FFC107' },
  { name: '보라', color: '#9C27B0' },
  { name: '주황', color: '#FF9800' },
]

export function createColorMatch(): ColorMatchState {
  return {
    displayText: '',
    displayColor: '',
    isMatching: false,
    correctCount: 0,
    wrongCount: 0,
    timeLeft: GAME_DURATION,
    isRunning: false,
    isComplete: false,
    startTime: null,
    score: 0,
    streak: 0,
    bestStreak: 0,
  }
}

export function generateChallenge(): { text: string; color: string; isMatching: boolean } {
  const textColorData = COLOR_DATA[Math.floor(Math.random() * COLOR_DATA.length)]
  const isMatching = Math.random() > 0.5

  if (isMatching) {
    // Text color matches the word
    return {
      text: textColorData.name,
      color: textColorData.color,
      isMatching: true,
    }
  } else {
    // Text color differs from the word
    let displayColorData = textColorData
    while (displayColorData.name === textColorData.name) {
      displayColorData = COLOR_DATA[Math.floor(Math.random() * COLOR_DATA.length)]
    }
    return {
      text: textColorData.name,
      color: displayColorData.color,
      isMatching: false,
    }
  }
}

export function startGame(state: ColorMatchState): ColorMatchState {
  if (state.isRunning || state.isComplete) return state

  const challenge = generateChallenge()
  return {
    ...state,
    isRunning: true,
    startTime: Date.now(),
    displayText: challenge.text,
    displayColor: challenge.color,
    isMatching: challenge.isMatching,
    correctCount: 0,
    wrongCount: 0,
    timeLeft: GAME_DURATION,
    score: 0,
    streak: 0,
    bestStreak: 0,
  }
}

export function submitAnswer(state: ColorMatchState, playerSaysMatch: boolean): ColorMatchState {
  if (!state.isRunning || state.isComplete) return state

  const isCorrect = playerSaysMatch === state.isMatching
  const newStreak = isCorrect ? state.streak + 1 : 0
  const newBestStreak = Math.max(state.bestStreak, newStreak)

  // Generate next challenge
  const challenge = generateChallenge()

  return {
    ...state,
    correctCount: isCorrect ? state.correctCount + 1 : state.correctCount,
    wrongCount: isCorrect ? state.wrongCount : state.wrongCount + 1,
    streak: newStreak,
    bestStreak: newBestStreak,
    displayText: challenge.text,
    displayColor: challenge.color,
    isMatching: challenge.isMatching,
  }
}

export function updateTime(state: ColorMatchState): ColorMatchState {
  if (!state.isRunning || !state.startTime) return state

  const elapsed = (Date.now() - state.startTime) / 1000
  const timeLeft = Math.max(0, GAME_DURATION - elapsed)

  if (timeLeft === 0) {
    const baseScore = state.correctCount * 100
    const streakBonus = state.bestStreak * 50
    const penaltyScore = state.wrongCount * 30

    return {
      ...state,
      timeLeft: 0,
      isRunning: false,
      isComplete: true,
      score: Math.max(0, baseScore + streakBonus - penaltyScore),
    }
  }

  return {
    ...state,
    timeLeft,
  }
}

export function resetGame(): ColorMatchState {
  return createColorMatch()
}

export function calculateScore(state: ColorMatchState): number {
  return state.score
}

export function getAccuracy(state: ColorMatchState): number {
  const total = state.correctCount + state.wrongCount
  if (total === 0) return 0
  return Math.round((state.correctCount / total) * 100)
}

export function getColorNameFromHex(hex: string): string {
  const found = COLOR_DATA.find(c => c.color === hex)
  return found ? found.name : ''
}
