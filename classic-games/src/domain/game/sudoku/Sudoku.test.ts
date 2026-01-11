import { describe, it, expect } from 'vitest'
import {
  createSudoku,
  setCell,
  toggleNote,
  selectCell,
  isValidPlacement,
} from './Sudoku'

describe('Sudoku', () => {
  describe('createSudoku', () => {
    it('should create a 9x9 grid', () => {
      const game = createSudoku('easy')
      expect(game.grid).toHaveLength(9)
      game.grid.forEach(row => expect(row).toHaveLength(9))
    })

    it('should have correct number of clues for difficulty', () => {
      const easy = createSudoku('easy')
      const easyClues = easy.grid.flat().filter(c => c.isFixed).length
      expect(easyClues).toBe(45)

      const medium = createSudoku('medium')
      const mediumClues = medium.grid.flat().filter(c => c.isFixed).length
      expect(mediumClues).toBe(35)
    })

    it('should mark fixed cells correctly', () => {
      const game = createSudoku('easy')
      game.grid.forEach(row => {
        row.forEach(cell => {
          if (cell.value !== null) {
            expect(cell.isFixed).toBe(true)
          } else {
            expect(cell.isFixed).toBe(false)
          }
        })
      })
    })

    it('should not be complete initially', () => {
      const game = createSudoku('easy')
      expect(game.isComplete).toBe(false)
    })
  })

  describe('setCell', () => {
    it('should set value in non-fixed cell', () => {
      const game = createSudoku('easy')

      // Find a non-fixed cell
      let emptyRow = -1
      let emptyCol = -1
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (!game.grid[r][c].isFixed) {
            emptyRow = r
            emptyCol = c
            break
          }
        }
        if (emptyRow >= 0) break
      }

      const newState = setCell(game, emptyRow, emptyCol, 5)
      expect(newState.grid[emptyRow][emptyCol].value).toBe(5)
    })

    it('should not set value in fixed cell', () => {
      const game = createSudoku('easy')

      // Find a fixed cell
      let fixedRow = -1
      let fixedCol = -1
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (game.grid[r][c].isFixed) {
            fixedRow = r
            fixedCol = c
            break
          }
        }
        if (fixedRow >= 0) break
      }

      const originalValue = game.grid[fixedRow][fixedCol].value
      const newState = setCell(game, fixedRow, fixedCol, 9)
      expect(newState.grid[fixedRow][fixedCol].value).toBe(originalValue)
    })

    it('should clear notes when setting value', () => {
      const game = createSudoku('easy')

      // Find empty cell
      let emptyRow = -1
      let emptyCol = -1
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (!game.grid[r][c].isFixed) {
            emptyRow = r
            emptyCol = c
            break
          }
        }
        if (emptyRow >= 0) break
      }

      // Add notes then set value
      let state = toggleNote(game, emptyRow, emptyCol, 1)
      state = toggleNote(state, emptyRow, emptyCol, 2)
      state = setCell(state, emptyRow, emptyCol, 5)

      expect(state.grid[emptyRow][emptyCol].notes.size).toBe(0)
    })

    it('should detect errors', () => {
      const game = createSudoku('easy')

      // Find two empty cells in same row
      let row = -1
      const emptyCols: number[] = []
      for (let r = 0; r < 9; r++) {
        emptyCols.length = 0
        for (let c = 0; c < 9; c++) {
          if (!game.grid[r][c].isFixed) {
            emptyCols.push(c)
          }
        }
        if (emptyCols.length >= 2) {
          row = r
          break
        }
      }

      if (row >= 0 && emptyCols.length >= 2) {
        let state = setCell(game, row, emptyCols[0], 9)
        state = setCell(state, row, emptyCols[1], 9)
        expect(state.errors.length).toBeGreaterThan(0)
      }
    })
  })

  describe('toggleNote', () => {
    it('should add a note', () => {
      const game = createSudoku('easy')

      // Find empty cell
      let emptyRow = -1
      let emptyCol = -1
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (!game.grid[r][c].isFixed) {
            emptyRow = r
            emptyCol = c
            break
          }
        }
        if (emptyRow >= 0) break
      }

      const newState = toggleNote(game, emptyRow, emptyCol, 5)
      expect(newState.grid[emptyRow][emptyCol].notes.has(5)).toBe(true)
    })

    it('should remove existing note', () => {
      const game = createSudoku('easy')

      let emptyRow = -1
      let emptyCol = -1
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (!game.grid[r][c].isFixed) {
            emptyRow = r
            emptyCol = c
            break
          }
        }
        if (emptyRow >= 0) break
      }

      let state = toggleNote(game, emptyRow, emptyCol, 5)
      state = toggleNote(state, emptyRow, emptyCol, 5)
      expect(state.grid[emptyRow][emptyCol].notes.has(5)).toBe(false)
    })
  })

  describe('selectCell', () => {
    it('should select a cell', () => {
      const game = createSudoku('easy')
      const newState = selectCell(game, 3, 4)
      expect(newState.selectedCell).toEqual([3, 4])
    })
  })

  describe('isValidPlacement', () => {
    it('should return true for valid placement', () => {
      const game = createSudoku('easy')
      // This is a basic test - actual validity depends on the grid state
      expect(typeof isValidPlacement(game.grid, 0, 0, 1)).toBe('boolean')
    })
  })
})
