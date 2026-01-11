export interface Cell {
  isMine: boolean
  isRevealed: boolean
  isFlagged: boolean
  adjacentMines: number
}

export interface MinesweeperState {
  grid: Cell[][]
  rows: number
  cols: number
  mineCount: number
  revealedCount: number
  flagCount: number
  isGameOver: boolean
  isWon: boolean
  firstClick: boolean
}

export type Difficulty = 'easy' | 'medium' | 'hard'

const DIFFICULTY_CONFIG: Record<Difficulty, { rows: number; cols: number; mines: number }> = {
  easy: { rows: 9, cols: 9, mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  hard: { rows: 16, cols: 30, mines: 99 },
}

export function createMinesweeper(difficulty: Difficulty = 'easy'): MinesweeperState {
  const { rows, cols, mines } = DIFFICULTY_CONFIG[difficulty]

  const grid: Cell[][] = Array(rows)
    .fill(null)
    .map(() =>
      Array(cols)
        .fill(null)
        .map(() => ({
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          adjacentMines: 0,
        }))
    )

  return {
    grid,
    rows,
    cols,
    mineCount: mines,
    revealedCount: 0,
    flagCount: 0,
    isGameOver: false,
    isWon: false,
    firstClick: true,
  }
}

function placeMines(state: MinesweeperState, excludeRow: number, excludeCol: number): Cell[][] {
  const { rows, cols, mineCount } = state
  const grid = state.grid.map(row => row.map(cell => ({ ...cell })))

  const positions: [number, number][] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Exclude clicked cell and neighbors
      if (Math.abs(r - excludeRow) <= 1 && Math.abs(c - excludeCol) <= 1) continue
      positions.push([r, c])
    }
  }

  // Shuffle and pick mine positions
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[positions[i], positions[j]] = [positions[j], positions[i]]
  }

  const minePositions = positions.slice(0, mineCount)
  for (const [r, c] of minePositions) {
    grid[r][c].isMine = true
  }

  // Calculate adjacent mines
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c].isMine) continue
      grid[r][c].adjacentMines = countAdjacentMines(grid, r, c)
    }
  }

  return grid
}

function countAdjacentMines(grid: Cell[][], row: number, col: number): number {
  let count = 0
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue
      const r = row + dr
      const c = col + dc
      if (r >= 0 && r < grid.length && c >= 0 && c < grid[0].length) {
        if (grid[r][c].isMine) count++
      }
    }
  }
  return count
}

export function revealCell(state: MinesweeperState, row: number, col: number): MinesweeperState {
  if (state.isGameOver || state.isWon) return state

  let grid = state.grid.map(r => r.map(c => ({ ...c })))
  let { firstClick, revealedCount } = state

  // First click - place mines
  if (firstClick) {
    grid = placeMines(state, row, col)
    firstClick = false
  }

  const cell = grid[row][col]
  if (cell.isRevealed || cell.isFlagged) return state

  // Hit a mine
  if (cell.isMine) {
    // Reveal all mines
    for (let r = 0; r < state.rows; r++) {
      for (let c = 0; c < state.cols; c++) {
        if (grid[r][c].isMine) {
          grid[r][c].isRevealed = true
        }
      }
    }

    return {
      ...state,
      grid,
      isGameOver: true,
      firstClick,
    }
  }

  // Reveal this cell and flood fill if needed
  const toReveal: [number, number][] = [[row, col]]
  const visited = new Set<string>()

  while (toReveal.length > 0) {
    const [r, c] = toReveal.pop()!
    const key = `${r},${c}`

    if (visited.has(key)) continue
    visited.add(key)

    if (r < 0 || r >= state.rows || c < 0 || c >= state.cols) continue

    const currentCell = grid[r][c]
    if (currentCell.isRevealed || currentCell.isFlagged || currentCell.isMine) continue

    currentCell.isRevealed = true
    revealedCount++

    // If no adjacent mines, reveal neighbors
    if (currentCell.adjacentMines === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue
          toReveal.push([r + dr, c + dc])
        }
      }
    }
  }

  // Check win
  const totalCells = state.rows * state.cols
  const isWon = revealedCount === totalCells - state.mineCount

  return {
    ...state,
    grid,
    revealedCount,
    firstClick,
    isWon,
  }
}

export function toggleFlag(state: MinesweeperState, row: number, col: number): MinesweeperState {
  if (state.isGameOver || state.isWon) return state

  const cell = state.grid[row][col]
  if (cell.isRevealed) return state

  const grid = state.grid.map(r => r.map(c => ({ ...c })))
  grid[row][col].isFlagged = !grid[row][col].isFlagged

  return {
    ...state,
    grid,
    flagCount: state.flagCount + (grid[row][col].isFlagged ? 1 : -1),
  }
}
