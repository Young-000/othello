/**
 * Achievement Service
 *
 * Manages achievements with localStorage persistence.
 * Handles achievement checking, unlocking, and progress tracking.
 */

import {
  Achievement,
  AchievementData,
  AchievementEvent,
  AchievementProgress,
  createInitialAchievementData,
  isAchievementData,
} from '../domain/achievement/types';
import { ACHIEVEMENTS, getAchievementById } from '../domain/achievement/achievements';

const STORAGE_KEY = 'classic-games-achievements';

/**
 * Loads achievement data from localStorage
 */
function loadAchievementData(): AchievementData {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return createInitialAchievementData();
    }

    const parsed = JSON.parse(data);
    if (!isAchievementData(parsed)) {
      console.warn('Invalid achievement data in localStorage, resetting');
      return createInitialAchievementData();
    }

    return parsed;
  } catch (error) {
    console.warn('Failed to load achievement data:', error);
    return createInitialAchievementData();
  }
}

/**
 * Saves achievement data to localStorage
 */
function saveAchievementData(data: AchievementData): void {
  try {
    data.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save achievement data:', error);
  }
}

/**
 * Gets all unlocked achievements
 */
export function getUnlockedAchievements(): Achievement[] {
  const data = loadAchievementData();
  return data.unlockedAchievements
    .map(id => getAchievementById(id))
    .filter((a): a is Achievement => a !== undefined);
}

/**
 * Gets all unlocked achievement IDs
 */
export function getUnlockedAchievementIds(): string[] {
  const data = loadAchievementData();
  return data.unlockedAchievements;
}

/**
 * Checks if an achievement is unlocked
 */
export function isAchievementUnlocked(achievementId: string): boolean {
  const data = loadAchievementData();
  return data.unlockedAchievements.includes(achievementId);
}

/**
 * Gets progress for all achievements
 */
export function getProgress(): Record<string, AchievementProgress> {
  const data = loadAchievementData();
  const progress: Record<string, AchievementProgress> = {};

  for (const achievement of ACHIEVEMENTS) {
    const currentValue = data.progress[achievement.id] || 0;
    const completed = data.unlockedAchievements.includes(achievement.id);

    progress[achievement.id] = {
      achievementId: achievement.id,
      currentValue,
      completed,
      unlockedAt: completed ? data.lastUpdated : undefined,
    };
  }

  return progress;
}

/**
 * Gets progress for a specific achievement
 */
export function getAchievementProgress(achievementId: string): AchievementProgress | null {
  const achievement = getAchievementById(achievementId);
  if (!achievement) return null;

  const data = loadAchievementData();
  const currentValue = data.progress[achievementId] || 0;
  const completed = data.unlockedAchievements.includes(achievementId);

  return {
    achievementId,
    currentValue,
    completed,
    unlockedAt: completed ? data.lastUpdated : undefined,
  };
}

/**
 * Unlocks an achievement manually
 * Returns true if the achievement was newly unlocked
 */
export function unlockAchievement(achievementId: string): boolean {
  const data = loadAchievementData();

  if (data.unlockedAchievements.includes(achievementId)) {
    return false; // Already unlocked
  }

  const achievement = getAchievementById(achievementId);
  if (!achievement) {
    console.warn(`Achievement not found: ${achievementId}`);
    return false;
  }

  data.unlockedAchievements.push(achievementId);
  saveAchievementData(data);
  return true;
}

/**
 * Updates progress for an achievement
 */
function updateProgress(achievementId: string, value: number): void {
  const data = loadAchievementData();
  data.progress[achievementId] = value;
  saveAchievementData(data);
}

/**
 * Increments progress for an achievement
 */
function incrementProgress(achievementId: string, amount: number = 1): number {
  const data = loadAchievementData();
  const currentValue = data.progress[achievementId] || 0;
  const newValue = currentValue + amount;
  data.progress[achievementId] = newValue;
  saveAchievementData(data);
  return newValue;
}

/**
 * Checks achievements based on an event and returns newly unlocked achievements
 */
