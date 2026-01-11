import { useState, useEffect } from 'react'
import GameHeader from '../components/common/GameHeader'
import { createMinesweeper, revealCell, toggleFlag, Difficulty } from '../domain/game/minesweeper/Minesweeper'
import { useGameTimer } from '../hooks/useGameTimer'
import { useBestScore } from '../hooks/useBestScore'
import WinModal from '../components/common/WinModal'
import styles from './MinesweeperPage.module.css'

export default function MinesweeperPage() {
  const [state, setState] = useState(() => createMinesweeper('easy'))
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const { formattedTime, seconds, reset } = useGameTimer(!state.isGameOver && !state.isWon)
  const { bestScore, updateBestScore } = useBestScore(`minesweeper-${difficulty}`)

  useEffect(() => {
    if (state.isWon && seconds > 0) {
      updateBestScore(seconds, false) // lower is better for time
    }
  }, [state.isWon, seconds, updateBestScore])

  const handleCellClick = (row: number, col: number) => {
    setState(prev => revealCell(prev, row, col))
  }

  const handleCellRightClick = (e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault()
    setState(prev => toggleFlag(prev, row, col))
  }

  const handleNewGame = (newDifficulty: Difficulty = difficulty) => {
    setState(createMinesweeper(newDifficulty))
    setDifficulty(newDifficulty)
    reset()
  }

  return (
    <div className={styles.container}>
      <GameHeader
        title="Minesweeper"
        gameId="minesweeper"
        time={formattedTime}
        onNewGame={() => handleNewGame()}
      />

      <div className={styles.game}>
        <div className={styles.info}>
          <span>Mines: {state.mineCount - state.flagCount}</span>
          {bestScore !== null && (
            <span className={styles.bestTime}>Best: {Math.floor(bestScore / 60)}:{(bestScore % 60).toString().padStart(2, '0')}</span>
          )}
        </div>

        <div
          className={styles.grid}
          data-testid="minesweeper-grid"
          style={{
            gridTemplateColumns: `repeat(${state.cols}, 28px)`,
            gridTemplateRows: `repeat(${state.rows}, 28px)`,
          }}
        >
          {state.grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                data-testid={`cell-${rowIndex}-${colIndex}`}
                data-revealed={cell.isRevealed}
                data-flagged={cell.isFlagged}
                data-mine={cell.isMine}
                className={`${styles.cell} ${cell.isRevealed ? styles.revealed : ''} ${cell.isMine && cell.isRevealed ? styles.mine : ''}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                onContextMenu={(e) => handleCellRightClick(e, rowIndex, colIndex)}
                disabled={cell.isRevealed}
              >
                {cell.isFlagged && !cell.isRevealed && '🚩'}
                {cell.isRevealed && cell.isMine && '💣'}
                {cell.isRevealed && !cell.isMine && cell.adjacentMines > 0 && (
                  <span className={styles[`num${cell.adjacentMines}`]}>
                    {cell.adjacentMines}
                  </span>
                )}
              </button>
            ))
          )}
        </div>

        <div className={styles.buttons}>
          <button onClick={() => handleNewGame('easy')}>Easy</button>
          <button onClick={() => handleNewGame('medium')}>Medium</button>
          <button onClick={() => handleNewGame('hard')}>Hard</button>
        </div>
      </div>

      {state.isWon && (
        <WinModal
          gameId="minesweeper"
          moves={0}
          time={formattedTime}
          timeInSeconds={seconds}
          onPlayAgain={() => handleNewGame()}
          extra={{ difficulty }}
        />
      )}

      {state.isGameOver && !state.isWon && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h2>Game Over</h2>
            <p>You hit a mine!</p>
            <p>Time: {formattedTime}</p>
            <button onClick={() => handleNewGame()}>Play Again</button>
          </div>
        </div>
      )}
    </div>
  )
}
