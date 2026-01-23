// Button Masher - Click as many times as possible in 5 seconds

export interface ButtonMasherState {
  clicks: number
  timeLeft: number
  isRunning: boolean
  isComplete: boolean
  startTime: number | null
}

export const GAME_DURATION = 5 // seconds

export function createButtonMasher(): ButtonMasherState {
  return {
    clicks: 0,
    timeLeft: GAME_DURATION,
    isRunning: false,
    isComplete: false,
    startTime: null,
  }
}

export function startGame(state: ButtonMasherState): ButtonMasherState {
  if (state.isRunning || state.isComplete) return state
  return {
    ...state,
    isRunning: true,
    startTime: Date.now(),
    clicks: 0,
    timeLeft: GAME_DURATION,
  }
}

export function click(state: ButtonMasherState): ButtonMasherState {
  if (!state.isRunning || state.isComplete) return state
  return {
    ...state,
    clicks: state.clicks + 1,
  }
}

export function updateTime(state: ButtonMasherState): ButtonMasherState {
  if (!state.isRunning || !state.startTime) return state

  const elapsed = Math.floor((Date.now() - state.startTime) / 1000)
  const timeLeft = Math.max(0, GAME_DURATION - elapsed)

  if (timeLeft === 0) {
    return {
      ...state,
      timeLeft: 0,
      isRunning: false,
      isComplete: true,
    }
  }

  return {
    ...state,
    timeLeft,
  }
}

export function resetGame(): ButtonMasherState {
  return createButtonMasher()
}

export function calculateScore(clicks: number): number {
  // Score based on clicks per second average
  // Multiplier increased from 10 to 20 to compensate for shorter duration (5s vs 10s)
  return clicks * 20
}

export function getClicksPerSecond(clicks: number): string {
  return (clicks / GAME_DURATION).toFixed(1)
}
