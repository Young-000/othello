import { describe, it, expect } from 'vitest'
import { createDeck, createMultipleDecks, shuffle, shuffleWithSeed, deal } from './Deck'

describe('Deck Domain', () => {
  describe('createDeck', () => {
    it('should create 52 cards', () => {
      const deck = createDeck()
      expect(deck).toHaveLength(52)
    })

    it('should have 13 cards of each suit', () => {
      const deck = createDeck()
      const hearts = deck.filter(c => c.suit === 'hearts')
      const diamonds = deck.filter(c => c.suit === 'diamonds')
      const clubs = deck.filter(c => c.suit === 'clubs')
      const spades = deck.filter(c => c.suit === 'spades')

      expect(hearts).toHaveLength(13)
      expect(diamonds).toHaveLength(13)
      expect(clubs).toHaveLength(13)
      expect(spades).toHaveLength(13)
    })

    it('should have all unique cards', () => {
      const deck = createDeck()
      const ids = deck.map(c => `${c.suit}-${c.rank}`)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(52)
    })
  })

  describe('createMultipleDecks', () => {
    it('should create correct number of decks', () => {
      const decks = createMultipleDecks(2)
      expect(decks).toHaveLength(104)
    })
  })

  describe('shuffle', () => {
    it('should maintain the same number of cards', () => {
      const deck = createDeck()
      const shuffled = shuffle(deck)
      expect(shuffled).toHaveLength(52)
    })

    it('should not mutate original deck', () => {
      const deck = createDeck()
      const firstCard = deck[0]
      shuffle(deck)
      expect(deck[0]).toBe(firstCard)
    })

    it('should produce different order (statistically)', () => {
      const deck = createDeck()
      const shuffled = shuffle(deck)
      const samePosition = deck.filter((card, i) =>
        card.suit === shuffled[i].suit && card.rank === shuffled[i].rank
      )
      // Extremely unlikely all 52 cards stay in same position
      expect(samePosition.length).toBeLessThan(52)
    })
  })

  describe('shuffleWithSeed', () => {
    it('should produce same result with same seed', () => {
      const deck = createDeck()
      const shuffled1 = shuffleWithSeed(deck, 12345)
      const shuffled2 = shuffleWithSeed(deck, 12345)

      expect(shuffled1.map(c => `${c.suit}-${c.rank}`))
        .toEqual(shuffled2.map(c => `${c.suit}-${c.rank}`))
    })

    it('should produce different result with different seed', () => {
      const deck = createDeck()
      const shuffled1 = shuffleWithSeed(deck, 12345)
      const shuffled2 = shuffleWithSeed(deck, 54321)

      const ids1 = shuffled1.map(c => `${c.suit}-${c.rank}`).join(',')
      const ids2 = shuffled2.map(c => `${c.suit}-${c.rank}`).join(',')
      expect(ids1).not.toEqual(ids2)
    })
  })

  describe('deal', () => {
    it('should split deck correctly', () => {
      const deck = createDeck()
      const [dealt, remaining] = deal(deck, 7)

      expect(dealt).toHaveLength(7)
      expect(remaining).toHaveLength(45)
    })

    it('should not mutate original deck', () => {
      const deck = createDeck()
      const originalLength = deck.length
      deal(deck, 7)
      expect(deck).toHaveLength(originalLength)
    })
  })
})
