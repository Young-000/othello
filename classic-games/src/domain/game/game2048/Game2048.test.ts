import { describe, it, expect } from 'vitest'
import {
  createGame2048,
  createEmptyGrid,
  move,
  addRandomTile,
  Game2048State,
} from './Game2048'

describe('2048 Game', () => {
  describe('createGame2048', () => {
    it('should create a 4x4 grid', () => {
      const game = createGame2048()
      expect(game.grid).toHaveLength(4)
      game.grid.forEach(row => expect(row).toHaveLength(4))
    })

    it('should start with exactly 2 tiles', () => {
      const game = createGame2048()
      const tileCount = game.grid.flat().filter(x => x !== null).length
      expect(tileCount).toBe(2)
    })

    it('should start with score 0', () => {
      const game = createGame2048()
      expect(game.score).toBe(0)
    })

    it('should not be game over initially', () => {
      const game = createGame2048()
      expect(game.isGameOver).toBe(false)
    })
  })

  describe('addRandomTile', () => {
    it('should add a tile to empty grid', () => {
      const grid = createEmptyGrid()
      const newGrid = addRandomTile(grid)
      const tileCount = newGrid.flat().filter(x => x !== null).length
      expect(tileCount).toBe(1)
    })

    it('should add either 2 or 4', () => {
      const grid = createEmptyGrid()
      const newGrid = addRandomTile(grid)
      const tile = newGrid.flat().find(x => x !== null)
      expect([2, 4]).toContain(tile)
    })

    it('should not modify original grid', () => {
      const grid = createEmptyGrid()
      addRandomTile(grid)
      const tileCount = grid.flat().filter(x => x !== null).length
      expect(tileCount).toBe(0)
    })
  })

  describe('move', () => {
    it('should slide tiles left', () => {
      const state: Game2048State = {
        grid: [
          [null, null, 2, 2],
          [null, null, null, null],
          [null, null, null, null],
          [null, null, null, null],
        ],
        score: 0,
        bestScore: 0,
        isGameOver: false,
        hasWon: false,
      }

      const newState = move(state, 'left')

      expect(newState.grid[0][0]).toBe(4) // Merged
      expect(newState.score).toBe(4)
    })

    it('should slide tiles right', () => {
      const state: Game2048State = {
        grid: [
          [2, 2, null, null],
          [null, null, null, null],
          [null, null, null, null],
          [null, null, null, null],
        ],
        score: 0,
        bestScore: 0,
        isGameOver: false,
        hasWon: false,
      }

      const newState = move(state, 'right')

      expect(newState.grid[0][3]).toBe(4) // Merged at right
    })

    it('should slide tiles up', () => {
      const state: Game2048State = {
        grid: [
          [null, null, null, null],
          [null, null, null, null],
          [2, null, null, null],
          [2, null, null, null],
        ],
        score: 0,
        bestScore: 0,
        isGameOver: false,
        hasWon: false,
      }

      const newState = move(state, 'up')

      expect(newState.grid[0][0]).toBe(4) // Merged at top
    })

    it('should slide tiles down', () => {
      const state: Game2048State = {
        grid: [
          [2, null, null, null],
          [2, null, null, null],
          [null, null, null, null],
          [null, null, null, null],
        ],
        score: 0,
        bestScore: 0,
        isGameOver: false,
        hasWon: false,
      }

      const newState = move(state, 'down')

      expect(newState.grid[3][0]).toBe(4) // Merged at bottom
    })

    it('should not move if no change possible', () => {
      const state: Game2048State = {
        grid: [
          [2, null, null, null],
          [null, null, null, null],
          [null, null, null, null],
          [null, null, null, null],
        ],
        score: 0,
        bestScore: 0,
        isGameOver: false,
        hasWon: false,
      }

      const newState = move(state, 'left')

      // Grid should be unchanged (except no new tile added)
      expect(newState.grid[0][0]).toBe(2)
      expect(newState.score).toBe(0)
    })

    it('should chain merges correctly', () => {
      const state: Game2048State = {
        grid: [
          [2, 2, 2, 2],
          [null, null, null, null],
          [null, null, null, null],
          [null, null, null, null],
        ],
        score: 0,
        bestScore: 0,
        isGameOver: false,
        hasWon: false,
      }

      const newState = move(state, 'left')

      // [2,2,2,2] -> [4,4,null,null]
      expect(newState.grid[0][0]).toBe(4)
      expect(newState.grid[0][1]).toBe(4)
      expect(newState.score).toBe(8)
    })

    it('should detect win when 2048 is reached', () => {
      const state: Game2048State = {
        grid: [
          [1024, 1024, null, null],
          [null, null, null, null],
          [null, null, null, null],
          [null, null, null, null],
        ],
        score: 0,
        bestScore: 0,
        isGameOver: false,
        hasWon: false,
      }

      const newState = move(state, 'left')

      expect(newState.hasWon).toBe(true)
    })
  })

  describe('game over detection', () => {
    it('should detect game over when no moves possible', () => {
      // This grid has no empty cells and no possible merges
      const state: Game2048State = {
        grid: [
          [2, 4, 2, 4],
          [4, 2, 4, 2],
          [2, 4, 2, 4],
          [4, 2, 4, 2],
        ],
        score: 0,
        bestScore: 0,
        isGameOver: false,
        hasWon: false,
      }

      // Any move should result in game over since nothing can move
      const newState = move(state, 'left')

      // Game should be over now
      expect(newState.isGameOver).toBe(true)
      // Grid should remain unchanged
      expect(newState.grid).toEqual(state.grid)
    })

    it('should not set game over if already set', () => {
      const state: Game2048State = {
        grid: [
          [2, 4, 2, 4],
          [4, 2, 4, 2],
          [2, 4, 2, 4],
          [4, 2, 4, 2],
        ],
        score: 100,
        bestScore: 100,
        isGameOver: true,
        hasWon: false,
      }

      const newState = move(state, 'left')

      // State should be unchanged when already game over
      expect(newState).toBe(state)
    })
  })
})
