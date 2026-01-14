// Reaction Test - Click as fast as possible when the screen turns green

export type GamePhase = 'waiting' | 'ready' | 'go' | 'result' | 'too-early'

export interface ReactionTestState {
  phase: GamePhase
  reactionTime: number | null
  bestTime: number | null
  attempts: number
  totalTime: number
  goTime: number | null
}

export const MIN_WAIT = 1500 // Minimum wait time before GO (ms)
export const MAX_WAIT = 4000 // Maximum wait time before GO (ms)

export function createReactionTest(): ReactionTestState {
  return {
    phase: 'waiting',
    reactionTime: null,
    bestTime: null,
    attempts: 0,
    totalTime: 0,
    goTime: null,
  }
}

export function startRound(state: ReactionTestState): ReactionTestState {
  return {
    ...state,
    phase: 'ready',
    reactionTime: null,
    goTime: null,
  }
}

export function showGo(state: ReactionTestState): ReactionTestState {
  if (state.phase !== 'ready') return state
  return {
    ...state,
    phase: 'go',
    goTime: Date.now(),
  }
}

export function clickedTooEarly(state: ReactionTestState): ReactionTestState {
  if (state.phase !== 'ready') return state
  return {
    ...state,
    phase: 'too-early',
  }
}

export function recordReaction(state: ReactionTestState): ReactionTestState {
  if (state.phase !== 'go' || !state.goTime) return state

  const reactionTime = Date.now() - state.goTime
  const newAttempts = state.attempts + 1
  const newTotalTime = state.totalTime + reactionTime
  const newBest = state.bestTime === null ? reactionTime : Math.min(state.bestTime, reactionTime)

  return {
    ...state,
    phase: 'result',
    reactionTime,
    bestTime: newBest,
    attempts: newAttempts,
    totalTime: newTotalTime,
  }
}

export function resetGame(): ReactionTestState {
  return createReactionTest()
}

export function getRandomWaitTime(): number {
  return MIN_WAIT + Math.random() * (MAX_WAIT - MIN_WAIT)
}

export function getAverageTime(state: ReactionTestState): number | null {
  if (state.attempts === 0) return null
  return Math.round(state.totalTime / state.attempts)
}

export function calculateScore(reactionTime: number): number {
  // Faster = higher score (max 1000 for 100ms, decreasing)
  if (reactionTime <= 100) return 1000
  if (reactionTime >= 1000) return 100
  return Math.round(1000 - (reactionTime - 100) * (900 / 900))
}

export function getRating(reactionTime: number): string {
  if (reactionTime < 150) return 'Incredible!'
  if (reactionTime < 200) return 'Amazing!'
  if (reactionTime < 250) return 'Great!'
  if (reactionTime < 300) return 'Good'
  if (reactionTime < 400) return 'Average'
  return 'Keep practicing!'
}
