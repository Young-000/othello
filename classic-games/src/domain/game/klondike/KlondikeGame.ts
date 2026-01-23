import { Card, flipCard, areOppositeColors, isOneRankLower, getRankValue, Suit } from '../../card'
import { createDeck, shuffle, shuffleWithSeed } from '../../card'

export interface KlondikeState {
  tableau: Card[][]       // 7 columns
  foundations: Card[][]   // 4 piles (one per suit)
  stock: Card[]           // draw pile
  waste: Card[]           // face-up cards from stock
  moves: number
  isWon: boolean
}

export function createKlondikeGame(seed?: number): KlondikeState {
  const deck = seed !== undefined ? shuffleWithSeed(createDeck(), seed) : shuffle(createDeck())

  const tableau: Card[][] = []
  let cardIndex = 0

  // Deal tableau: column 1 has 1 card, column 2 has 2 cards, etc.
  for (let col = 0; col < 7; col++) {
    const column: Card[] = []
    for (let row = 0; row <= col; row++) {
      const card = deck[cardIndex++]
      // Only top card is face up
      column.push(row === col ? flipCard(card) : card)
    }
    tableau.push(column)
  }

  // Remaining cards go to stock
  const stock = deck.slice(cardIndex)

  return {
    tableau,
    foundations: [[], [], [], []],
    stock,
    waste: [],
    moves: 0,
    isWon: false,
  }
}

export function canMoveToTableau(card: Card, targetColumn: Card[]): boolean {
  if (targetColumn.length === 0) {
    // Empty column only accepts King
    return card.rank === 'K'
  }

  const topCard = targetColumn[targetColumn.length - 1]

  // Must be opposite color and one rank lower
  return areOppositeColors(card, topCard) && isOneRankLower(card, topCard)
}

export function canMoveToFoundation(card: Card, foundation: Card[]): boolean {
  if (foundation.length === 0) {
    // Empty foundation only accepts Ace
    return card.rank === 'A'
  }

  const topCard = foundation[foundation.length - 1]

  // Must be same suit and one rank higher
  return card.suit === topCard.suit && getRankValue(card) === getRankValue(topCard) + 1
}

export function drawFromStock(state: KlondikeState, drawCount: number = 3): KlondikeState {
  if (state.stock.length === 0) {
    // Flip waste back to stock
    if (state.waste.length === 0) return state

    return {
      ...state,
      stock: state.waste.map(c => ({ ...c, faceUp: false })).reverse(),
      waste: [],
      moves: state.moves + 1,
    }
  }

  // Draw up to drawCount cards (default: 3)
  const actualDrawCount = Math.min(drawCount, state.stock.length)
  const drawnCards = state.stock.slice(-actualDrawCount).map(c => flipCard(c))

  return {
    ...state,
    stock: state.stock.slice(0, -actualDrawCount),
    waste: [...state.waste, ...drawnCards],
    moves: state.moves + 1,
  }
}

export function moveWasteToTableau(state: KlondikeState, columnIndex: number): KlondikeState {
  if (state.waste.length === 0) return state

  const card = state.waste[state.waste.length - 1]
  const targetColumn = state.tableau[columnIndex]

  if (!canMoveToTableau(card, targetColumn)) return state

  const newTableau = state.tableau.map((col, i) =>
    i === columnIndex ? [...col, card] : col
  )

  return {
    ...state,
    waste: state.waste.slice(0, -1),
    tableau: newTableau,
    moves: state.moves + 1,
  }
}

export function moveWasteToFoundation(state: KlondikeState, foundationIndex: number): KlondikeState {
  if (state.waste.length === 0) return state

  const card = state.waste[state.waste.length - 1]
  const foundation = state.foundations[foundationIndex]

  if (!canMoveToFoundation(card, foundation)) return state

  const newFoundations = state.foundations.map((f, i) =>
    i === foundationIndex ? [...f, card] : f
  )

  return checkWin({
    ...state,
    waste: state.waste.slice(0, -1),
    foundations: newFoundations,
    moves: state.moves + 1,
  })
}

export function moveTableauToFoundation(
  state: KlondikeState,
  columnIndex: number,
  foundationIndex: number
): KlondikeState {
  const column = state.tableau[columnIndex]
  if (column.length === 0) return state

  const card = column[column.length - 1]
  const foundation = state.foundations[foundationIndex]

  if (!canMoveToFoundation(card, foundation)) return state

  // Create new column and flip top card if face down (immutable pattern)
  const slicedColumn = column.slice(0, -1)
  const newColumn = slicedColumn.length > 0 && !slicedColumn[slicedColumn.length - 1].faceUp
    ? [...slicedColumn.slice(0, -1), flipCard(slicedColumn[slicedColumn.length - 1])]
    : slicedColumn

  const newTableau = state.tableau.map((col, i) =>
    i === columnIndex ? newColumn : col
  )
  const newFoundations = state.foundations.map((f, i) =>
    i === foundationIndex ? [...f, card] : f
  )

  return checkWin({
    ...state,
    tableau: newTableau,
    foundations: newFoundations,
    moves: state.moves + 1,
  })
}

export function moveTableauToTableau(
  state: KlondikeState,
  fromColumn: number,
  toColumn: number,
  cardCount: number
): KlondikeState {
  const sourceColumn = state.tableau[fromColumn]
  const targetColumn = state.tableau[toColumn]

  if (sourceColumn.length < cardCount) return state

  const movingCards = sourceColumn.slice(-cardCount)
  const bottomCard = movingCards[0]

  // Check if bottom card can be placed on target
  if (!canMoveToTableau(bottomCard, targetColumn)) return state

  // Check if all moving cards are face up
  if (!movingCards.every(c => c.faceUp)) return state

  // Create new source column and flip top card if face down (immutable pattern)
  const slicedSource = sourceColumn.slice(0, -cardCount)
  const newSourceColumn = slicedSource.length > 0 && !slicedSource[slicedSource.length - 1].faceUp
    ? [...slicedSource.slice(0, -1), flipCard(slicedSource[slicedSource.length - 1])]
    : slicedSource

  const newTableau = state.tableau.map((col, i) => {
    if (i === fromColumn) return newSourceColumn
    if (i === toColumn) return [...col, ...movingCards]
    return col
  })

  return {
    ...state,
    tableau: newTableau,
    moves: state.moves + 1,
  }
}

export function autoMoveToFoundation(state: KlondikeState): KlondikeState | null {
  // Try waste card
  if (state.waste.length > 0) {
    const card = state.waste[state.waste.length - 1]
    for (let i = 0; i < 4; i++) {
      if (canMoveToFoundation(card, state.foundations[i])) {
        return moveWasteToFoundation(state, i)
      }
    }
  }

  // Try tableau cards
  for (let col = 0; col < 7; col++) {
    const column = state.tableau[col]
    if (column.length > 0) {
      const card = column[column.length - 1]
      for (let i = 0; i < 4; i++) {
        if (canMoveToFoundation(card, state.foundations[i])) {
          return moveTableauToFoundation(state, col, i)
        }
      }
    }
  }

  return null
}

function checkWin(state: KlondikeState): KlondikeState {
  const totalInFoundations = state.foundations.reduce((sum, f) => sum + f.length, 0)
  return {
    ...state,
    isWon: totalInFoundations === 52,
  }
}

export function getFoundationIndex(suit: Suit): number {
  const suitOrder: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades']
  return suitOrder.indexOf(suit)
}
