import { useState, useEffect, useCallback } from 'react';
import GameHeader from '../components/common/GameHeader';
import {
  createArrowKeys,
  startGame,
  pressKey,
  updateTime,
  resetGame,
  calculateScore,
  getAverageResponseTime,
  getAccuracy,
  getRating,
  DIRECTION_ARROWS,
  GAME_DURATION,
  ArrowKeysState,
} from '../domain/game/minigames/ArrowKeys';
import { useBestScore } from '../hooks/useBestScore';
import WinModal from '../components/common/WinModal';
import styles from './ArrowKeysPage.module.css';

export default function ArrowKeysPage() {
  const [state, setState] = useState<ArrowKeysState>(createArrowKeys);
  const { bestScore, updateBestScore } = useBestScore('arrow-keys');

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

  // Keyboard event handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!state.isRunning || state.isComplete) return;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        setState((prev) => pressKey(prev, e.key));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.isRunning, state.isComplete]);

  const handleStart = useCallback(() => {
    if (!state.isRunning && !state.isComplete) {
      setState((prev) => startGame(prev));
    }
  }, [state.isRunning, state.isComplete]);

  const handleNewGame = useCallback(() => {
    setState(resetGame());
  }, []);

  const avgResponseTime = getAverageResponseTime(state);
  const accuracy = getAccuracy(state);
  const score = calculateScore(state.correctCount, avgResponseTime);

  return (
    <div className={styles.container}>
      <GameHeader
        title="방향 반응"
        gameId="arrow-keys"
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
            <span className={styles.startIcon}>⬆️⬇️⬅️➡️</span>
            <span className={styles.startText}>시작하기</span>
            <span className={styles.startHint}>클릭하고 방향키를 누르세요!</span>
          </button>
        )}

        {state.isRunning && state.currentDirection && (
          <div className={styles.arrowArea}>
            <div className={styles.arrow}>
              {DIRECTION_ARROWS[state.currentDirection]}
            </div>
            <p className={styles.hint}>방향키를 누르세요!</p>
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

        {state.isRunning && (
          <div className={styles.keyHints}>
            <span className={styles.keyHint}>↑</span>
            <div className={styles.keyRow}>
              <span className={styles.keyHint}>←</span>
              <span className={styles.keyHint}>↓</span>
              <span className={styles.keyHint}>→</span>
            </div>
          </div>
        )}
      </div>

      {state.isComplete && (
        <WinModal
          gameId="arrow-keys"
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
