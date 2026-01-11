export type Grid = (number | null)[][]
export type Direction = 'up' | 'down' | 'left' | 'right'

export interface Game2048State {
  grid: Grid
  score: number
  bestScore: number
  isGameOver: boolean
  hasWon: boolean
}

export function createEmptyGrid(): Grid {
  return Array(4).fill(null).map(() => Array(4).fill(null))
}

export function createGame2048(): Game2048State {
  let grid = createEmptyGrid()
  grid = addRandomTile(grid)
  grid = addRandomTile(grid)

  return {
    grid,
    score: 0,
    bestScore: 0,
    isGameOver: false,
    hasWon: false,
  }
}

export function addRandomTile(grid: Grid): Grid {
  const emptyCells: [number, number][] = []

  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      if (grid[row][col] === null) {
        emptyCells.push([row, col])
      }
    }
  }

  if (emptyCells.length === 0) return grid

  const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)]
  const value = Math.random() < 0.9 ? 2 : 4

  const newGrid = grid.map(r => [...r])
  newGrid[row][col] = value

  return newGrid
}

function rotateGrid(grid: Grid): Grid {
  const n = grid.length
  const rotated: Grid = createEmptyGrid()

  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      rotated[col][n - 1 - row] = grid[row][col]
    }
  }

  return rotated
}

function slideRowLeft(row: (number | null)[]): { row: (number | null)[]; score: number } {
  // Filter out nulls
  const tiles = row.filter((x): x is number => x !== null)

  const merged: (number | null)[] = []
  let score = 0
  let i = 0

  while (i < tiles.length) {
    if (i + 1 < tiles.length && tiles[i] === tiles[i + 1]) {
      const newValue = tiles[i] * 2
      merged.push(newValue)
      score += newValue
      i += 2
    } else {
      merged.push(tiles[i])
      i++
    }
  }

  // Pad with nulls
  while (merged.length < 4) {
    merged.push(null)
  }

  return { row: merged, score }
}

function slideLeft(grid: Grid): { grid: Grid; score: number } {
  let totalScore = 0
  const newGrid = grid.map(row => {
    const { row: newRow, score } = slideRowLeft(row)
    totalScore += score
    return newRow
  })

  return { grid: newGrid, score: totalScore }
}

export function move(state: Game2048State, direction: Direction): Game2048State {
  if (state.isGameOver) return state

  let workingGrid = state.grid.map(r => [...r])

  // Rotate grid so we always slide left
  const rotations: Record<Direction, number> = {
    left: 0,
    down: 1,
    right: 2,
    up: 3,
  }

  const numRotations = rotations[direction]

  for (let i = 0; i < numRotations; i++) {
    workingGrid = rotateGrid(workingGrid)
  }

  const { grid: slidGrid, score: moveScore } = slideLeft(workingGrid)
  workingGrid = slidGrid

  // Rotate back
  for (let i = 0; i < (4 - numRotations) % 4; i++) {
    workingGrid = rotateGrid(workingGrid)
  }

  // Check if anything moved
  const moved = !gridsEqual(state.grid, workingGrid)

  if (!moved) {
    // Even if nothing moved, check if game is over
    const isGameOver = checkGameOver(state.grid)
    if (isGameOver && !state.isGameOver) {
      return {
        ...state,
        isGameOver: true,
      }
    }
    return state
  }

  // Add new tile
  const finalGrid = addRandomTile(workingGrid)
  const newScore = state.score + moveScore
  const hasWon = state.hasWon || checkWin(finalGrid)
  const isGameOver = checkGameOver(finalGrid)

  return {
    ...state,
    grid: finalGrid,
    score: newScore,
    bestScore: Math.max(state.bestScore, newScore),
    hasWon,
    isGameOver,
  }
}

function gridsEqual(a: Grid, b: Grid): boolean {
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      if (a[row][col] !== b[row][col]) return false
    }
  }
  return true
}

function checkWin(grid: Grid): boolean {
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      if (grid[row][col] === 2048) return true
    }
  }
  return false
}

function checkGameOver(grid: Grid): boolean {
  // Check for empty cells
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      if (grid[row][col] === null) return false
    }
  }

  // Check for possible merges
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const current = grid[row][col]
      // Check right
      if (col < 3 && current === grid[row][col + 1]) return false
      // Check down
      if (row < 3 && current === grid[row + 1][col]) return false
    }
  }

  return true
}
