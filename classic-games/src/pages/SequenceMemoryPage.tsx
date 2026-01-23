import { useState, useEffect, useCallback, useRef } from 'react'
import GameHeader from '../components/common/GameHeader'
import {
  createSequenceMemory,
  startGame,
  showNextButton,
  clearShowingButton,
  inputButton,
  nextLevel,
  updateTime,
  completeGame,
  resetGame,
  calculateScore,
  getProgressText,
  COLORS,
  SHOW_INTERVAL,
  SHOW_DURATION,
  GAME_DURATION,
  SequenceMemoryState
} from '../domain/game/minigames/SequenceMemory'
import { useBestScore } from '../hooks/useBestScore'
import WinModal from '../components/common/WinModal'
import styles from './SequenceMemoryPage.module.css'

export default function SequenceMemoryPage() {
  const [state, setState] = useState<SequenceMemoryState>(createSequenceMemory)
  const { bestScore, updateBestScore } = useBestScore('sequence-memory')
  const showingRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (showingRef.current) clearTimeout(showingRef.current)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  // Handle showing sequence
  useEffect(() => {
    if (state.phase === 'showing') {
      const showSequence = () => {
        setState(prev => showNextButton(prev))
      }

      // Start showing sequence
      showingRef.current = setTimeout(showSequence, SHOW_INTERVAL)

      return () => {
        if (showingRef.current) clearTimeout(showingRef.current)
      }
    }
  }, [state.phase, state.currentShowIndex])

  // Clear showing button after SHOW_DURATION
  useEffect(() => {
    if (state.showingButton !== null) {
      const timer = setTimeout(() => {
        setState(prev => clearShowingButton(prev))
      }, SHOW_DURATION)

      return () => clearTimeout(timer)
    }
  }, [state.showingButton])

  // Timer for input phase
  useEffect(() => {
    if (state.phase === 'input') {
      intervalRef.current = setInterval(() => {
        setState(prev => updateTime(prev))
      }, 100)

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current)
      }
    }
  }, [state.phase])

  // Handle game completion
  useEffect(() => {
    if (state.phase === 'complete' || state.phase === 'fail') {
      const score = calculateScore(state)
      updateBestScore(score)
    }
  }, [state.phase, state, updateBestScore])

  const handleButtonClick = useCallback((index: number) => {
    if (state.phase !== 'input') return
    setState(prev => inputButton(prev, index))
  }, [state.phase])

  const handleStart = useCallback(() => {
    setState(prev => startGame(prev))
  }, [])

  const handleNextLevel = useCallback(() => {
    setState(prev => nextLevel(prev))
  }, [])

  const handleComplete = useCallback(() => {
    setState(prev => completeGame(prev))
  }, [])

  const handleNewGame = useCallback(() => {
    if (showingRef.current) clearTimeout(showingRef.current)
    if (intervalRef.current) clearInterval(intervalRef.current)
    setState(resetGame())
  }, [])

  const getPhaseMessage = () => {
    switch (state.phase) {
      case 'idle': return '시작 버튼을 눌러주세요'
      case 'showing': return '순서를 기억하세요...'
      case 'input': return '순서대로 눌러주세요!'
      case 'success': return '정답! 다음 레벨로?'
      case 'fail': return '틀렸습니다!'
      case 'complete': return '게임 종료!'
    }
  }

  return (
    <div className={styles.container}>
      <GameHeader
        title="순서 기억"
        gameId="sequence-memory"
        onNewGame={handleNewGame}
      />

      <div className={styles.game}>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>레벨</span>
            <span className={styles.statValue}>{state.level}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>점수</span>
            <span className={styles.statValue}>{state.score}</span>
          </div>
          {state.phase === 'input' && (
            <div className={styles.stat}>
              <span className={styles.statLabel}>시간</span>
              <span className={styles.statValue}>{state.timeLeft.toFixed(1)}s</span>
            </div>
          )}
        </div>

        {state.phase === 'input' && (
          <div className={styles.progress}>
            <span>{getProgressText(state)}</span>
          </div>
        )}

        <div className={styles.buttonGrid}>
          {COLORS.map((color, index) => (
            <button
              key={index}
              className={`${styles.colorButton} ${state.showingButton === index ? styles.active : ''}`}
              style={{
                backgroundColor: color,
                opacity: state.phase === 'input' ? 1 : (state.showingButton === index ? 1 : 0.5)
              }}
              onClick={() => handleButtonClick(index)}
              disabled={state.phase !== 'input'}
            />
          ))}
        </div>

        <p className={styles.message}>{getPhaseMessage()}</p>

        {state.phase === 'idle' && (
          <button className={styles.startButton} onClick={handleStart}>
            게임 시작
          </button>
        )}

        {state.phase === 'success' && (
          <div className={styles.successActions}>
            <button className={styles.nextButton} onClick={handleNextLevel}>
              다음 레벨
            </button>
            <button className={styles.endButton} onClick={handleComplete}>
              종료하기
            </button>
          </div>
        )}

        {state.phase === 'fail' && (
          <button className={styles.retryButton} onClick={handleNewGame}>
            다시 시작
          </button>
        )}

        {bestScore !== null && (
          <p className={styles.bestScore}>최고 점수: {bestScore}</p>
        )}
      </div>

      {state.phase === 'complete' && (
        <WinModal
          gameId="sequence-memory"
          moves={state.level}
          time={`${GAME_DURATION}s`}
          timeInSeconds={GAME_DURATION}
          onPlayAgain={handleNewGame}
          customTitle="게임 종료!"
          customMessage={`레벨 ${state.level} 달성! 총 ${state.score}점`}
        />
      )}
    </div>
  )
}
