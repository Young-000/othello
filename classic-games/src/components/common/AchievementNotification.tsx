import { useEffect, useState } from 'react';
import { Achievement } from '../../domain/achievement/types';
import styles from './AchievementNotification.module.css';

interface AchievementNotificationProps {
  achievement: Achievement;
  onDismiss: () => void;
  duration?: number;
}

export default function AchievementNotification({
  achievement,
  onDismiss,
  duration = 4000,
}: AchievementNotificationProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, duration - 300); // Start exit animation 300ms before dismiss

    const dismissTimer = setTimeout(() => {
      onDismiss();
    }, duration);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(dismissTimer);
    };
  }, [duration, onDismiss]);

  const handleClick = () => {
    setIsExiting(true);
    setTimeout(onDismiss, 300);
  };

  return (
    <div
      className={`${styles.notification} ${isExiting ? styles.exiting : ''}`}
      onClick={handleClick}
      role="alert"
      aria-live="polite"
    >
      <div className={styles.iconContainer}>
        <span className={styles.icon}>{achievement.icon}</span>
        <div className={styles.glow} />
      </div>
      <div className={styles.content}>
        <div className={styles.label}>업적 달성!</div>
        <div className={styles.name}>{achievement.name}</div>
        <div className={styles.description}>{achievement.description}</div>
      </div>
      <div className={styles.closeHint}>탭하여 닫기</div>
    </div>
  );
}

interface AchievementNotificationContainerProps {
  achievements: Achievement[];
  onDismiss: (id: string) => void;
}

export function AchievementNotificationContainer({
  achievements,
  onDismiss,
}: AchievementNotificationContainerProps) {
  if (achievements.length === 0) return null;

  return (
    <div className={styles.container}>
      {achievements.map((achievement) => (
        <AchievementNotification
          key={achievement.id}
          achievement={achievement}
          onDismiss={() => onDismiss(achievement.id)}
        />
      ))}
    </div>
  );
}
