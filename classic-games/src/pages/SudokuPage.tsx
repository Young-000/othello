import { useState, useEffect, useCallback } from 'react'
import GameHeader from '../components/common/GameHeader'
import { createSudoku, setCell, selectCell, toggleNote, SudokuState, Difficulty } from '../domain/game/sudoku/Sudoku'
import { useGameTimer } from '../hooks/useGameTimer'
import { useBestScore } from '../hooks/useBestScore'
import WinModal from '../components/common/WinModal'
import styles from './SudokuPage.module.css'

export default function SudokuPage() {
  const [state, setState] = useState<SudokuState>(() => createSudoku('easy'))
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [noteMode, setNoteMode] = useState(false)
  const { formattedTime, seconds, reset } = useGameTimer(!state.isComplete)
  const { bestScore, updateBestScore } = useBestScore(`sudoku-${difficulty}`)

  useEffect(() => {
    if (state.isComplete && seconds > 0) {
      updateBestScore(seconds, false) // lower time is better
    }
  }, [state.isComplete, seconds, updateBestScore])

  const handleCellClick = (row: number, col: number) => {
    setState(prev => selectCell(prev, row, col))
  }

  const handleNumberInput = useCallback((num: number) => {
    if (!state.selectedCell) return
    const [row, col] = state.selectedCell

    if (noteMode) {
      setState(prev => toggleNote(prev, row, col, num))
    } else {
      setState(prev => setCell(prev, row, col, num))
    }
  }, [state.selectedCell, noteMode])

  const handleClear = useCallback(() => {
    if (!state.selectedCell) return
    const [row, col] = state.selectedCell
    setState(prev => setCell(prev, row, col, null))
  }, [state.selectedCell])

  const handleNewGame = (newDifficulty: Difficulty = difficulty) => {
    setState(createSudoku(newDifficulty))
    setDifficulty(newDifficulty)
    reset()
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '1' && e.key <= '9') {
        handleNumberInput(parseInt(e.key))
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        handleClear()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleClear, handleNumberInput])

  const isError = (row: number, col: number) =>
    state.errors.some(([r, c]) => r === row && c === col)

  return (
    <div className={styles.container}>
      <GameHeader
        title="Sudoku"
        gameId="sudoku"
        time={formattedTime}
        onNewGame={() => handleNewGame()}
      />

      <div className={styles.game}>
        <div className={styles.grid}>
          {state.grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const isSelected =
                state.selectedCell?.[0] === rowIndex &&
                state.selectedCell?.[1] === colIndex

              const isSameRow = state.selectedCell?.[0] === rowIndex
              const isSameCol = state.selectedCell?.[1] === colIndex
              const isSameBox =
                state.selectedCell &&
                Math.floor(state.selectedCell[0] / 3) === Math.floor(rowIndex / 3) &&
                Math.floor(state.selectedCell[1] / 3) === Math.floor(colIndex / 3)

              return (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  className={`${styles.cell}
                    ${cell.isFixed ? styles.fixed : ''}
                    ${isSelected ? styles.selected : ''}
                    ${(isSameRow || isSameCol || isSameBox) && !isSelected ? styles.highlighted : ''}
                    ${isError(rowIndex, colIndex) ? styles.error : ''}
                    ${colIndex % 3 === 2 && colIndex < 8 ? styles.borderRight : ''}
                    ${rowIndex % 3 === 2 && rowIndex < 8 ? styles.borderBottom : ''}`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                >
                  {cell.value || (cell.notes.size > 0 && (
                    <div className={styles.notes}>
                      {[1,2,3,4,5,6,7,8,9].map(n => (
                        <span key={n} className={`${cell.notes.has(n) ? styles.noteActive : ''} ${isSelected && cell.notes.has(n) ? styles.noteSelected : ''}`}>
                          {cell.notes.has(n) ? n : ''}
                        </span>
                      ))}
                    </div>
                  ))}
                </button>
              )
            })
          )}
        </div>

        <div className={styles.controls}>
          <div className={styles.numbers}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <button key={num} onClick={() => handleNumberInput(num)}>
                {num}
              </button>
            ))}
          </div>
          <div className={styles.actions}>
            <button onClick={handleClear}>Clear</button>
            <button
              className={noteMode ? styles.active : ''}
              onClick={() => setNoteMode(!noteMode)}
            >
              Notes {noteMode ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        <div className={styles.difficulty}>
          <button onClick={() => handleNewGame('easy')}>Easy</button>
          <button onClick={() => handleNewGame('medium')}>Medium</button>
          <button onClick={() => handleNewGame('hard')}>Hard</button>
        </div>

        {bestScore !== null && (
          <p className={styles.bestTime}>
            Best ({difficulty}): {Math.floor(bestScore / 60)}:{(bestScore % 60).toString().padStart(2, '0')}
          </p>
        )}
      </div>

      {state.isComplete && (
        <WinModal
          gameId="sudoku"
          moves={0}
          time={formattedTime}
          timeInSeconds={seconds}
          onPlayAgain={() => handleNewGame()}
          extra={{ difficulty }}
        />
      )}
    </div>
  )
}