export function checkAchievements(event: AchievementEvent): Achievement[] {
  const data = loadAchievementData();
  const newlyUnlocked: Achievement[] = [];

  for (const achievement of ACHIEVEMENTS) {
    // Skip already unlocked achievements
    if (data.unlockedAchievements.includes(achievement.id)) {
      continue;
    }

    const condition = achievement.condition;
    let shouldUnlock = false;

    switch (condition.type) {
      case 'game_win':
        // Unlock when winning a specific game
        if (event.type === 'game_win' && condition.gameId === event.gameId) {
          shouldUnlock = true;
        }
        break;

      case 'total_wins':
        // Unlock based on total number of wins
        if (event.type === 'game_win') {
          const winsKey = `total_wins`;
          const newWins = incrementProgress(winsKey, 1);
          if (newWins >= (condition.threshold || 1)) {
            shouldUnlock = true;
          }
        }
        break;

      case 'high_score':
        // Unlock when achieving a high score in a specific game
        if (event.type === 'score_earned' && condition.gameId === event.gameId) {
          const score = event.score || 0;
          if (score >= (condition.threshold || 0)) {
            shouldUnlock = true;
          }
        }
        break;

      case 'total_score':
        // Unlock based on cumulative score
        if (event.type === 'score_earned' && event.score) {
          const scoreKey = `total_score`;
          const currentTotal = data.progress[scoreKey] || 0;
          const newTotal = currentTotal + event.score;
          updateProgress(scoreKey, newTotal);
          if (newTotal >= (condition.threshold || 0)) {
            shouldUnlock = true;
          }
        }
        break;

      case 'streak':
        // Unlock based on daily challenge streak
        if (event.type === 'streak_updated' && event.streak) {
          if (event.streak >= (condition.threshold || 0)) {
            shouldUnlock = true;
          }
        }
        break;

      case 'games_played':
        // Unlock based on number of unique games played
        if (event.type === 'game_played' || event.type === 'game_win') {
          const playedGamesKey = `played_games`;
          let playedGames: string[] = [];
          try {
            const playedStr = localStorage.getItem('classic-games-played-games');
            if (playedStr) {
              playedGames = JSON.parse(playedStr);
            }
          } catch {
            playedGames = [];
          }

          if (!playedGames.includes(event.gameId)) {
            playedGames.push(event.gameId);
            try {
              localStorage.setItem('classic-games-played-games', JSON.stringify(playedGames));
            } catch {
              // Ignore storage errors
            }
          }

          updateProgress(playedGamesKey, playedGames.length);

          if (playedGames.length >= (condition.threshold || 0)) {
            shouldUnlock = true;
          }
        }
        break;

      case 'perfect_game':
        // Unlock when completing a perfect game
        if (event.type === 'perfect_game' && condition.gameId === event.gameId && event.isPerfect) {
          shouldUnlock = true;
        }
        break;
    }

    if (shouldUnlock) {
      data.unlockedAchievements.push(achievement.id);
      newlyUnlocked.push(achievement);
    }
  }

  if (newlyUnlocked.length > 0) {
    saveAchievementData(data);
  }

  return newlyUnlocked;
}

/**
 * Gets achievement statistics
 */
export function getAchievementStats(): {
  total: number;
  unlocked: number;
  percentage: number;
  recentUnlocks: Achievement[];
} {
  const data = loadAchievementData();
  const total = ACHIEVEMENTS.length;
  const unlocked = data.unlockedAchievements.length;
  const percentage = Math.round((unlocked / total) * 100);

  // Get recent unlocks (last 5)
  const recentUnlocks = data.unlockedAchievements
    .slice(-5)
    .reverse()
    .map(id => getAchievementById(id))
    .filter((a): a is Achievement => a !== undefined);

  return {
    total,
    unlocked,
    percentage,
    recentUnlocks,
  };
}

/**
 * Gets all achievements with their unlock status
 */
export function getAllAchievementsWithStatus(): (Achievement & { unlocked: boolean })[] {
  const data = loadAchievementData();
  return ACHIEVEMENTS.map(achievement => ({
    ...achievement,
    unlocked: data.unlockedAchievements.includes(achievement.id),
  }));
}

/**
 * Clears all achievement data (for testing/debugging)
 */
export function clearAchievementData(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem('classic-games-played-games');
}

/**
 * Gets the count of unique games played
 */
export function getPlayedGamesCount(): number {
  try {
    const playedStr = localStorage.getItem('classic-games-played-games');
    if (playedStr) {
      const playedGames = JSON.parse(playedStr);
      return Array.isArray(playedGames) ? playedGames.length : 0;
    }
  } catch {
    // Ignore
  }
  return 0;
}

/**
 * Gets the list of played games
 */
export function getPlayedGames(): string[] {
  try {
    const playedStr = localStorage.getItem('classic-games-played-games');
    if (playedStr) {
      const playedGames = JSON.parse(playedStr);
      return Array.isArray(playedGames) ? playedGames : [];
    }
  } catch {
    // Ignore
  }
  return [];
}
