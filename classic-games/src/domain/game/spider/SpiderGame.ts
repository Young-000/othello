import { Card, flipCard, getRankValue, RANKS } from '../../card'
import { createMultipleDecks, shuffle, shuffleWithSeed } from '../../card'

export type SpiderSuit = 1 | 2 | 4 // Number of suits

export interface SpiderState {
  tableau: Card[][]      // 10 columns
  stock: Card[][]        // 5 piles of 10 cards each
  completedSuits: number
  moves: number
  isWon: boolean
  suits: SpiderSuit
}

export function createSpiderGame(suits: SpiderSuit = 1, seed?: number): SpiderState {
  // Create deck based on suits
  let deck: Card[]

  if (suits === 1) {
    // 8 decks of spades only
    const spadesDeck = RANKS.map(rank => ({ suit: 'spades' as const, rank, faceUp: false }))
    deck = Array(8).fill(null).flatMap(() => [...spadesDeck])
  } else if (suits === 2) {
    // 4 decks each of spades and hearts
    const spadesDeck = RANKS.map(rank => ({ suit: 'spades' as const, rank, faceUp: false }))
    const heartsDeck = RANKS.map(rank => ({ suit: 'hearts' as const, rank, faceUp: false }))
    deck = [
      ...Array(4).fill(null).flatMap(() => [...spadesDeck]),
      ...Array(4).fill(null).flatMap(() => [...heartsDeck]),
    ]
  } else {
    // 2 standard decks
    deck = createMultipleDecks(2)
  }

  const shuffled = seed !== undefined ? shuffleWithSeed(deck, seed) : shuffle(deck)

  // Deal 54 cards to tableau (first 4 columns get 6 cards, last 6 get 5 cards)
  const tableau: Card[][] = Array(10).fill(null).map(() => [])
  let cardIndex = 0

  for (let col = 0; col < 10; col++) {
    const cardCount = col < 4 ? 6 : 5
    for (let i = 0; i < cardCount; i++) {
      const card = shuffled[cardIndex++]
      // Top card is face up
      tableau[col].push(i === cardCount - 1 ? flipCard(card) : card)
    }
  }

  // Remaining 50 cards go to stock (5 piles of 10)
  const stock: Card[][] = []
  for (let i = 0; i < 5; i++) {
    stock.push(shuffled.slice(cardIndex + i * 10, cardIndex + (i + 1) * 10))
  }

  return {
    tableau,
    stock,
    completedSuits: 0,
    moves: 0,
    isWon: false,
    suits,
  }
}

export function canMoveCards(cards: Card[]): boolean {
  if (cards.length === 0) return false
  if (!cards[0].faceUp) return false

  // All cards must be same suit and descending sequence
  for (let i = 0; i < cards.length - 1; i++) {
    if (cards[i].suit !== cards[i + 1].suit) return false
    if (getRankValue(cards[i]) !== getRankValue(cards[i + 1]) + 1) return false
    if (!cards[i].faceUp || !cards[i + 1].faceUp) return false
  }

  return true
}

export function canPlaceOnColumn(card: Card, column: Card[]): boolean {
  if (column.length === 0) return true

  const topCard = column[column.length - 1]
  // Must be one rank lower (suit doesn't matter for placement, only for completion)
  return getRankValue(card) === getRankValue(topCard) - 1
}

export function moveCards(
  state: SpiderState,
  fromCol: number,
  toCol: number,
  cardCount: number
): SpiderState {
  if (fromCol === toCol) return state

  const source = state.tableau[fromCol]
  const target = state.tableau[toCol]

  if (source.length < cardCount) return state

  const movingCards = source.slice(-cardCount)
  if (!canMoveCards(movingCards)) return state
  if (!canPlaceOnColumn(movingCards[0], target)) return state

  let newSource = source.slice(0, -cardCount)
  // Flip new top card
  if (newSource.length > 0 && !newSource[newSource.length - 1].faceUp) {
    newSource = [...newSource.slice(0, -1), flipCard(newSource[newSource.length - 1])]
  }

  const newTableau = state.tableau.map((col, i) => {
    if (i === fromCol) return newSource
    if (i === toCol) return [...col, ...movingCards]
    return col
  })

  // Check for completed suit (K to A of same suit)
  const result = checkAndRemoveCompletedSuit(newTableau, toCol)

  return {
    ...state,
    tableau: result.tableau,
    completedSuits: state.completedSuits + result.completedCount,
    moves: state.moves + 1,
    isWon: state.completedSuits + result.completedCount === 8,
  }
}

function checkAndRemoveCompletedSuit(
  tableau: Card[][],
  columnIndex: number
): { tableau: Card[][]; completedCount: number } {
  const column = tableau[columnIndex]
  if (column.length < 13) return { tableau, completedCount: 0 }

  // Check last 13 cards for complete suit
  const last13 = column.slice(-13)

  // Must be K to A of same suit
  if (last13[0].rank !== 'K') return { tableau, completedCount: 0 }

  const suit = last13[0].suit
  for (let i = 0; i < 13; i++) {
    if (last13[i].suit !== suit) return { tableau, completedCount: 0 }
    if (getRankValue(last13[i]) !== 13 - i) return { tableau, completedCount: 0 }
    if (!last13[i].faceUp) return { tableau, completedCount: 0 }
  }

  // Remove completed suit
  let newColumn = column.slice(0, -13)

  // Flip new top card
  if (newColumn.length > 0 && !newColumn[newColumn.length - 1].faceUp) {
    newColumn = [...newColumn.slice(0, -1), flipCard(newColumn[newColumn.length - 1])]
  }

  const newTableau = tableau.map((col, i) =>
    i === columnIndex ? newColumn : col
  )

  return { tableau: newTableau, completedCount: 1 }
}

export function dealFromStock(state: SpiderState): SpiderState {
  if (state.stock.length === 0) return state

  // Can't deal if any column is empty
  if (state.tableau.some(col => col.length === 0)) return state

  const stockPile = state.stock[state.stock.length - 1]

  const newTableau = state.tableau.map((col, i) => {
    const newCard = flipCard(stockPile[i])
    return [...col, newCard]
  })

  // Check all columns for completed suits
  let completedCount = 0
  let finalTableau = newTableau

  for (let i = 0; i < 10; i++) {
    const result = checkAndRemoveCompletedSuit(finalTableau, i)
    finalTableau = result.tableau
    completedCount += result.completedCount
  }

  return {
    ...state,
    tableau: finalTableau,
    stock: state.stock.slice(0, -1),
    completedSuits: state.completedSuits + completedCount,
    moves: state.moves + 1,
    isWon: state.completedSuits + completedCount === 8,
  }
}
