/**
 * Challenge Service
 *
 * Manages daily challenges with localStorage persistence.
 * Handles challenge retrieval, result saving, and streak tracking.
 */

import {
  DailyChallenge,
  ChallengeResult,
  ChallengeData,
  generateDailyChallenge,
  getTodayDateString,
  createInitialChallengeData,
  isChallengeData,
} from '../domain/challenge/types';

const STORAGE_KEY = 'classic-games-daily-challenge';

/**
 * Loads challenge data from localStorage
 */
function loadChallengeData(): ChallengeData {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return createInitialChallengeData();
    }

    const parsed = JSON.parse(data);
    if (!isChallengeData(parsed)) {
      console.warn('Invalid challenge data in localStorage, resetting');
      return createInitialChallengeData();
    }

    return parsed;
  } catch (error) {
    console.warn('Failed to load challenge data:', error);
    return createInitialChallengeData();
  }
}

/**
 * Saves challenge data to localStorage
 */
function saveChallengeData(data: ChallengeData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save challenge data:', error);
  }
}

/**
 * Gets today's daily challenge
 */
export function getDailyChallenge(): DailyChallenge {
  return generateDailyChallenge();
}

/**
 * Checks if today's challenge has been completed
 */
export function isTodayChallengeCompleted(): boolean {
  const data = loadChallengeData();
  const today = getTodayDateString();
  return data.results.some(r => r.date === today && r.completed);
}

/**
 * Gets today's challenge result if it exists
 */
export function getTodayChallengeResult(): ChallengeResult | null {
  const data = loadChallengeData();
  const today = getTodayDateString();
  return data.results.find(r => r.date === today) || null;
}

/**
 * Saves a challenge result
 * Updates streak based on consecutive daily completions
 */
export function saveChallengeResult(
  gameId: string,
  score: number,
  targetScore: number
): ChallengeResult {
  const data = loadChallengeData();
  const today = getTodayDateString();
  const completed = score >= targetScore;

  // Check if result already exists for today
  const existingIndex = data.results.findIndex(r => r.date === today);

  const result: ChallengeResult = {
    date: today,
    gameId,
    completed,
    score,
    targetScore,
    completedAt: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    // Update existing result if new score is higher
    if (score > data.results[existingIndex].score) {
      data.results[existingIndex] = result;
    }
  } else {
    // Add new result
    data.results.push(result);
  }

  // Update streak if completed
  if (completed) {
    updateStreak(data, today);
  }

  // Keep only last 30 days of results
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0];
  data.results = data.results.filter(r => r.date >= cutoffDate);

  saveChallengeData(data);
  return result;
}

/**
 * Updates the streak based on the current completion
 */
function updateStreak(data: ChallengeData, today: string): void {
  const yesterday = getYesterdayDateString();

  if (data.lastPlayedDate === yesterday) {
    // Continue streak
    data.currentStreak += 1;
  } else if (data.lastPlayedDate === today) {
    // Already played today, don't update streak
    return;
  } else {
    // Streak broken, start new streak
    data.currentStreak = 1;
  }

  data.lastPlayedDate = today;

  // Update longest streak
  if (data.currentStreak > data.longestStreak) {
    data.longestStreak = data.currentStreak;
  }
}

/**
 * Gets yesterday's date string
 */
function getYesterdayDateString(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const year = yesterday.getFullYear();
  const month = String(yesterday.getMonth() + 1).padStart(2, '0');
  const day = String(yesterday.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Gets the current streak
 * Returns 0 if streak is broken (didn't play yesterday or today)
 */
export function getChallengeStreak(): number {
  const data = loadChallengeData();
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();

  // Check if streak is still active
  if (data.lastPlayedDate !== today && data.lastPlayedDate !== yesterday) {
    // Streak is broken
    return 0;
  }

  return data.currentStreak;
}

/**
 * Gets the longest streak achieved
 */
export function getLongestStreak(): number {
  const data = loadChallengeData();
  return data.longestStreak;
}

/**
 * Gets challenge statistics
 */
export function getChallengeStats(): {
  currentStreak: number;
  longestStreak: number;
  totalCompleted: number;
  todayCompleted: boolean;
} {
  const data = loadChallengeData();
  const today = getTodayDateString();

  return {
    currentStreak: getChallengeStreak(),
    longestStreak: data.longestStreak,
    totalCompleted: data.results.filter(r => r.completed).length,
    todayCompleted: data.results.some(r => r.date === today && r.completed),
  };
}

/**
 * Gets recent challenge results (last n days)
 */
export function getRecentResults(days: number = 7): ChallengeResult[] {
  const data = loadChallengeData();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const cutoff = cutoffDate.toISOString().split('T')[0];

  return data.results
    .filter(r => r.date >= cutoff)
    .sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * Clears all challenge data (for testing/debugging)
 */
export function clearChallengeData(): void {
  localStorage.removeItem(STORAGE_KEY);
}
