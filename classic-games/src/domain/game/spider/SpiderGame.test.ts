import { describe, it, expect } from 'vitest'
import {
  createSpiderGame,
  canMoveCards,
  canPlaceOnColumn,
  moveCards,
  dealFromStock,
  SpiderState,
} from './SpiderGame'
import { createCard } from '../../card'

describe('Spider Solitaire', () => {
  describe('createSpiderGame', () => {
    it('should create 10 tableau columns', () => {
      const game = createSpiderGame(1, 12345)
      expect(game.tableau).toHaveLength(10)
    })

    it('should have correct card counts in tableau', () => {
      const game = createSpiderGame(1, 12345)
      // First 4 columns have 6 cards
      expect(game.tableau[0]).toHaveLength(6)
      expect(game.tableau[3]).toHaveLength(6)
      // Last 6 columns have 5 cards
      expect(game.tableau[4]).toHaveLength(5)
      expect(game.tableau[9]).toHaveLength(5)
    })

    it('should have top card face up in each column', () => {
      const game = createSpiderGame(1, 12345)
      game.tableau.forEach(col => {
        expect(col[col.length - 1].faceUp).toBe(true)
      })
    })

    it('should have 5 stock piles', () => {
      const game = createSpiderGame(1, 12345)
      expect(game.stock).toHaveLength(5)
    })

    it('should have 10 cards in each stock pile', () => {
      const game = createSpiderGame(1, 12345)
      game.stock.forEach(pile => {
        expect(pile).toHaveLength(10)
      })
    })

    it('should use only spades for 1-suit game', () => {
      const game = createSpiderGame(1, 12345)
      game.tableau.forEach(col => {
        col.forEach(card => {
          expect(card.suit).toBe('spades')
        })
      })
    })
  })

  describe('canMoveCards', () => {
    it('should allow single face-up card', () => {
      const cards = [createCard('spades', '5', true)]
      expect(canMoveCards(cards)).toBe(true)
    })

    it('should allow same-suit descending sequence', () => {
      const cards = [
        createCard('spades', '6', true),
        createCard('spades', '5', true),
        createCard('spades', '4', true),
      ]
      expect(canMoveCards(cards)).toBe(true)
    })

    it('should not allow different suits in sequence', () => {
      const cards = [
        createCard('spades', '6', true),
        createCard('hearts', '5', true),
      ]
      expect(canMoveCards(cards)).toBe(false)
    })

    it('should not allow face-down cards', () => {
      const cards = [createCard('spades', '5', false)]
      expect(canMoveCards(cards)).toBe(false)
    })
  })

  describe('canPlaceOnColumn', () => {
    it('should allow any card on empty column', () => {
      const card = createCard('spades', '5', true)
      expect(canPlaceOnColumn(card, [])).toBe(true)
    })

    it('should allow one rank lower', () => {
      const card = createCard('spades', '5', true)
      const column = [createCard('hearts', '6', true)]
      expect(canPlaceOnColumn(card, column)).toBe(true)
    })

    it('should not allow same or higher rank', () => {
      const card = createCard('spades', '5', true)
      const column = [createCard('hearts', '5', true)]
      expect(canPlaceOnColumn(card, column)).toBe(false)
    })
  })

  describe('moveCards', () => {
    it('should move cards between columns', () => {
      const state: SpiderState = {
        tableau: [
          [createCard('spades', '6', true)],
          [createCard('spades', '5', true)],
          [], [], [], [], [], [], [], [],
        ],
        stock: [],
        completedSuits: 0,
        moves: 0,
        isWon: false,
        suits: 1,
      }

      const newState = moveCards(state, 1, 0, 1)

      expect(newState.tableau[0]).toHaveLength(2)
      expect(newState.tableau[1]).toHaveLength(0)
      expect(newState.moves).toBe(1)
    })

    it('should flip new top card after move', () => {
      const state: SpiderState = {
        tableau: [
          [createCard('spades', '6', true)],
          [
            createCard('spades', '8', false),
            createCard('spades', '5', true),
          ],
          [], [], [], [], [], [], [], [],
        ],
        stock: [],
        completedSuits: 0,
        moves: 0,
        isWon: false,
        suits: 1,
      }

      const newState = moveCards(state, 1, 0, 1)

      expect(newState.tableau[1][0].faceUp).toBe(true)
    })
  })

  describe('dealFromStock', () => {
    it('should deal one card to each column', () => {
      const game = createSpiderGame(1, 12345)

      const newState = dealFromStock(game)

      // Each column should have one more card
      expect(newState.tableau[0]).toHaveLength(7)
      expect(newState.tableau[9]).toHaveLength(6)
      expect(newState.stock).toHaveLength(4)
    })

    it('should not deal if any column is empty', () => {
      const state: SpiderState = {
        tableau: [
          [], // Empty column
          [createCard('spades', '5', true)],
          [createCard('spades', '5', true)],
          [createCard('spades', '5', true)],
          [createCard('spades', '5', true)],
          [createCard('spades', '5', true)],
          [createCard('spades', '5', true)],
          [createCard('spades', '5', true)],
          [createCard('spades', '5', true)],
          [createCard('spades', '5', true)],
        ],
        stock: [[
          createCard('spades', 'A', false),
          createCard('spades', '2', false),
          createCard('spades', '3', false),
          createCard('spades', '4', false),
          createCard('spades', '5', false),
          createCard('spades', '6', false),
          createCard('spades', '7', false),
          createCard('spades', '8', false),
          createCard('spades', '9', false),
          createCard('spades', '10', false),
        ]],
        completedSuits: 0,
        moves: 0,
        isWon: false,
        suits: 1,
      }

      const newState = dealFromStock(state)

      expect(newState).toBe(state) // Unchanged
    })
  })
})
