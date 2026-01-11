export type SudokuGrid = (number | null)[][]

export interface SudokuCell {
  value: number | null
  isFixed: boolean
  notes: Set<number>
}

export interface SudokuState {
  grid: SudokuCell[][]
  selectedCell: [number, number] | null
  isComplete: boolean
  errors: [number, number][]
}

export type Difficulty = 'easy' | 'medium' | 'hard'

const DIFFICULTY_CLUES: Record<Difficulty, number> = {
  easy: 45,
  medium: 35,
  hard: 25,
}

function shuffleArray<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function generateSolvedGrid(): number[][] {
  const grid: number[][] = Array(9).fill(null).map(() => Array(9).fill(0))

  function isValid(row: number, col: number, num: number): boolean {
    // Check row
    for (let c = 0; c < 9; c++) {
      if (grid[row][c] === num) return false
    }
    // Check column
    for (let r = 0; r < 9; r++) {
      if (grid[r][col] === num) return false
    }
    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3
    const boxCol = Math.floor(col / 3) * 3
    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        if (grid[r][c] === num) return false
      }
    }
    return true
  }

  function solve(row: number, col: number): boolean {
    if (row === 9) return true
    if (col === 9) return solve(row + 1, 0)
    if (grid[row][col] !== 0) return solve(row, col + 1)

    const nums = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9])
    for (const num of nums) {
      if (isValid(row, col, num)) {
        grid[row][col] = num
        if (solve(row, col + 1)) return true
        grid[row][col] = 0
      }
    }
    return false
  }

  solve(0, 0)
  return grid
}

export function createSudoku(difficulty: Difficulty = 'easy'): SudokuState {
  const solved = generateSolvedGrid()
  const cluesCount = DIFFICULTY_CLUES[difficulty]

  // Create list of all positions and shuffle
  const positions: [number, number][] = []
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      positions.push([r, c])
    }
  }
  const shuffled = shuffleArray(positions)

  // Remove cells to create puzzle
  const toRemove = 81 - cluesCount
  const removedPositions = new Set(
    shuffled.slice(0, toRemove).map(([r, c]) => `${r},${c}`)
  )

  const grid: SudokuCell[][] = solved.map((row, r) =>
    row.map((value, c) => ({
      value: removedPositions.has(`${r},${c}`) ? null : value,
      isFixed: !removedPositions.has(`${r},${c}`),
      notes: new Set<number>(),
    }))
  )

  return {
    grid,
    selectedCell: null,
    isComplete: false,
    errors: [],
  }
}

export function setCell(
  state: SudokuState,
  row: number,
  col: number,
  value: number | null
): SudokuState {
  if (state.grid[row][col].isFixed) return state

  const grid = state.grid.map((r, ri) =>
    r.map((cell, ci) =>
      ri === row && ci === col
        ? { ...cell, value, notes: new Set<number>() }
        : cell
    )
  )

  const errors = findErrors(grid)
  const isComplete = checkComplete(grid) && errors.length === 0

  return {
    ...state,
    grid,
    errors,
    isComplete,
  }
}

export function toggleNote(
  state: SudokuState,
  row: number,
  col: number,
  num: number
): SudokuState {
  if (state.grid[row][col].isFixed) return state
  if (state.grid[row][col].value !== null) return state

  const grid = state.grid.map((r, ri) =>
    r.map((cell, ci) => {
      if (ri === row && ci === col) {
        const notes = new Set(cell.notes)
        if (notes.has(num)) {
          notes.delete(num)
        } else {
          notes.add(num)
        }
        return { ...cell, notes }
      }
      return cell
    })
  )

  return { ...state, grid }
}

export function selectCell(
  state: SudokuState,
  row: number,
  col: number
): SudokuState {
  return { ...state, selectedCell: [row, col] }
}

function findErrors(grid: SudokuCell[][]): [number, number][] {
  const errors: [number, number][] = []

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const value = grid[r][c].value
      if (value === null) continue

      // Check row
      for (let c2 = 0; c2 < 9; c2++) {
        if (c2 !== c && grid[r][c2].value === value) {
          errors.push([r, c])
          break
        }
      }

      // Check column
      for (let r2 = 0; r2 < 9; r2++) {
        if (r2 !== r && grid[r2][c].value === value) {
          if (!errors.some(([er, ec]) => er === r && ec === c)) {
            errors.push([r, c])
          }
          break
        }
      }

      // Check box
      const boxRow = Math.floor(r / 3) * 3
      const boxCol = Math.floor(c / 3) * 3
      for (let r2 = boxRow; r2 < boxRow + 3; r2++) {
        for (let c2 = boxCol; c2 < boxCol + 3; c2++) {
          if ((r2 !== r || c2 !== c) && grid[r2][c2].value === value) {
            if (!errors.some(([er, ec]) => er === r && ec === c)) {
              errors.push([r, c])
            }
          }
        }
      }
    }
  }

  return errors
}

function checkComplete(grid: SudokuCell[][]): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c].value === null) return false
    }
  }
  return true
}

export function isValidPlacement(
  grid: SudokuCell[][],
  row: number,
  col: number,
  num: number
): boolean {
  // Check row
  for (let c = 0; c < 9; c++) {
    if (c !== col && grid[row][c].value === num) return false
  }
  // Check column
  for (let r = 0; r < 9; r++) {
    if (r !== row && grid[r][col].value === num) return false
  }
  // Check box
  const boxRow = Math.floor(row / 3) * 3
  const boxCol = Math.floor(col / 3) * 3
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if ((r !== row || c !== col) && grid[r][c].value === num) return false
    }
  }
  return true
}
