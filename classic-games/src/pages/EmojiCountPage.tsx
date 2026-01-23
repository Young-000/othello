import { useState, useEffect, useCallback } from 'react';
import GameHeader from '../components/common/GameHeader';
import {
  createEmojiCount,
  startGame,
  answer,
  updateTime,
  resetGame,
  calculateScore,
  getAverageResponseTime,
  getAccuracy,
  getRating,
  GAME_DURATION,
  EmojiCountState,
} from '../domain/game/minigames/EmojiCount';
import { useBestScore } from '../hooks/useBestScore';
import WinModal from '../components/common/WinModal';
import styles from './EmojiCountPage.module.css';

export default function EmojiCountPage() {
  const [state, setState] = useState<EmojiCountState>(createEmojiCount);
  const { bestScore, updateBestScore } = useBestScore('emoji-count');

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
    (selectedCount: number) => {
      if (state.isRunning && !state.isComplete) {
        setState((prev) => answer(prev, selectedCount));
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
        title="이모지 카운트"
        gameId="emoji-count"
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
            <span className={styles.startIcon}>🔍</span>
            <span className={styles.startText}>시작하기</span>
            <span className={styles.startHint}>특정 이모지가 몇 개인지 세어보세요!</span>
          </button>
        )}

        {state.isRunning && state.currentGrid && (
          <div className={styles.countArea}>
            <div className={styles.question}>
              <span className={styles.targetEmoji}>{state.currentGrid.targetEmoji}</span>
              <span className={styles.questionText}>가 몇 개?</span>
            </div>

            <div className={styles.grid}>
              {state.currentGrid.emojis.map((emoji, index) => (
                <span key={index} className={styles.gridEmoji}>
                  {emoji}
                </span>
              ))}
            </div>

            <div className={styles.options}>
              {state.currentGrid.options.map((option) => (
                <button
                  key={option}
                  className={styles.optionButton}
                  onClick={() => handleAnswer(option)}
                >
                  {option}
                </button>
              ))}
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
          gameId="emoji-count"
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
