import { describe, it, expect } from 'vitest'
import {
  createFreecellGame,
  canMoveToTableau,
  canMoveToFoundation,
  moveTableauToTableau,
  moveTableauToFreecell,
  moveFreecellToTableau,
  moveToFoundation,
  FreecellState,
} from './FreecellGame'
import { createCard } from '../../card'

describe('Freecell', () => {
  describe('createFreecellGame', () => {
    it('should create 8 tableau columns', () => {
      const game = createFreecellGame(12345)
      expect(game.tableau).toHaveLength(8)
    })

    it('should have correct card distribution', () => {
      const game = createFreecellGame(12345)
      // First 4 columns have 7 cards, last 4 have 6
      expect(game.tableau[0]).toHaveLength(7)
      expect(game.tableau[4]).toHaveLength(6)
    })

    it('should have all cards face up', () => {
      const game = createFreecellGame(12345)
      game.tableau.forEach(col => {
        col.forEach(card => expect(card.faceUp).toBe(true))
      })
    })

    it('should have 4 empty freecells', () => {
      const game = createFreecellGame(12345)
      expect(game.freecells).toHaveLength(4)
      expect(game.freecells.every(c => c === null)).toBe(true)
    })

    it('should have 4 empty foundations', () => {
      const game = createFreecellGame(12345)
      expect(game.foundations).toHaveLength(4)
      game.foundations.forEach(f => expect(f).toHaveLength(0))
    })
  })

  describe('canMoveToTableau', () => {
    it('should allow any card on empty column', () => {
      const card = createCard('hearts', '5', true)
      expect(canMoveToTableau(card, [])).toBe(true)
    })

    it('should allow opposite color one rank lower', () => {
      const card = createCard('hearts', '5', true)
      const column = [createCard('spades', '6', true)]
      expect(canMoveToTableau(card, column)).toBe(true)
    })

    it('should not allow same color', () => {
      const card = createCard('hearts', '5', true)
      const column = [createCard('diamonds', '6', true)]
      expect(canMoveToTableau(card, column)).toBe(false)
    })
  })

  describe('canMoveToFoundation', () => {
    it('should allow Ace on empty foundation', () => {
      const ace = createCard('hearts', 'A', true)
      expect(canMoveToFoundation(ace, [])).toBe(true)
    })

    it('should allow same suit sequential', () => {
      const two = createCard('hearts', '2', true)
      const foundation = [createCard('hearts', 'A', true)]
      expect(canMoveToFoundation(two, foundation)).toBe(true)
    })
  })

  describe('moveTableauToFreecell', () => {
    it('should move card to empty freecell', () => {
      const game = createFreecellGame(12345)
      const newState = moveTableauToFreecell(game, 0, 0)

      expect(newState.freecells[0]).not.toBeNull()
      expect(newState.tableau[0]).toHaveLength(6)
      expect(newState.moves).toBe(1)
    })

    it('should not move to occupied freecell', () => {
      const game = createFreecellGame(12345)
      let state = moveTableauToFreecell(game, 0, 0)
      state = moveTableauToFreecell(state, 1, 0)

      expect(state.tableau[1]).toHaveLength(7) // Unchanged
    })
  })

  describe('moveFreecellToTableau', () => {
    it('should move card from freecell to valid column', () => {
      const state: FreecellState = {
        tableau: [
          [createCard('spades', '6', true)],
          [], [], [], [], [], [], [],
        ],
        foundations: [[], [], [], []],
        freecells: [createCard('hearts', '5', true), null, null, null],
        moves: 0,
        isWon: false,
      }

      const newState = moveFreecellToTableau(state, 0, 0)

      expect(newState.tableau[0]).toHaveLength(2)
      expect(newState.freecells[0]).toBeNull()
    })
  })

  describe('moveTableauToTableau', () => {
    it('should move single card between columns', () => {
      const state: FreecellState = {
        tableau: [
          [createCard('spades', '6', true)],
          [createCard('hearts', '5', true)],
          [], [], [], [], [], [],
        ],
        foundations: [[], [], [], []],
        freecells: [null, null, null, null],
        moves: 0,
        isWon: false,
      }

      const newState = moveTableauToTableau(state, 1, 0, 1)

      expect(newState.tableau[0]).toHaveLength(2)
      expect(newState.tableau[1]).toHaveLength(0)
    })

    it('should move multiple cards if they form valid sequence', () => {
      const state: FreecellState = {
        tableau: [
          [createCard('hearts', '7', true)], // Red 7
          [
            createCard('spades', '6', true), // Black 6
            createCard('diamonds', '5', true), // Red 5
          ],
          [], [], [], [], [], [],
        ],
        foundations: [[], [], [], []],
        freecells: [null, null, null, null],
        moves: 0,
        isWon: false,
      }

      const newState = moveTableauToTableau(state, 1, 0, 2)

      expect(newState.tableau[0]).toHaveLength(3)
      expect(newState.tableau[1]).toHaveLength(0)
    })
  })

  describe('moveToFoundation', () => {
    it('should move Ace to foundation', () => {
      const state: FreecellState = {
        tableau: [
          [createCard('hearts', 'A', true)],
          [], [], [], [], [], [], [],
        ],
        foundations: [[], [], [], []],
        freecells: [null, null, null, null],
        moves: 0,
        isWon: false,
      }

      const newState = moveToFoundation(state, { type: 'tableau', index: 0 }, 0)

      expect(newState.foundations[0]).toHaveLength(1)
      expect(newState.tableau[0]).toHaveLength(0)
    })
  })
})
