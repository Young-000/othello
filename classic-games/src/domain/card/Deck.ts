import { Card, createCard, SUITS, RANKS } from './Card'

export function createDeck(): Card[] {
  const deck: Card[] = []
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push(createCard(suit, rank))
    }
  }
  return deck
}

export function createMultipleDecks(count: number): Card[] {
  const decks: Card[] = []
  for (let i = 0; i < count; i++) {
    decks.push(...createDeck())
  }
  return decks
}

export function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function shuffleWithSeed<T>(array: T[], seed: number): T[] {
  const result = [...array]
  let currentSeed = seed

  const random = () => {
    currentSeed = (currentSeed * 1103515245 + 12345) & 0x7fffffff
    return currentSeed / 0x7fffffff
  }

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function deal(deck: Card[], count: number): [Card[], Card[]] {
  return [deck.slice(0, count), deck.slice(count)]
}
