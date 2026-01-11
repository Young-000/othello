export interface MemoryCard {
  id: number
  value: string
  isFlipped: boolean
  isMatched: boolean
}

export interface MemoryGameState {
  cards: MemoryCard[]
  flippedIndices: number[]
  moves: number
  matches: number
  totalPairs: number
  isComplete: boolean
}

const CARD_VALUES = [
  '🍎', '🍊', '🍋', '🍇', '🍓', '🍒',
  '🌸', '🌺', '🌻', '🌷', '🌹', '🌼',
  '🐶', '🐱', '🐰', '🦊', '🐻', '🐼',
]

export function createMemoryGame(pairs: number = 8): MemoryGameState {
  const values = CARD_VALUES.slice(0, pairs)
  const cardValues = [...values, ...values] // Create pairs

  // Shuffle
  for (let i = cardValues.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[cardValues[i], cardValues[j]] = [cardValues[j], cardValues[i]]
  }

  const cards: MemoryCard[] = cardValues.map((value, index) => ({
    id: index,
    value,
    isFlipped: false,
    isMatched: false,
  }))

  return {
    cards,
    flippedIndices: [],
    moves: 0,
    matches: 0,
    totalPairs: pairs,
    isComplete: false,
  }
}

export function flipCard(state: MemoryGameState, index: number): MemoryGameState {
  if (state.isComplete) return state
  if (state.flippedIndices.length >= 2) return state

  const card = state.cards[index]
  if (card.isFlipped || card.isMatched) return state

  const cards = state.cards.map((c, i) =>
    i === index ? { ...c, isFlipped: true } : c
  )

  const flippedIndices = [...state.flippedIndices, index]

  return {
    ...state,
    cards,
    flippedIndices,
  }
}

export function checkMatch(state: MemoryGameState): MemoryGameState {
  if (state.flippedIndices.length !== 2) return state

  const [first, second] = state.flippedIndices
  const card1 = state.cards[first]
  const card2 = state.cards[second]

  const isMatch = card1.value === card2.value

  let cards: MemoryCard[]
  let matches = state.matches

  if (isMatch) {
    cards = state.cards.map((c, i) =>
      i === first || i === second ? { ...c, isMatched: true } : c
    )
    matches++
  } else {
    cards = state.cards.map((c, i) =>
      i === first || i === second ? { ...c, isFlipped: false } : c
    )
  }

  const isComplete = matches === state.totalPairs

  return {
    ...state,
    cards,
    flippedIndices: [],
    moves: state.moves + 1,
    matches,
    isComplete,
  }
}

export function resetFlipped(state: MemoryGameState): MemoryGameState {
  if (state.flippedIndices.length !== 2) return state

  const [first, second] = state.flippedIndices
  const cards = state.cards.map((c, i) =>
    (i === first || i === second) && !c.isMatched
      ? { ...c, isFlipped: false }
      : c
  )

  return {
    ...state,
    cards,
    flippedIndices: [],
  }
}
