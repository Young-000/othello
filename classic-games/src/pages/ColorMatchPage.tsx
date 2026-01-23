import { useState, useEffect, useCallback } from 'react'
import GameHeader from '../components/common/GameHeader'
import {
  createColorMatch,
  startGame,
  submitAnswer,
  updateTime,
  resetGame,
  calculateScore,
  getAccuracy,
  GAME_DURATION,
  ColorMatchState
} from '../domain/game/minigames/ColorMatch'
import { useBestScore } from '../hooks/useBestScore'
import WinModal from '../components/common/WinModal'
import styles from './ColorMatchPage.module.css'

export default function ColorMatchPage() {
  const [state, setState] = useState<ColorMatchState>(createColorMatch)
  const { bestScore, updateBestScore } = useBestScore('color-match')

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
      const score = calculateScore(state)
      updateBestScore(score)
    }
  }, [state.isComplete, state, updateBestScore])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!state.isRunning) return

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setState(prev => submitAnswer(prev, false)) // Doesn't match
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setState(prev => submitAnswer(prev, true)) // Matches
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [state.isRunning])

  const handleStart = useCallback(() => {
    setState(prev => startGame(prev))
  }, [])

  const handleAnswer = useCallback((isMatch: boolean) => {
    if (!state.isRunning) return
    setState(prev => submitAnswer(prev, isMatch))
  }, [state.isRunning])

  const handleNewGame = useCallback(() => {
    setState(resetGame())
  }, [])

  const getProgressBarWidth = () => {
    return (state.timeLeft / GAME_DURATION) * 100
  }

  return (
    <div className={styles.container}>
      <GameHeader
        title="색상 판별"
        gameId="color-match"
        onNewGame={handleNewGame}
      />

      <div className={styles.game}>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>시간</span>
            <span className={styles.statValue}>{state.timeLeft.toFixed(1)}s</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>정답</span>
            <span className={styles.statValue}>{state.correctCount}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>연속</span>
            <span className={styles.statValue}>{state.streak}</span>
          </div>
        </div>

        {state.isRunning && (
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${getProgressBarWidth()}%` }}
            />
          </div>
        )}

        {!state.isRunning && !state.isComplete && (
          <div className={styles.startArea}>
            <p className={styles.description}>
              글자의 색상이 글자의 의미와 일치하는지 판단하세요!
            </p>
            <div className={styles.example}>
              <span className={styles.exampleText} style={{ color: '#f44336' }}>빨강</span>
              <span className={styles.exampleArrow}>→</span>
              <span className={styles.exampleLabel}>일치 (O)</span>
            </div>
            <div className={styles.example}>
              <span className={styles.exampleText} style={{ color: '#2196F3' }}>노랑</span>
              <span className={styles.exampleArrow}>→</span>
              <span className={styles.exampleLabel}>불일치 (X)</span>
            </div>
            <button className={styles.startButton} onClick={handleStart}>
              게임 시작
            </button>
          </div>
        )}

        {state.isRunning && (
          <div className={styles.gameArea}>
            <div
              className={styles.colorWord}
              style={{ color: state.displayColor }}
            >
              {state.displayText}
            </div>

            <p className={styles.question}>글자색과 의미가 일치하나요?</p>

            <div className={styles.buttons}>
              <button
                className={`${styles.answerButton} ${styles.noButton}`}
                onClick={() => handleAnswer(false)}
              >
                <span className={styles.buttonIcon}>X</span>
                <span className={styles.buttonText}>불일치</span>
                <span className={styles.buttonKey}>← / A</span>
              </button>
              <button
                className={`${styles.answerButton} ${styles.yesButton}`}
                onClick={() => handleAnswer(true)}
              >
                <span className={styles.buttonIcon}>O</span>
                <span className={styles.buttonText}>일치</span>
                <span className={styles.buttonKey}>→ / D</span>
              </button>
            </div>
          </div>
        )}

        {state.isComplete && (
          <div className={styles.result}>
            <div className={styles.resultScore}>
              <span className={styles.resultLabel}>최종 점수</span>
              <span className={styles.resultValue}>{state.score}</span>
            </div>
            <div className={styles.resultStats}>
              <div className={styles.resultStat}>
                <span>정답률</span>
                <span>{getAccuracy(state)}%</span>
              </div>
              <div className={styles.resultStat}>
                <span>최고 연속</span>
                <span>{state.bestStreak}회</span>
              </div>
              <div className={styles.resultStat}>
                <span>총 문제</span>
                <span>{state.correctCount + state.wrongCount}개</span>
              </div>
            </div>
          </div>
        )}

        {bestScore !== null && (
          <p className={styles.bestScore}>최고 점수: {bestScore}</p>
        )}
      </div>

      {state.isComplete && (
        <WinModal
          gameId="color-match"
          moves={state.correctCount}
          time={`${GAME_DURATION}s`}
          timeInSeconds={GAME_DURATION}
          onPlayAgain={handleNewGame}
          customTitle="시간 종료!"
          customMessage={`${state.correctCount}개 정답! 최고 연속 ${state.bestStreak}회`}
        />
      )}
    </div>
  )
}
