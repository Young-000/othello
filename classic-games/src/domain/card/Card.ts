export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades'
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K'

export interface Card {
  readonly suit: Suit
  readonly rank: Rank
  readonly faceUp: boolean
}

export const SUITS: readonly Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'] as const
export const RANKS: readonly Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const

export function createCard(suit: Suit, rank: Rank, faceUp = false): Card {
  return { suit, rank, faceUp }
}

export function flipCard(card: Card): Card {
  return { ...card, faceUp: !card.faceUp }
}

export function isRed(card: Card): boolean {
  return card.suit === 'hearts' || card.suit === 'diamonds'
}

export function isBlack(card: Card): boolean {
  return card.suit === 'clubs' || card.suit === 'spades'
}

export function getRankValue(card: Card): number {
  const index = RANKS.indexOf(card.rank)
  return index + 1 // A=1, 2=2, ..., K=13
}

export function areOppositeColors(card1: Card, card2: Card): boolean {
  return isRed(card1) !== isRed(card2)
}

export function isOneRankLower(lower: Card, higher: Card): boolean {
  return getRankValue(lower) === getRankValue(higher) - 1
}

export function isOneRankHigher(higher: Card, lower: Card): boolean {
  return getRankValue(higher) === getRankValue(lower) + 1
}

export function getCardId(card: Card): string {
  return `${card.suit}-${card.rank}`
}
