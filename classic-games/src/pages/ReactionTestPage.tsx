import { useState, useEffect, useCallback, useRef } from 'react'
import GameHeader from '../components/common/GameHeader'
import {
  createReactionTest,
  startRound,
  showGo,
  clickedTooEarly,
  recordReaction,
  resetGame,
  getRandomWaitTime,
  getAverageTime,
  calculateScore,
  getRating,
  ReactionTestState
} from '../domain/game/minigames/ReactionTest'
import { useBestScore } from '../hooks/useBestScore'
import styles from './ReactionTestPage.module.css'

export default function ReactionTestPage() {
  const [state, setState] = useState<ReactionTestState>(createReactionTest)
  const { bestScore, updateBestScore } = useBestScore('reaction-test')
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (state.phase === 'result' && state.reactionTime !== null) {
      const score = calculateScore(state.reactionTime)
      updateBestScore(score)
    }
  }, [state.phase, state.reactionTime, updateBestScore])

  const handleClick = useCallback(() => {
    switch (state.phase) {
      case 'waiting':
      case 'result':
      case 'too-early':
        // Clear any existing timeout before starting new round
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        // Start new round
        setState(prev => startRound(prev))
        timeoutRef.current = setTimeout(() => {
          setState(prev => showGo(prev))
        }, getRandomWaitTime())
        break
      case 'ready':
        // Clicked too early!
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        setState(prev => clickedTooEarly(prev))
        break
      case 'go':
        // Record reaction time
        setState(prev => recordReaction(prev))
        break
    }
  }, [state.phase])

  const handleNewGame = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setState(resetGame())
  }, [])

  const getBackgroundClass = () => {
    switch (state.phase) {
      case 'ready': return styles.bgRed
      case 'go': return styles.bgGreen
      case 'too-early': return styles.bgYellow
      default: return styles.bgDefault
    }
  }

  const getButtonText = () => {
    switch (state.phase) {
      case 'waiting': return 'Click to Start'
      case 'ready': return 'Wait for Green...'
      case 'go': return 'Click NOW!'
      case 'too-early': return 'Too Early! Click to Retry'
      case 'result': return 'Click to Try Again'
    }
  }

  const averageTime = getAverageTime(state)

  return (
    <div className={styles.container}>
      <GameHeader
        title="Reaction Test"
        gameId="reaction-test"
        onNewGame={handleNewGame}
      />

      <button
        className={`${styles.gameArea} ${getBackgroundClass()}`}
        onClick={handleClick}
      >
        <div className={styles.content}>
          {state.phase === 'result' && state.reactionTime !== null && (
            <div className={styles.result}>
              <span className={styles.reactionTime}>{state.reactionTime}ms</span>
              <span className={styles.rating}>{getRating(state.reactionTime)}</span>
            </div>
          )}

          {state.phase === 'too-early' && (
            <div className={styles.tooEarly}>
              <span className={styles.tooEarlyText}>Too Early!</span>
              <span className={styles.tooEarlyHint}>Wait for the green screen</span>
            </div>
          )}

          {state.phase === 'waiting' && (
            <div className={styles.waiting}>
              <span className={styles.emoji}>🎯</span>
              <span className={styles.waitingText}>Test Your Reflexes</span>
            </div>
          )}

          {state.phase === 'ready' && (
            <div className={styles.ready}>
              <span className={styles.readyText}>Wait...</span>
            </div>
          )}

          {state.phase === 'go' && (
            <div className={styles.go}>
              <span className={styles.goText}>GO!</span>
            </div>
          )}

          <span className={styles.hint}>{getButtonText()}</span>
        </div>
      </button>

      <div className={styles.stats}>
        {state.attempts > 0 && (
          <>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Best</span>
              <span className={styles.statValue}>
                {state.bestTime !== null ? `${state.bestTime}ms` : '-'}
              </span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Average</span>
              <span className={styles.statValue}>
                {averageTime !== null ? `${averageTime}ms` : '-'}
              </span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Attempts</span>
              <span className={styles.statValue}>{state.attempts}</span>
            </div>
          </>
        )}

        {bestScore !== null && (
          <p className={styles.bestScore}>Best Score: {bestScore}</p>
        )}
      </div>
    </div>
  )
}
