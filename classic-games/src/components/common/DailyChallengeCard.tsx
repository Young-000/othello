import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getDailyChallenge,
  getChallengeStats,
  getTodayChallengeResult,
} from '../../services/challengeService';
import { DailyChallenge, ChallengeResult } from '../../domain/challenge/types';
import styles from './DailyChallengeCard.module.css';

interface ChallengeStats {
  currentStreak: number;
  longestStreak: number;
  totalCompleted: number;
  todayCompleted: boolean;
}

export default function DailyChallengeCard() {
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [stats, setStats] = useState<ChallengeStats | null>(null);
  const [todayResult, setTodayResult] = useState<ChallengeResult | null>(null);

  useEffect(() => {
    setChallenge(getDailyChallenge());
    setStats(getChallengeStats());
    setTodayResult(getTodayChallengeResult());
  }, []);

  if (!challenge || !stats) {
    return null;
  }

  const isCompleted = stats.todayCompleted;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <span className={styles.calendarIcon} role="img" aria-label="Daily Challenge">
            &#x1F4C5;
          </span>
          <h2 className={styles.title}>Daily Challenge</h2>
          {isCompleted && (
            <span className={styles.completedBadge} role="img" aria-label="Completed">
              &#x2705;
            </span>
          )}
        </div>
        <div className={styles.streak}>
          <span className={styles.fireIcon} role="img" aria-label="Streak">
            &#x1F525;
          </span>
          <span className={styles.streakCount}>{stats.currentStreak}</span>
          <span className={styles.streakLabel}>day streak</span>
        </div>
      </div>

      <div className={styles.challengeInfo}>
        <div className={styles.gameInfo}>
          <span className={styles.gameIcon}>{challenge.gameIcon}</span>
          <div className={styles.gameDetails}>
            <span className={styles.gameName}>{challenge.gameName}</span>
            <span className={styles.targetScore}>
              Target: {challenge.targetScore.toLocaleString()} pts
            </span>
          </div>
        </div>

        {todayResult && (
          <div className={styles.resultInfo}>
            <span className={styles.resultLabel}>Your Score:</span>
            <span
              className={`${styles.resultScore} ${
                todayResult.completed ? styles.success : styles.pending
              }`}
            >
              {todayResult.score.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      <Link
        to={challenge.gamePath}
        className={`${styles.playButton} ${isCompleted ? styles.playAgain : ''}`}
      >
        {isCompleted ? 'Play Again' : 'Play Challenge'}
        <span className={styles.arrow}>&#x2192;</span>
      </Link>

      {stats.longestStreak > 0 && (
        <div className={styles.statsRow}>
          <span className={styles.statItem}>
            <span className={styles.trophyIcon} role="img" aria-label="Best Streak">
              &#x1F3C6;
            </span>
            Best: {stats.longestStreak} days
          </span>
          <span className={styles.statItem}>
            <span className={styles.checkIcon} role="img" aria-label="Total Completed">
              &#x2705;
            </span>
            Total: {stats.totalCompleted}
          </span>
        </div>
      )}
    </div>
  );
}
