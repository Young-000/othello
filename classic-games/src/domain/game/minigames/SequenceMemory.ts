// Sequence Memory - Remember and repeat a sequence of colored buttons

export type GamePhase = 'idle' | 'showing' | 'input' | 'success' | 'fail' | 'complete'

export interface SequenceMemoryState {
  phase: GamePhase
  sequence: number[]
  playerInput: number[]
  currentShowIndex: number
  level: number
  score: number
  timeLeft: number
  startTime: number | null
  showingButton: number | null
}

export const GAME_DURATION = 5 // seconds for input phase
export const COLORS = ['#f44336', '#4CAF50', '#2196F3', '#FFC107'] // Red, Green, Blue, Yellow
export const SHOW_INTERVAL = 600 // ms between showing each button
export const SHOW_DURATION = 400 // ms each button stays lit
export const INITIAL_SEQUENCE_LENGTH = 4

export function createSequenceMemory(): SequenceMemoryState {
  return {
    phase: 'idle',
    sequence: [],
    playerInput: [],
    currentShowIndex: 0,
    level: 1,
    score: 0,
    timeLeft: GAME_DURATION,
    startTime: null,
    showingButton: null,
  }
}

export function generateSequence(length: number): number[] {
  const sequence: number[] = []
  for (let i = 0; i < length; i++) {
    sequence.push(Math.floor(Math.random() * COLORS.length))
  }
  return sequence
}

export function startGame(state: SequenceMemoryState): SequenceMemoryState {
  if (state.phase !== 'idle' && state.phase !== 'complete') return state

  const sequence = generateSequence(INITIAL_SEQUENCE_LENGTH)
  return {
    ...state,
    phase: 'showing',
    sequence,
    playerInput: [],
    currentShowIndex: 0,
    level: 1,
    score: 0,
    showingButton: null,
  }
}

export function showNextButton(state: SequenceMemoryState): SequenceMemoryState {
  if (state.phase !== 'showing') return state

  const nextIndex = state.currentShowIndex
  if (nextIndex >= state.sequence.length) {
    // Done showing, switch to input phase
    return {
      ...state,
      phase: 'input',
      currentShowIndex: 0,
      showingButton: null,
      timeLeft: GAME_DURATION,
      startTime: Date.now(),
    }
  }

  return {
    ...state,
    showingButton: state.sequence[nextIndex],
    currentShowIndex: nextIndex + 1,
  }
}

export function clearShowingButton(state: SequenceMemoryState): SequenceMemoryState {
  return {
    ...state,
    showingButton: null,
  }
}

export function inputButton(state: SequenceMemoryState, buttonIndex: number): SequenceMemoryState {
  if (state.phase !== 'input') return state

  const newInput = [...state.playerInput, buttonIndex]
  const expectedButton = state.sequence[state.playerInput.length]

  // Wrong input
  if (buttonIndex !== expectedButton) {
    return {
      ...state,
      phase: 'fail',
      playerInput: newInput,
    }
  }

  // Correct input
  if (newInput.length === state.sequence.length) {
    // Completed sequence successfully!
    const timeBonus = Math.max(0, state.timeLeft * 20)
    const levelBonus = state.level * 50
    const newScore = state.score + 100 + timeBonus + levelBonus

    return {
      ...state,
      phase: 'success',
      playerInput: newInput,
      score: newScore,
    }
  }

  return {
    ...state,
    playerInput: newInput,
  }
}

export function nextLevel(state: SequenceMemoryState): SequenceMemoryState {
  if (state.phase !== 'success') return state

  const newLevel = state.level + 1
  const newSequenceLength = INITIAL_SEQUENCE_LENGTH + newLevel - 1
  const sequence = generateSequence(newSequenceLength)

  return {
    ...state,
    phase: 'showing',
    sequence,
    playerInput: [],
    currentShowIndex: 0,
    level: newLevel,
    showingButton: null,
  }
}

export function updateTime(state: SequenceMemoryState): SequenceMemoryState {
  if (state.phase !== 'input' || !state.startTime) return state

  const elapsed = (Date.now() - state.startTime) / 1000
  const timeLeft = Math.max(0, GAME_DURATION - elapsed)

  if (timeLeft === 0) {
    return {
      ...state,
      timeLeft: 0,
      phase: 'complete',
    }
  }

  return {
    ...state,
    timeLeft,
  }
}

export function completeGame(state: SequenceMemoryState): SequenceMemoryState {
  return {
    ...state,
    phase: 'complete',
  }
}

export function resetGame(): SequenceMemoryState {
  return createSequenceMemory()
}

export function calculateScore(state: SequenceMemoryState): number {
  return state.score
}

export function getProgressText(state: SequenceMemoryState): string {
  return `${state.playerInput.length} / ${state.sequence.length}`
}
