import { useState, useEffect, useCallback } from 'react';
import GameHeader from '../components/common/GameHeader';
import {
  createNumberCompare,
  startGame,
  answer,
  updateTime,
  resetGame,
  calculateScore,
  getAverageResponseTime,
  getAccuracy,
  getRating,
  GAME_DURATION,
  NumberCompareState,
  Answer,
} from '../domain/game/minigames/NumberCompare';
import { useBestScore } from '../hooks/useBestScore';
import WinModal from '../components/common/WinModal';
import styles from './NumberComparePage.module.css';

export default function NumberComparePage() {
  const [state, setState] = useState<NumberCompareState>(createNumberCompare);
  const { bestScore, updateBestScore } = useBestScore('number-compare');

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (state.isRunning) {
      interval = setInterval(() => {
        setState((prev) => updateTime(prev));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [state.isRunning]);

  useEffect(() => {
    if (state.isComplete) {
      const avgTime = getAverageResponseTime(state);
      const score = calculateScore(state.correctCount, avgTime);
      updateBestScore(score);
    }
  }, [state.isComplete, state.correctCount, state, updateBestScore]);

  const handleStart = useCallback(() => {
    if (!state.isRunning && !state.isComplete) {
      setState((prev) => startGame(prev));
    }
  }, [state.isRunning, state.isComplete]);

  const handleAnswer = useCallback(
    (userAnswer: Answer) => {
      if (state.isRunning && !state.isComplete) {
        setState((prev) => answer(prev, userAnswer));
      }
    },
    [state.isRunning, state.isComplete]
  );

  const handleNewGame = useCallback(() => {
    setState(resetGame());
  }, []);

  const avgResponseTime = getAverageResponseTime(state);
  const accuracy = getAccuracy(state);
  const score = calculateScore(state.correctCount, avgResponseTime);

  return (
    <div className={styles.container}>
      <GameHeader
        title="크기 비교"
        gameId="number-compare"
        onNewGame={handleNewGame}
      />

      <div className={styles.game}>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>시간</span>
            <span className={styles.statValue}>{state.timeLeft}초</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>정답</span>
            <span className={styles.statValue}>{state.correctCount}</span>
          </div>
        </div>

        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${(state.timeLeft / GAME_DURATION) * 100}%` }}
          />
        </div>

        {!state.isRunning && !state.isComplete && (
          <button className={styles.startButton} onClick={handleStart}>
            <span className={styles.startIcon}>⚖️</span>
            <span className={styles.startText}>시작하기</span>
            <span className={styles.startHint}>더 큰 숫자를 클릭하세요!</span>
          </button>
        )}

        {state.isRunning && state.currentPair && (
          <div className={styles.compareArea}>
            <p className={styles.question}>더 큰 숫자를 클릭하세요!</p>
            <div className={styles.numbers}>
              <button
                className={styles.numberButton}
                onClick={() => handleAnswer('left')}
              >
                {state.currentPair.left}
              </button>
              <span className={styles.vs}>VS</span>
              <button
                className={styles.numberButton}
                onClick={() => handleAnswer('right')}
              >
                {state.currentPair.right}
              </button>
            </div>
          </div>
        )}

        {state.isComplete && (
          <div className={styles.result}>
            <span className={styles.resultScore}>{state.correctCount}개 정답!</span>
            <span className={styles.resultRating}>{getRating(state.correctCount)}</span>
            <div className={styles.resultDetails}>
              <span>정확도: {accuracy}%</span>
              <span>평균 반응: {avgResponseTime}ms</span>
            </div>
          </div>
        )}

        {bestScore !== null && (
          <p className={styles.bestScore}>최고 점수: {bestScore}</p>
        )}
      </div>

      {state.isComplete && (
        <WinModal
          gameId="number-compare"
          moves={state.correctCount}
          time={`${GAME_DURATION}초`}
          timeInSeconds={GAME_DURATION}
          onPlayAgain={handleNewGame}
          customTitle="게임 종료!"
          customMessage={`${state.correctCount}개 정답! (정확도 ${accuracy}%)`}
          extra={{ gameScore: score }}
        />
      )}
    </div>
  );
}
