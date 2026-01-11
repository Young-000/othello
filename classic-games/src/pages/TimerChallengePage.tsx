import { useState, useEffect, useCallback } from 'react'
import GameHeader from '../components/common/GameHeader'
import {
  createTimerChallenge,
  startTimer,
  stopTimer,
  updateTime,
  resetGame,
  calculateScore,
  formatTime,
  getDifferenceText,
  DEFAULT_TARGET,
  TimerChallengeState
} from '../domain/game/minigames/TimerChallenge'
import { useBestScore } from '../hooks/useBestScore'
import WinModal from '../components/common/WinModal'
import styles from './TimerChallengePage.module.css'

export default function TimerChallengePage() {
  const [state, setState] = useState<TimerChallengeState>(() => createTimerChallenge())
  const { bestScore, updateBestScore } = useBestScore('timer-challenge')

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (state.isRunning) {
      interval = setInterval(() => {
        setState(prev => updateTime(prev))
      }, 10)
    }
    return () => clearInterval(interval)
  }, [state.isRunning])

  useEffect(() => {
    if (state.isComplete && state.accuracy !== null) {
      const score = calculateScore(state.accuracy)
      updateBestScore(score)
    }
  }, [state.isComplete, state.accuracy, updateBestScore])

  const handleClick = useCallback(() => {
    if (!state.isRunning && !state.isComplete) {
      setState(prev => startTimer(prev))
    } else if (state.isRunning) {
      setState(prev => stopTimer(prev))
    }
  }, [state.isRunning, state.isComplete])

  const handleNewGame = useCallback(() => {
    setState(resetGame())
  }, [])

  const getButtonText = () => {
    if (state.isComplete) return `${formatTime(state.currentTime)}s`
    if (!state.isRunning) return 'Start'
    return 'Stop!'
  }

  const getButtonClass = () => {
    if (state.isComplete) return styles.complete
    if (state.isRunning) return styles.running
    return styles.ready
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return '#4CAF50'
    if (accuracy >= 70) return '#FFC107'
    if (accuracy >= 50) return '#FF9800'
    return '#f44336'
  }

  return (
    <div className={styles.container}>
      <GameHeader
        title="5-Second Challenge"
        gameId="timer-challenge"
        onNewGame={handleNewGame}
      />

      <div className={styles.game}>
        <div className={styles.target}>
          <span className={styles.targetLabel}>Target Time</span>
          <span className={styles.targetValue}>{formatTime(state.targetTime)}s</span>
        </div>

        <div className={styles.timerArea}>
          {state.showTimer && (
            <div className={styles.result}>
              <span
                className={styles.resultTime}
                style={{ color: getAccuracyColor(state.accuracy || 0) }}
              >
                {formatTime(state.currentTime)}s
              </span>
              <span className={styles.difference}>
                {getDifferenceText(state.currentTime, state.targetTime)}
              </span>
            </div>
          )}

          {state.isRunning && !state.showTimer && (
            <div className={styles.hiddenTimer}>
              <span className={styles.questionMark}>?</span>
              <span className={styles.hiddenHint}>Timer is hidden!</span>
            </div>
          )}
        </div>

        <button
          className={`${styles.actionButton} ${getButtonClass()}`}
          onClick={handleClick}
          disabled={state.isComplete}
        >
          {getButtonText()}
        </button>

        {!state.isRunning && !state.isComplete && (
          <p className={styles.hint}>
            Start the timer and try to stop it at exactly {formatTime(state.targetTime)} seconds!
            <br />
            <small>The timer will be hidden while running.</small>
          </p>
        )}

        {state.isComplete && state.accuracy !== null && (
          <div className={styles.accuracy}>
            <span className={styles.accuracyLabel}>Accuracy</span>
            <span
              className={styles.accuracyValue}
              style={{ color: getAccuracyColor(state.accuracy) }}
            >
              {state.accuracy}%
            </span>
          </div>
        )}

        {bestScore !== null && (
          <p className={styles.bestScore}>Best Score: {bestScore}</p>
        )}
      </div>

      {state.isComplete && (
        <WinModal
          gameId="timer-challenge"
          moves={0}
          time={formatTime(state.currentTime)}
          timeInSeconds={Math.round(state.currentTime)}
          onPlayAgain={handleNewGame}
          customTitle={state.accuracy && state.accuracy >= 90 ? 'Amazing!' : 'Challenge Complete!'}
          customMessage={`You stopped at ${formatTime(state.currentTime)}s (${state.accuracy}% accuracy)`}
        />
      )}
    </div>
  )
}
