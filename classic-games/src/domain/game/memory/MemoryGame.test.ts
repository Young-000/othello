import { describe, it, expect } from 'vitest'
import {
  createMemoryGame,
  flipCard,
  checkMatch,
  MemoryGameState,
} from './MemoryGame'

describe('Memory Game', () => {
  describe('createMemoryGame', () => {
    it('should create correct number of cards', () => {
      const game = createMemoryGame(8)
      expect(game.cards).toHaveLength(16)
    })

    it('should have pairs of each value', () => {
      const game = createMemoryGame(8)
      const valueCounts = game.cards.reduce((acc, card) => {
        acc[card.value] = (acc[card.value] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      Object.values(valueCounts).forEach(count => {
        expect(count).toBe(2)
      })
    })

    it('should start with no flipped cards', () => {
      const game = createMemoryGame(8)
      expect(game.cards.every(c => !c.isFlipped)).toBe(true)
    })

    it('should start with 0 moves and matches', () => {
      const game = createMemoryGame(8)
      expect(game.moves).toBe(0)
      expect(game.matches).toBe(0)
    })
  })

  describe('flipCard', () => {
    it('should flip a card', () => {
      const game = createMemoryGame(8)
      const newState = flipCard(game, 0)

      expect(newState.cards[0].isFlipped).toBe(true)
      expect(newState.flippedIndices).toContain(0)
    })

    it('should not flip already flipped card', () => {
      const game = createMemoryGame(8)
      const flipped = flipCard(game, 0)
      const doubleFlip = flipCard(flipped, 0)

      expect(doubleFlip.flippedIndices).toHaveLength(1)
    })

    it('should not flip more than 2 cards', () => {
      const game = createMemoryGame(8)
      let state = flipCard(game, 0)
      state = flipCard(state, 1)
      state = flipCard(state, 2)

      expect(state.flippedIndices).toHaveLength(2)
      expect(state.cards[2].isFlipped).toBe(false)
    })

    it('should not flip matched card', () => {
      const state: MemoryGameState = {
        cards: [
          { id: 0, value: 'A', isFlipped: false, isMatched: true },
          { id: 1, value: 'B', isFlipped: false, isMatched: false },
        ],
        flippedIndices: [],
        moves: 0,
        matches: 0,
        totalPairs: 1,
        isComplete: false,
      }

      const newState = flipCard(state, 0)
      expect(newState.cards[0].isFlipped).toBe(false)
    })
  })

  describe('checkMatch', () => {
    it('should detect matching pair', () => {
      const state: MemoryGameState = {
        cards: [
          { id: 0, value: 'A', isFlipped: true, isMatched: false },
          { id: 1, value: 'A', isFlipped: true, isMatched: false },
          { id: 2, value: 'B', isFlipped: false, isMatched: false },
          { id: 3, value: 'B', isFlipped: false, isMatched: false },
        ],
        flippedIndices: [0, 1],
        moves: 0,
        matches: 0,
        totalPairs: 2,
        isComplete: false,
      }

      const newState = checkMatch(state)

      expect(newState.cards[0].isMatched).toBe(true)
      expect(newState.cards[1].isMatched).toBe(true)
      expect(newState.matches).toBe(1)
      expect(newState.moves).toBe(1)
    })

    it('should flip back non-matching pair', () => {
      const state: MemoryGameState = {
        cards: [
          { id: 0, value: 'A', isFlipped: true, isMatched: false },
          { id: 1, value: 'B', isFlipped: true, isMatched: false },
          { id: 2, value: 'A', isFlipped: false, isMatched: false },
          { id: 3, value: 'B', isFlipped: false, isMatched: false },
        ],
        flippedIndices: [0, 1],
        moves: 0,
        matches: 0,
        totalPairs: 2,
        isComplete: false,
      }

      const newState = checkMatch(state)

      expect(newState.cards[0].isFlipped).toBe(false)
      expect(newState.cards[1].isFlipped).toBe(false)
      expect(newState.matches).toBe(0)
      expect(newState.moves).toBe(1)
    })

    it('should detect game completion', () => {
      const state: MemoryGameState = {
        cards: [
          { id: 0, value: 'A', isFlipped: true, isMatched: false },
          { id: 1, value: 'A', isFlipped: true, isMatched: false },
        ],
        flippedIndices: [0, 1],
        moves: 0,
        matches: 0,
        totalPairs: 1,
        isComplete: false,
      }

      const newState = checkMatch(state)

      expect(newState.isComplete).toBe(true)
      expect(newState.matches).toBe(1)
    })
  })
})
