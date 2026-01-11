import { Card, areOppositeColors, isOneRankLower, getRankValue } from '../../card'
import { createDeck, shuffleWithSeed, shuffle } from '../../card'

export interface FreecellState {
  tableau: Card[][]      // 8 columns
  foundations: Card[][]  // 4 piles
  freecells: (Card | null)[]  // 4 free cells
  moves: number
  isWon: boolean
}

export function createFreecellGame(seed?: number): FreecellState {
  const deck = seed !== undefined ? shuffleWithSeed(createDeck(), seed) : shuffle(createDeck())

  // All cards are face up in Freecell
  const faceUpDeck = deck.map(c => ({ ...c, faceUp: true }))

  // Deal to 8 columns (first 4 get 7 cards, last 4 get 6 cards)
  const tableau: Card[][] = Array(8).fill(null).map(() => [])

  faceUpDeck.forEach((card, i) => {
    tableau[i % 8].push(card)
  })

  return {
    tableau,
    foundations: [[], [], [], []],
    freecells: [null, null, null, null],
    moves: 0,
    isWon: false,
  }
}

export function canMoveToTableau(card: Card, targetColumn: Card[]): boolean {
  if (targetColumn.length === 0) return true

  const topCard = targetColumn[targetColumn.length - 1]
  return areOppositeColors(card, topCard) && isOneRankLower(card, topCard)
}

export function canMoveToFoundation(card: Card, foundation: Card[]): boolean {
  if (foundation.length === 0) return card.rank === 'A'

  const topCard = foundation[foundation.length - 1]
  return card.suit === topCard.suit && getRankValue(card) === getRankValue(topCard) + 1
}

function getMaxMovableCards(state: FreecellState, excludeColumn?: number): number {
  const emptyFreecells = state.freecells.filter(c => c === null).length
  const emptyColumns = state.tableau.filter((col, i) => col.length === 0 && i !== excludeColumn).length

  // Formula: (1 + freecells) * 2^emptyColumns
  return (1 + emptyFreecells) * Math.pow(2, emptyColumns)
}

export function moveTableauToTableau(
  state: FreecellState,
  fromCol: number,
  toCol: number,
  cardCount: number
): FreecellState {
  if (fromCol === toCol) return state

  const source = state.tableau[fromCol]
  const target = state.tableau[toCol]

  if (source.length < cardCount) return state

  // Check if we can move this many cards
  const maxMovable = getMaxMovableCards(state, toCol)
  if (cardCount > maxMovable) return state

  const movingCards = source.slice(-cardCount)

  // Check if cards form valid sequence (alternating colors, descending)
  for (let i = 0; i < movingCards.length - 1; i++) {
    if (!areOppositeColors(movingCards[i], movingCards[i + 1])) return state
    if (!isOneRankLower(movingCards[i + 1], movingCards[i])) return state
  }

  // Check if can place on target
  if (!canMoveToTableau(movingCards[0], target)) return state

  const newTableau = state.tableau.map((col, i) => {
    if (i === fromCol) return col.slice(0, -cardCount)
    if (i === toCol) return [...col, ...movingCards]
    return col
  })

  return {
    ...state,
    tableau: newTableau,
    moves: state.moves + 1,
  }
}

export function moveTableauToFreecell(
  state: FreecellState,
  colIndex: number,
  cellIndex: number
): FreecellState {
  if (state.freecells[cellIndex] !== null) return state

  const column = state.tableau[colIndex]
  if (column.length === 0) return state

  const card = column[column.length - 1]

  const newTableau = state.tableau.map((col, i) =>
    i === colIndex ? col.slice(0, -1) : col
  )

  const newFreecells = state.freecells.map((c, i) =>
    i === cellIndex ? card : c
  )

  return {
    ...state,
    tableau: newTableau,
    freecells: newFreecells,
    moves: state.moves + 1,
  }
}

export function moveFreecellToTableau(
  state: FreecellState,
  cellIndex: number,
  colIndex: number
): FreecellState {
  const card = state.freecells[cellIndex]
  if (card === null) return state

  const column = state.tableau[colIndex]
  if (!canMoveToTableau(card, column)) return state

  const newFreecells = state.freecells.map((c, i) =>
    i === cellIndex ? null : c
  )

  const newTableau = state.tableau.map((col, i) =>
    i === colIndex ? [...col, card] : col
  )

  return {
    ...state,
    tableau: newTableau,
    freecells: newFreecells,
    moves: state.moves + 1,
  }
}

export function moveToFoundation(
  state: FreecellState,
  source: { type: 'tableau'; index: number } | { type: 'freecell'; index: number },
  foundationIndex: number
): FreecellState {
  let card: Card | null = null

  if (source.type === 'tableau') {
    const col = state.tableau[source.index]
    if (col.length === 0) return state
    card = col[col.length - 1]
  } else {
    card = state.freecells[source.index]
  }

  if (!card) return state
  if (!canMoveToFoundation(card, state.foundations[foundationIndex])) return state

  let newTableau = state.tableau
  let newFreecells = state.freecells

  if (source.type === 'tableau') {
    newTableau = state.tableau.map((col, i) =>
      i === source.index ? col.slice(0, -1) : col
    )
  } else {
    newFreecells = state.freecells.map((c, i) =>
      i === source.index ? null : c
    )
  }

  const newFoundations = state.foundations.map((f, i) =>
    i === foundationIndex ? [...f, card!] : f
  )

  const totalInFoundations = newFoundations.reduce((sum, f) => sum + f.length, 0)

  return {
    ...state,
    tableau: newTableau,
    freecells: newFreecells,
    foundations: newFoundations,
    moves: state.moves + 1,
    isWon: totalInFoundations === 52,
  }
}

export function autoMoveToFoundation(state: FreecellState): FreecellState | null {
  // Try freecells first
  for (let i = 0; i < 4; i++) {
    const card = state.freecells[i]
    if (!card) continue

    for (let f = 0; f < 4; f++) {
      if (canMoveToFoundation(card, state.foundations[f])) {
        return moveToFoundation(state, { type: 'freecell', index: i }, f)
      }
    }
  }

  // Try tableau
  for (let col = 0; col < 8; col++) {
    const column = state.tableau[col]
    if (column.length === 0) continue

    const card = column[column.length - 1]
    for (let f = 0; f < 4; f++) {
      if (canMoveToFoundation(card, state.foundations[f])) {
        return moveToFoundation(state, { type: 'tableau', index: col }, f)
      }
    }
  }

  return null
}
