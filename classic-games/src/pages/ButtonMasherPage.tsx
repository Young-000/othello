import { useState, useEffect, useCallback } from 'react'
import GameHeader from '../components/common/GameHeader'
import {
  createButtonMasher,
  startGame,
  click,
  updateTime,
  resetGame,
  calculateScore,
  getClicksPerSecond,
  GAME_DURATION,
  ButtonMasherState
} from '../domain/game/minigames/ButtonMasher'
import { useBestScore } from '../hooks/useBestScore'
import WinModal from '../components/common/WinModal'
import styles from './ButtonMasherPage.module.css'

export default function ButtonMasherPage() {
  const [state, setState] = useState<ButtonMasherState>(createButtonMasher)
  const { bestScore, updateBestScore } = useBestScore('button-masher')

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (state.isRunning) {
      interval = setInterval(() => {
        setState(prev => updateTime(prev))
      }, 100)
    }
    return () => clearInterval(interval)
  }, [state.isRunning])

  useEffect(() => {
    if (state.isComplete) {
      const score = calculateScore(state.clicks)
      updateBestScore(score)
    }
  }, [state.isComplete, state.clicks, updateBestScore])

  const handleClick = useCallback(() => {
    if (!state.isRunning && !state.isComplete) {
      setState(prev => startGame(prev))
    } else if (state.isRunning) {
      setState(prev => click(prev))
    }
  }, [state.isRunning, state.isComplete])

  const handleNewGame = useCallback(() => {
    setState(resetGame())
  }, [])

  const getButtonText = () => {
    if (state.isComplete) return `${state.clicks} clicks!`
    if (!state.isRunning) return 'Click to Start!'
    return 'CLICK!'
  }

  const getButtonClass = () => {
    if (state.isComplete) return styles.complete
    if (state.isRunning) return styles.active
    return styles.ready
  }

  return (
    <div className={styles.container}>
      <GameHeader
        title="Button Masher"
        gameId="button-masher"
        onNewGame={handleNewGame}
      />

      <div className={styles.game}>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Time</span>
            <span className={styles.statValue}>{state.timeLeft}s</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Clicks</span>
            <span className={styles.statValue}>{state.clicks}</span>
          </div>
        </div>

        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${(state.timeLeft / GAME_DURATION) * 100}%` }}
          />
        </div>

        <button
          className={`${styles.mashButton} ${getButtonClass()}`}
          onClick={handleClick}
          disabled={state.isComplete}
        >
          {getButtonText()}
        </button>

        {state.isRunning && (
          <p className={styles.hint}>Keep clicking as fast as you can!</p>
        )}

        {!state.isRunning && !state.isComplete && (
          <p className={styles.hint}>Click the button to start the challenge!</p>
        )}

        {bestScore !== null && (
          <p className={styles.bestScore}>Best Score: {bestScore}</p>
        )}
      </div>

      {state.isComplete && (
        <WinModal
          gameId="button-masher"
          moves={state.clicks}
          time={`${GAME_DURATION}s`}
          timeInSeconds={GAME_DURATION}
          onPlayAgain={handleNewGame}
          customTitle="Time's Up!"
          customMessage={`You clicked ${state.clicks} times! (${getClicksPerSecond(state.clicks)} clicks/sec)`}
        />
      )}
    </div>
  )
}
