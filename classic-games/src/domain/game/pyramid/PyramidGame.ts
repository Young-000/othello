import { Card, flipCard, getRankValue } from '../../card'
import { createDeck, shuffle, shuffleWithSeed } from '../../card'

export interface PyramidState {
  pyramid: (Card | null)[][]  // 7 rows, pyramid shape
  stock: Card[]
  waste: Card[]
  removedCount: number
  moves: number
  isWon: boolean
  isGameOver: boolean
}

export function createPyramidGame(seed?: number): PyramidState {
  const deck = seed !== undefined ? shuffleWithSeed(createDeck(), seed) : shuffle(createDeck())

  // All cards face up
  const faceUpDeck = deck.map(c => ({ ...c, faceUp: true }))

  // Build pyramid (28 cards)
  const pyramid: (Card | null)[][] = []
  let cardIndex = 0

  for (let row = 0; row < 7; row++) {
    const rowCards: (Card | null)[] = []
    for (let col = 0; col <= row; col++) {
      rowCards.push(faceUpDeck[cardIndex++])
    }
    pyramid.push(rowCards)
  }

  // Remaining 24 cards go to stock (face down)
  const stock = deck.slice(cardIndex).map(c => ({ ...c, faceUp: false }))

  return {
    pyramid,
    stock,
    waste: [],
    removedCount: 0,
    moves: 0,
    isWon: false,
    isGameOver: false,
  }
}

function getPyramidValue(card: Card): number {
  // In Pyramid, K=13, Q=12, J=11, A=1, numbers as face value
  return getRankValue(card)
}

export function isCardExposed(state: PyramidState, row: number, col: number): boolean {
  const card = state.pyramid[row][col]
  if (card === null) return false

  // Bottom row is always exposed
  if (row === 6) return true

  // Card is exposed if both cards below it are removed
  const leftBelow = state.pyramid[row + 1]?.[col] ?? null
  const rightBelow = state.pyramid[row + 1]?.[col + 1] ?? null

  return leftBelow === null && rightBelow === null
}

export function canRemovePair(card1: Card, card2: Card): boolean {
  return getPyramidValue(card1) + getPyramidValue(card2) === 13
}

export function canRemoveSingle(card: Card): boolean {
  return card.rank === 'K' // King = 13
}

export function removePyramidCard(
  state: PyramidState,
  row: number,
  col: number
): PyramidState {
  const card = state.pyramid[row][col]
  if (!card) return state
  if (!isCardExposed(state, row, col)) return state
  if (!canRemoveSingle(card)) return state

  const newPyramid = state.pyramid.map((r, ri) =>
    r.map((c, ci) => (ri === row && ci === col ? null : c))
  )

  const removedCount = state.removedCount + 1
  const isWon = removedCount === 28

  return {
    ...state,
    pyramid: newPyramid,
    removedCount,
    moves: state.moves + 1,
    isWon,
  }
}

export function removePyramidPair(
  state: PyramidState,
  row1: number,
  col1: number,
  row2: number,
  col2: number
): PyramidState {
  const card1 = state.pyramid[row1][col1]
  const card2 = state.pyramid[row2][col2]

  if (!card1 || !card2) return state
  if (!isCardExposed(state, row1, col1)) return state
  if (!isCardExposed(state, row2, col2)) return state
  if (!canRemovePair(card1, card2)) return state

  const newPyramid = state.pyramid.map((r, ri) =>
    r.map((c, ci) => {
      if (ri === row1 && ci === col1) return null
      if (ri === row2 && ci === col2) return null
      return c
    })
  )

  const removedCount = state.removedCount + 2
  const isWon = removedCount === 28

  return {
    ...state,
    pyramid: newPyramid,
    removedCount,
    moves: state.moves + 1,
    isWon,
  }
}

export function removePyramidWithWaste(
  state: PyramidState,
  row: number,
  col: number
): PyramidState {
  if (state.waste.length === 0) return state

  const pyramidCard = state.pyramid[row][col]
  const wasteCard = state.waste[state.waste.length - 1]

  if (!pyramidCard) return state
  if (!isCardExposed(state, row, col)) return state
  if (!canRemovePair(pyramidCard, wasteCard)) return state

  const newPyramid = state.pyramid.map((r, ri) =>
    r.map((c, ci) => (ri === row && ci === col ? null : c))
  )

  // Only count pyramid card removal (waste card is from stock, not pyramid)
  const removedCount = state.removedCount + 1

  return {
    ...state,
    pyramid: newPyramid,
    waste: state.waste.slice(0, -1),
    removedCount,
    moves: state.moves + 1,
    isWon: removedCount === 28,
  }
}

export function drawFromStock(state: PyramidState): PyramidState {
  if (state.stock.length === 0) return state

  const card = state.stock[state.stock.length - 1]

  return {
    ...state,
    stock: state.stock.slice(0, -1),
    waste: [...state.waste, flipCard(card)],
    moves: state.moves + 1,
  }
}

export function removeWasteKing(state: PyramidState): PyramidState {
  if (state.waste.length === 0) return state

  const card = state.waste[state.waste.length - 1]
  if (!canRemoveSingle(card)) return state

  // Waste cards are from stock, not pyramid - don't count toward removedCount
  return {
    ...state,
    waste: state.waste.slice(0, -1),
    moves: state.moves + 1,
  }
}

export function removeWastePair(state: PyramidState): PyramidState {
  if (state.waste.length < 2) return state

  const card1 = state.waste[state.waste.length - 1]
  const card2 = state.waste[state.waste.length - 2]

  if (!canRemovePair(card1, card2)) return state

  // Waste cards are from stock, not pyramid - don't count toward removedCount
  return {
    ...state,
    waste: state.waste.slice(0, -2),
    moves: state.moves + 1,
  }
}

function getExposedCards(state: PyramidState): Card[] {
  const exposed: Card[] = []
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col <= row; col++) {
      const card = state.pyramid[row][col]
      if (card && isCardExposed(state, row, col)) {
        exposed.push(card)
      }
    }
  }
  return exposed
}

export function checkGameOver(state: PyramidState): boolean {
  if (state.isWon) return false // Won, not "game over" in the losing sense

  // If there's stock left, game isn't over
  if (state.stock.length > 0) return false

  const exposed = getExposedCards(state)
  const wasteTop = state.waste.length > 0 ? state.waste[state.waste.length - 1] : null

  // Check for any King (single removal)
  for (const card of exposed) {
    if (canRemoveSingle(card)) return false
  }
  if (wasteTop && canRemoveSingle(wasteTop)) return false

  // Check for any pair among exposed cards
  for (let i = 0; i < exposed.length; i++) {
    for (let j = i + 1; j < exposed.length; j++) {
      if (canRemovePair(exposed[i], exposed[j])) return false
    }
  }

  // Check for pair between exposed and waste
  if (wasteTop) {
    for (const card of exposed) {
      if (canRemovePair(card, wasteTop)) return false
    }
  }

  // Check waste pair (top two cards)
  if (state.waste.length >= 2) {
    const card1 = state.waste[state.waste.length - 1]
    const card2 = state.waste[state.waste.length - 2]
    if (canRemovePair(card1, card2)) return false
  }

  return true // No moves available
}
