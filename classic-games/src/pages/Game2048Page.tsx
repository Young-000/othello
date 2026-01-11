import { useEffect, useCallback, useRef } from 'react'
import GameHeader from '../components/common/GameHeader'
import { createGame2048, move, Direction } from '../domain/game/game2048/Game2048'
import { useSavedGame } from '../hooks/useLocalStorage'
import { useBestScore } from '../hooks/useBestScore'
import { useGameTimer } from '../hooks/useGameTimer'
import WinModal from '../components/common/WinModal'
import styles from './Game2048Page.module.css'

const TILE_COLORS: Record<number, { bg: string; text: string }> = {
  2: { bg: '#eee4da', text: '#776e65' },
  4: { bg: '#ede0c8', text: '#776e65' },
  8: { bg: '#f2b179', text: '#f9f6f2' },
  16: { bg: '#f59563', text: '#f9f6f2' },
  32: { bg: '#f67c5f', text: '#f9f6f2' },
  64: { bg: '#f65e3b', text: '#f9f6f2' },
  128: { bg: '#edcf72', text: '#f9f6f2' },
  256: { bg: '#edcc61', text: '#f9f6f2' },
  512: { bg: '#edc850', text: '#f9f6f2' },
  1024: { bg: '#edc53f', text: '#f9f6f2' },
  2048: { bg: '#edc22e', text: '#f9f6f2' },
}

export default function Game2048Page() {
  const { state, setState, newGame } = useSavedGame('2048', createGame2048)
  const { bestScore, updateBestScore } = useBestScore('2048')
  const { formattedTime, seconds, reset } = useGameTimer(!state.isGameOver && !state.hasWon)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const gameRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (state.score > 0) {
      updateBestScore(state.score)
    }
  }, [state.score, updateBestScore])

  const handleMove = useCallback((direction: Direction) => {
    setState(prev => move(prev, direction))
  }, [setState])

  const handleNewGame = useCallback(() => {
    newGame()
    reset()
  }, [newGame, reset])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyMap: Record<string, Direction> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
      }

      const direction = keyMap[e.key]
      if (direction) {
        e.preventDefault()
        handleMove(direction)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleMove])

  useEffect(() => {
    const gameEl = gameRef.current
    if (!gameEl) return

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      touchStartRef.current = { x: touch.clientX, y: touch.clientY }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return
      const touch = e.changedTouches[0]
      const dx = touch.clientX - touchStartRef.current.x
      const dy = touch.clientY - touchStartRef.current.y
      const minSwipe = 30

      if (Math.abs(dx) > Math.abs(dy)) {
        if (Math.abs(dx) > minSwipe) {
          handleMove(dx > 0 ? 'right' : 'left')
        }
      } else {
        if (Math.abs(dy) > minSwipe) {
          handleMove(dy > 0 ? 'down' : 'up')
        }
      }
      touchStartRef.current = null
    }

    gameEl.addEventListener('touchstart', handleTouchStart, { passive: true })
    gameEl.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      gameEl.removeEventListener('touchstart', handleTouchStart)
      gameEl.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleMove])

  return (
    <div className={styles.container}>
      <GameHeader
        title="2048"
        gameId="2048"
        score={state.score}
        onNewGame={handleNewGame}
      />

      <div className={styles.game} ref={gameRef}>
        <div className={styles.grid}>
          {state.grid.map((row, rowIndex) =>
            row.map((value, colIndex) => {
              const colors = value ? TILE_COLORS[value] || { bg: '#3c3a32', text: '#f9f6f2' } : null

              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`${styles.cell} ${value ? styles.filled : ''}`}
                  style={colors ? {
                    backgroundColor: colors.bg,
                    color: colors.text,
                  } : undefined}
                >
                  {value}
                </div>
              )
            })
          )}
        </div>

        <div className={styles.controls}>
          <p>Arrow keys or swipe to play</p>
          {bestScore !== null && (
            <p className={styles.bestScore}>Best: {bestScore}</p>
          )}
        </div>
      </div>

      {state.hasWon && !state.isGameOver && (
        <WinModal
          gameId="2048"
          moves={0}
          time={formattedTime}
          timeInSeconds={seconds}
          onPlayAgain={handleNewGame}
          extra={{ gameScore: state.score }}
        />
      )}

      {state.isGameOver && !state.hasWon && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h2>Game Over</h2>
            <p>Score: {state.score}</p>
            <button onClick={handleNewGame}>Play Again</button>
          </div>
        </div>
      )}
    </div>
  )
}
