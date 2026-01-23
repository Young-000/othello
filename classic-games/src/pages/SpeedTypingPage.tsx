import React, { useState, useEffect, useCallback, useRef } from 'react'
import GameHeader from '../components/common/GameHeader'
import {
  createSpeedTyping,
  startGame,
  updateInput,
  updateTime,
  resetGame,
  calculateScore,
  getWordsPerMinute,
  getCharactersPerSecond,
  isInputCorrectSoFar,
  GAME_DURATION,
  SpeedTypingState
} from '../domain/game/minigames/SpeedTyping'
import { useBestScore } from '../hooks/useBestScore'
import WinModal from '../components/common/WinModal'
import styles from './SpeedTypingPage.module.css'

export default function SpeedTypingPage() {
  const [state, setState] = useState<SpeedTypingState>(createSpeedTyping)
  const { bestScore, updateBestScore } = useBestScore('speed-typing')
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
  }, [state.isRunning, state.currentWord])

  const handleStart = useCallback(() => {
    setState(prev => startGame(prev))
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!state.isRunning) return
    setState(prev => updateInput(prev, e.target.value))
  }, [state.isRunning])

  const handleNewGame = useCallback(() => {
    setState(resetGame())
  }, [])

  const getProgressBarWidth = () => {
    return (state.timeLeft / GAME_DURATION) * 100
  }

  const isCorrectSoFar = state.currentWord && state.currentInput
    ? isInputCorrectSoFar(state.currentWord, state.currentInput)
    : true

  return (
    <div className={styles.container}>
      <GameHeader
        title="타이핑 챌린지"
        gameId="speed-typing"
        onNewGame={handleNewGame}
      />

      <div className={styles.game}>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>시간</span>
            <span className={styles.statValue}>{state.timeLeft.toFixed(1)}s</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>완료</span>
            <span className={styles.statValue}>{state.wordsCompleted}</span>
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
              5초 동안 최대한 많은 단어를 입력하세요!
            </p>
            <button className={styles.startButton} onClick={handleStart}>
              게임 시작
            </button>
          </div>
        )}

        {state.isRunning && (
          <div className={styles.typingArea}>
            <div className={styles.wordDisplay}>
              {state.currentWord}
            </div>
            <input
              ref={inputRef}
              type="text"
              value={state.currentInput}
              onChange={handleInputChange}
              className={`${styles.typingInput} ${!isCorrectSoFar ? styles.error : ''}`}
              placeholder="여기에 입력..."
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
            />
            <p className={styles.hint}>정확히 입력하면 자동으로 다음 단어!</p>
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
                <span>완료 단어</span>
                <span>{state.wordsCompleted}개</span>
              </div>
              <div className={styles.resultStat}>
                <span>분당 단어</span>
                <span>{getWordsPerMinute(state.wordsCompleted)} WPM</span>
              </div>
              <div className={styles.resultStat}>
                <span>초당 글자</span>
                <span>{getCharactersPerSecond(state.totalCharacters)} CPS</span>
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
          gameId="speed-typing"
          moves={state.wordsCompleted}
          time={`${GAME_DURATION}s`}
          timeInSeconds={GAME_DURATION}
          onPlayAgain={handleNewGame}
          customTitle="시간 종료!"
          customMessage={`${state.wordsCompleted}개 단어 완료! (${getWordsPerMinute(state.wordsCompleted)} WPM)`}
        />
      )}
    </div>
  )
}
