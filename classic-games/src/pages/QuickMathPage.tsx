import React, { useState, useEffect, useCallback, useRef } from 'react'
import GameHeader from '../components/common/GameHeader'
import {
  createQuickMath,
  startGame,
  submitAnswer,
  updateTime,
  resetGame,
  calculateScore,
  formatProblem,
  getAccuracy,
  GAME_DURATION,
  QuickMathState
} from '../domain/game/minigames/QuickMath'
import { useBestScore } from '../hooks/useBestScore'
import WinModal from '../components/common/WinModal'
import styles from './QuickMathPage.module.css'

export default function QuickMathPage() {
  const [state, setState] = useState<QuickMathState>(createQuickMath)
  const [inputValue, setInputValue] = useState('')
  const { bestScore, updateBestScore } = useBestScore('quick-math')
  const inputRef = useRef<HTMLInputElement>(null)

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

  useEffect(() => {
    if (state.isRunning && inputRef.current) {
      inputRef.current.focus()
    }
  }, [state.isRunning, state.currentProblem])

  const handleStart = useCallback(() => {
    setState(prev => startGame(prev))
    setInputValue('')
  }, [])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (!state.isRunning || !state.currentProblem) return

    const answer = parseInt(inputValue, 10)
    if (!isNaN(answer)) {
      setState(prev => submitAnswer(prev, answer))
      setInputValue('')
    }
  }, [state.isRunning, state.currentProblem, inputValue])

  const handleNewGame = useCallback(() => {
    setState(resetGame())
    setInputValue('')
  }, [])

  const getProgressBarWidth = () => {
    return (state.timeLeft / GAME_DURATION) * 100
  }

  return (
    <div className={styles.container}>
      <GameHeader
        title="빠른 암산"
        gameId="quick-math"
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
            <span className={styles.statLabel}>오답</span>
            <span className={styles.statValue}>{state.wrongCount}</span>
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
              5초 동안 최대한 많은 수학 문제를 풀어보세요!
            </p>
            <button className={styles.startButton} onClick={handleStart}>
              게임 시작
            </button>
          </div>
        )}

        {state.isRunning && state.currentProblem && (
          <div className={styles.problemArea}>
            <div className={styles.problem}>
              {formatProblem(state.currentProblem)} = ?
            </div>
            <form onSubmit={handleSubmit} className={styles.inputForm}>
              <input
                ref={inputRef}
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className={styles.answerInput}
                placeholder="답 입력"
                autoComplete="off"
              />
              <button type="submit" className={styles.submitButton}>
                확인
              </button>
            </form>
            <p className={styles.hint}>Enter 키로 제출</p>
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
          gameId="quick-math"
          moves={state.correctCount}
          time={`${GAME_DURATION}s`}
          timeInSeconds={GAME_DURATION}
          onPlayAgain={handleNewGame}
          customTitle="시간 종료!"
          customMessage={`${state.correctCount}개 정답! 정답률 ${getAccuracy(state)}%`}
        />
      )}
    </div>
  )
}
