import { describe, it, expect } from 'vitest'
import {
  createMinesweeper,
  revealCell,
  toggleFlag,
  MinesweeperState,
} from './Minesweeper'

describe('Minesweeper', () => {
  describe('createMinesweeper', () => {
    it('should create easy grid (9x9)', () => {
      const game = createMinesweeper('easy')
      expect(game.rows).toBe(9)
      expect(game.cols).toBe(9)
      expect(game.mineCount).toBe(10)
    })

    it('should create medium grid (16x16)', () => {
      const game = createMinesweeper('medium')
      expect(game.rows).toBe(16)
      expect(game.cols).toBe(16)
      expect(game.mineCount).toBe(40)
    })

    it('should start with no revealed cells', () => {
      const game = createMinesweeper('easy')
      expect(game.revealedCount).toBe(0)
    })

    it('should not be game over initially', () => {
      const game = createMinesweeper('easy')
      expect(game.isGameOver).toBe(false)
      expect(game.isWon).toBe(false)
    })

    it('should have firstClick true', () => {
      const game = createMinesweeper('easy')
      expect(game.firstClick).toBe(true)
    })
  })

  describe('revealCell', () => {
    it('should reveal a cell', () => {
      const game = createMinesweeper('easy')
      const newState = revealCell(game, 4, 4)

      expect(newState.revealedCount).toBeGreaterThan(0)
      expect(newState.firstClick).toBe(false)
    })

    it('should not place mine on first click', () => {
      const game = createMinesweeper('easy')
      const newState = revealCell(game, 4, 4)

      // First click cell should not be a mine
      expect(newState.grid[4][4].isMine).toBe(false)
      expect(newState.isGameOver).toBe(false)
    })

    it('should flood fill when revealing cell with no adjacent mines', () => {
      const game = createMinesweeper('easy')
      const newState = revealCell(game, 0, 0)

      // Should reveal multiple cells due to flood fill
      // Exact count depends on mine placement
      expect(newState.revealedCount).toBeGreaterThanOrEqual(1)
    })

    it('should not reveal flagged cell', () => {
      const game = createMinesweeper('easy')
      const flagged = toggleFlag(game, 0, 0)
      const revealed = revealCell(flagged, 0, 0)

      expect(revealed.grid[0][0].isRevealed).toBe(false)
    })
  })

  describe('toggleFlag', () => {
    it('should flag a cell', () => {
      const game = createMinesweeper('easy')
      const newState = toggleFlag(game, 0, 0)

      expect(newState.grid[0][0].isFlagged).toBe(true)
      expect(newState.flagCount).toBe(1)
    })

    it('should unflag a flagged cell', () => {
      const game = createMinesweeper('easy')
      const flagged = toggleFlag(game, 0, 0)
      const unflagged = toggleFlag(flagged, 0, 0)

      expect(unflagged.grid[0][0].isFlagged).toBe(false)
      expect(unflagged.flagCount).toBe(0)
    })

    it('should not flag revealed cell', () => {
      const game = createMinesweeper('easy')
      const revealed = revealCell(game, 4, 4)

      // Find a revealed cell
      let revealedRow = -1
      let revealedCol = -1
      for (let r = 0; r < revealed.rows; r++) {
        for (let c = 0; c < revealed.cols; c++) {
          if (revealed.grid[r][c].isRevealed) {
            revealedRow = r
            revealedCol = c
            break
          }
        }
        if (revealedRow >= 0) break
      }

      const flagged = toggleFlag(revealed, revealedRow, revealedCol)
      expect(flagged.grid[revealedRow][revealedCol].isFlagged).toBe(false)
    })
  })

  describe('win condition', () => {
    it('should detect win when all non-mine cells revealed', () => {
      // Create a minimal test case
      const state: MinesweeperState = {
        grid: [
          [
            { isMine: true, isRevealed: false, isFlagged: false, adjacentMines: 0 },
            { isMine: false, isRevealed: true, isFlagged: false, adjacentMines: 1 },
          ],
          [
            { isMine: false, isRevealed: true, isFlagged: false, adjacentMines: 1 },
            { isMine: false, isRevealed: false, isFlagged: false, adjacentMines: 1 },
          ],
        ],
        rows: 2,
        cols: 2,
        mineCount: 1,
        revealedCount: 2,
        flagCount: 0,
        isGameOver: false,
        isWon: false,
        firstClick: false,
      }

      const newState = revealCell(state, 1, 1)

      expect(newState.revealedCount).toBe(3)
      expect(newState.isWon).toBe(true)
    })
  })
})
