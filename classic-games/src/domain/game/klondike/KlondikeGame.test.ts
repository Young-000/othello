import { describe, it, expect } from 'vitest'
import {
  createKlondikeGame,
  canMoveToTableau,
  canMoveToFoundation,
  drawFromStock,
  moveTableauToTableau,
  moveTableauToFoundation,
  KlondikeState,
} from './KlondikeGame'
import { createCard } from '../../card'

describe('Klondike Solitaire', () => {
  describe('createKlondikeGame', () => {
    it('should create 7 tableau columns', () => {
      const game = createKlondikeGame(12345)
      expect(game.tableau).toHaveLength(7)
    })

    it('should have correct number of cards in each tableau column', () => {
      const game = createKlondikeGame(12345)
      for (let i = 0; i < 7; i++) {
        expect(game.tableau[i]).toHaveLength(i + 1)
      }
    })

    it('should have top card face up in each tableau column', () => {
      const game = createKlondikeGame(12345)
      for (let i = 0; i < 7; i++) {
        const column = game.tableau[i]
        expect(column[column.length - 1].faceUp).toBe(true)
      }
    })

    it('should have non-top cards face down', () => {
      const game = createKlondikeGame(12345)
      for (let i = 1; i < 7; i++) {
        const column = game.tableau[i]
        for (let j = 0; j < column.length - 1; j++) {
          expect(column[j].faceUp).toBe(false)
        }
      }
    })

    it('should have 24 cards in stock', () => {
      const game = createKlondikeGame(12345)
      expect(game.stock).toHaveLength(24)
    })

    it('should have empty waste pile', () => {
      const game = createKlondikeGame(12345)
      expect(game.waste).toHaveLength(0)
    })

    it('should have 4 empty foundations', () => {
      const game = createKlondikeGame(12345)
      expect(game.foundations).toHaveLength(4)
      game.foundations.forEach(f => expect(f).toHaveLength(0))
    })

    it('should produce same game with same seed', () => {
      const game1 = createKlondikeGame(12345)
      const game2 = createKlondikeGame(12345)

      expect(game1.stock.map(c => `${c.suit}-${c.rank}`))
        .toEqual(game2.stock.map(c => `${c.suit}-${c.rank}`))
    })
  })

  describe('canMoveToTableau', () => {
    it('should allow King on empty column', () => {
      const king = createCard('hearts', 'K', true)
      expect(canMoveToTableau(king, [])).toBe(true)
    })

    it('should not allow non-King on empty column', () => {
      const queen = createCard('hearts', 'Q', true)
      expect(canMoveToTableau(queen, [])).toBe(false)
    })

    it('should allow opposite color and one rank lower', () => {
      const redSix = createCard('hearts', '6', true)
      const blackSeven = createCard('spades', '7', true)
      expect(canMoveToTableau(redSix, [blackSeven])).toBe(true)
    })

    it('should not allow same color', () => {
      const redSix = createCard('hearts', '6', true)
      const redSeven = createCard('diamonds', '7', true)
      expect(canMoveToTableau(redSix, [redSeven])).toBe(false)
    })

    it('should not allow non-sequential ranks', () => {
      const redFive = createCard('hearts', '5', true)
      const blackSeven = createCard('spades', '7', true)
      expect(canMoveToTableau(redFive, [blackSeven])).toBe(false)
    })
  })

  describe('canMoveToFoundation', () => {
    it('should allow Ace on empty foundation', () => {
      const ace = createCard('hearts', 'A', true)
      expect(canMoveToFoundation(ace, [])).toBe(true)
    })

    it('should not allow non-Ace on empty foundation', () => {
      const two = createCard('hearts', '2', true)
      expect(canMoveToFoundation(two, [])).toBe(false)
    })

    it('should allow same suit and one rank higher', () => {
      const ace = createCard('hearts', 'A', true)
      const two = createCard('hearts', '2', true)
      expect(canMoveToFoundation(two, [ace])).toBe(true)
    })

    it('should not allow different suit', () => {
      const heartsAce = createCard('hearts', 'A', true)
      const spadesTwo = createCard('spades', '2', true)
      expect(canMoveToFoundation(spadesTwo, [heartsAce])).toBe(false)
    })
  })

  describe('drawFromStock', () => {
    it('should move cards from stock to waste (3 cards default)', () => {
      const game = createKlondikeGame(12345)
      const newState = drawFromStock(game)

      // Default draw count is 3
      expect(newState.stock).toHaveLength(21)
      expect(newState.waste).toHaveLength(3)
      expect(newState.waste[0].faceUp).toBe(true)
    })

    it('should flip waste back to stock when stock is empty', () => {
      const game: KlondikeState = {
        ...createKlondikeGame(12345),
        stock: [],
        waste: [
          createCard('hearts', 'A', true),
          createCard('spades', '5', true),
        ],
      }

      const newState = drawFromStock(game)

      expect(newState.stock).toHaveLength(2)
      expect(newState.waste).toHaveLength(0)
      expect(newState.stock.every(c => !c.faceUp)).toBe(true)
    })

    it('should increment moves', () => {
      const game = createKlondikeGame(12345)
      const newState = drawFromStock(game)
      expect(newState.moves).toBe(1)
    })
  })

  describe('moveTableauToTableau', () => {
    it('should move cards between columns', () => {
      // For testing, we'll create a controlled state
      const controlledState: KlondikeState = {
        tableau: [
          [createCard('spades', 'K', true)],
          [createCard('hearts', 'Q', true)],
          [],
          [],
          [],
          [],
          [],
        ],
        foundations: [[], [], [], []],
        stock: [],
        waste: [],
        moves: 0,
        isWon: false,
      }

      const newState = moveTableauToTableau(controlledState, 1, 0, 1)

      expect(newState.tableau[0]).toHaveLength(2)
      expect(newState.tableau[1]).toHaveLength(0)
      expect(newState.moves).toBe(1)
    })

    it('should flip new top card after move', () => {
      const controlledState: KlondikeState = {
        tableau: [
          [createCard('spades', 'K', true)],
          [
            createCard('clubs', '3', false), // face down
            createCard('hearts', 'Q', true), // face up, will be moved
          ],
          [],
          [],
          [],
          [],
          [],
        ],
        foundations: [[], [], [], []],
        stock: [],
        waste: [],
        moves: 0,
        isWon: false,
      }

      const newState = moveTableauToTableau(controlledState, 1, 0, 1)

      expect(newState.tableau[1][0].faceUp).toBe(true) // Should be flipped
    })
  })

  describe('win condition', () => {
    it('should detect win when all cards in foundations', () => {
      // Create a nearly-won state
      const suits: ('hearts' | 'diamonds' | 'clubs' | 'spades')[] = ['hearts', 'diamonds', 'clubs', 'spades']
      const ranks: ('A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K')[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

      const wonState: KlondikeState = {
        tableau: [[], [], [], [], [], [], []],
        foundations: suits.map(suit =>
          ranks.map(rank => createCard(suit, rank, true))
        ),
        stock: [],
        waste: [],
        moves: 100,
        isWon: false,
      }

      // Move last card to foundation triggers win check
      const lastMoveState = moveTableauToFoundation({
        ...wonState,
        foundations: [
          ranks.slice(0, 12).map(rank => createCard('hearts', rank, true)),
          ranks.map(rank => createCard('diamonds', rank, true)),
          ranks.map(rank => createCard('clubs', rank, true)),
          ranks.map(rank => createCard('spades', rank, true)),
        ],
        tableau: [[createCard('hearts', 'K', true)], [], [], [], [], [], []],
      }, 0, 0)

      expect(lastMoveState.isWon).toBe(true)
    })
  })
})
