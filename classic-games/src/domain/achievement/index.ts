/**
 * Achievement Domain - Public API
 */

// Types
export type {
  Achievement,
  AchievementCondition,
  AchievementProgress,
  AchievementData,
  AchievementEvent,
} from './types';

export {
  createInitialAchievementData,
  isAchievementData,
  isAchievement,
} from './types';

// Achievement definitions
export {
  ACHIEVEMENTS,
  ALL_GAME_IDS,
  getAchievementById,
  getAchievementsByCategory,
  getTotalAchievementCount,
} from './achievements';

export type { GameId } from './achievements';
