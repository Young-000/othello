// Timer Challenge - Stop at exactly 5.00 seconds without looking at the timer

export interface TimerChallengeState {
  targetTime: number
  currentTime: number
  isRunning: boolean
  isComplete: boolean
  startTime: number | null
  accuracy: number | null
  showTimer: boolean
}

export const DEFAULT_TARGET = 5.0 // 5 seconds

export function createTimerChallenge(targetTime: number = DEFAULT_TARGET): TimerChallengeState {
  return {
    targetTime,
    currentTime: 0,
    isRunning: false,
    isComplete: false,
    startTime: null,
    accuracy: null,
    showTimer: false,
  }
}

export function startTimer(state: TimerChallengeState): TimerChallengeState {
  if (state.isRunning || state.isComplete) return state
  return {
    ...state,
    isRunning: true,
    startTime: Date.now(),
    currentTime: 0,
    showTimer: false,
  }
}

export function stopTimer(state: TimerChallengeState): TimerChallengeState {
  if (!state.isRunning || !state.startTime) return state

  const elapsed = (Date.now() - state.startTime) / 1000
  const difference = Math.abs(elapsed - state.targetTime)
  const accuracy = Math.max(0, 100 - (difference * 20)) // 20% penalty per second off

  return {
    ...state,
    currentTime: elapsed,
    isRunning: false,
    isComplete: true,
    accuracy: Math.round(accuracy * 10) / 10,
    showTimer: true,
  }
}

export function updateTime(state: TimerChallengeState): TimerChallengeState {
  if (!state.isRunning || !state.startTime) return state

  const elapsed = (Date.now() - state.startTime) / 1000
  return {
    ...state,
    currentTime: elapsed,
  }
}

export function resetGame(targetTime: number = DEFAULT_TARGET): TimerChallengeState {
  return createTimerChallenge(targetTime)
}

export function calculateScore(accuracy: number): number {
  return Math.round(accuracy * 10)
}

export function formatTime(seconds: number): string {
  return seconds.toFixed(2)
}

export function getDifferenceText(current: number, target: number): string {
  const diff = current - target
  if (Math.abs(diff) < 0.05) return 'Perfect!'
  if (diff > 0) return `${diff.toFixed(2)}s too slow`
  return `${Math.abs(diff).toFixed(2)}s too fast`
}
