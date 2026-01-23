/**
 * Achievement Domain Types
 *
 * Provides interfaces and functions for the achievement system.
 * Achievements are unlocked based on player actions and progress.
 */

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'game' | 'streak' | 'score' | 'exploration';
  condition: AchievementCondition;
  unlockedAt?: string;
}

export interface AchievementCondition {
  type: 'game_win' | 'total_wins' | 'streak' | 'high_score' | 'games_played' | 'perfect_game' | 'total_score';
  gameId?: string;
  threshold?: number;
}

export interface AchievementProgress {
  achievementId: string;
  currentValue: number;
  completed: boolean;
  unlockedAt?: string;
}

export interface AchievementData {
  unlockedAchievements: string[];
  progress: Record<string, number>;
  lastUpdated: string;
}

export interface AchievementEvent {
  type: 'game_win' | 'game_played' | 'score_earned' | 'streak_updated' | 'perfect_game';
  gameId: string;
  score?: number;
  streak?: number;
  isPerfect?: boolean;
}

/**
 * Creates initial achievement data
 */
export function createInitialAchievementData(): AchievementData {
  return {
    unlockedAchievements: [],
    progress: {},
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Type guard for AchievementData
 */
export function isAchievementData(obj: unknown): obj is AchievementData {
  if (!obj || typeof obj !== 'object') return false;
  const data = obj as Record<string, unknown>;
  return (
    Array.isArray(data.unlockedAchievements) &&
    typeof data.progress === 'object' &&
    data.progress !== null &&
    typeof data.lastUpdated === 'string'
  );
}

/**
 * Type guard for Achievement
 */
export function isAchievement(obj: unknown): obj is Achievement {
  if (!obj || typeof obj !== 'object') return false;
  const achievement = obj as Record<string, unknown>;
  return (
    typeof achievement.id === 'string' &&
    typeof achievement.name === 'string' &&
    typeof achievement.description === 'string' &&
    typeof achievement.icon === 'string' &&
    ['game', 'streak', 'score', 'exploration'].includes(achievement.category as string) &&
    typeof achievement.condition === 'object' &&
    achievement.condition !== null
  );
}
