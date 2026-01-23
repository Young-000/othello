import {
  createContext,
  useContext,
  useCallback,
  useState,
  ReactNode,
  useMemo,
} from 'react';
import { Achievement, AchievementEvent } from '../domain/achievement/types';
import {
  checkAchievements,
  getUnlockedAchievements,
  getUnlockedAchievementIds,
  getAchievementStats,
  getAllAchievementsWithStatus,
} from '../services/achievementService';
import { AchievementNotificationContainer } from '../components/common/AchievementNotification';

interface AchievementContextValue {
  /** Trigger an achievement event and check for unlocks */
  triggerEvent: (event: AchievementEvent) => void;
  /** Get all unlocked achievements */
  unlockedAchievements: Achievement[];
  /** Get all unlocked achievement IDs */
  unlockedIds: string[];
  /** Get achievement statistics */
  stats: {
    total: number;
    unlocked: number;
    percentage: number;
    recentUnlocks: Achievement[];
  };
  /** Get all achievements with their unlock status */
  allAchievements: (Achievement & { unlocked: boolean })[];
  /** Refresh achievement data */
  refresh: () => void;
}

const AchievementContext = createContext<AchievementContextValue | null>(null);

interface AchievementProviderProps {
  children: ReactNode;
}

export function AchievementProvider({ children }: AchievementProviderProps) {
  // Pending notifications queue
  const [pendingNotifications, setPendingNotifications] = useState<Achievement[]>([]);

  // Achievement state
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>(() =>
    getUnlockedAchievements()
  );
  const [unlockedIds, setUnlockedIds] = useState<string[]>(() =>
    getUnlockedAchievementIds()
  );
  const [stats, setStats] = useState(() => getAchievementStats());
  const [allAchievements, setAllAchievements] = useState(() =>
    getAllAchievementsWithStatus()
  );

  // Refresh all achievement data
  const refresh = useCallback(() => {
    setUnlockedAchievements(getUnlockedAchievements());
    setUnlockedIds(getUnlockedAchievementIds());
    setStats(getAchievementStats());
    setAllAchievements(getAllAchievementsWithStatus());
  }, []);

  // Trigger an achievement event
  const triggerEvent = useCallback((event: AchievementEvent) => {
    const newlyUnlocked = checkAchievements(event);

    if (newlyUnlocked.length > 0) {
      // Add to notification queue
      setPendingNotifications((prev) => [...prev, ...newlyUnlocked]);
      // Refresh achievement data
      refresh();
    }
  }, [refresh]);

  // Dismiss a notification
  const dismissNotification = useCallback((id: string) => {
    setPendingNotifications((prev) => prev.filter((a) => a.id !== id));
  }, []);

  // Memoize context value
  const contextValue = useMemo<AchievementContextValue>(
    () => ({
      triggerEvent,
      unlockedAchievements,
      unlockedIds,
      stats,
      allAchievements,
      refresh,
    }),
    [triggerEvent, unlockedAchievements, unlockedIds, stats, allAchievements, refresh]
  );

  return (
    <AchievementContext.Provider value={contextValue}>
      {children}
      <AchievementNotificationContainer
        achievements={pendingNotifications}
        onDismiss={dismissNotification}
      />
    </AchievementContext.Provider>
  );
}

/**
 * Hook to access achievement context
 */
export function useAchievements(): AchievementContextValue {
  const context = useContext(AchievementContext);
  if (!context) {
    throw new Error('useAchievements must be used within an AchievementProvider');
  }
  return context;
}

/**
 * Hook to trigger achievement events (simplified API)
 */
export function useAchievementTrigger() {
  const { triggerEvent } = useAchievements();

  return {
    /** Called when a player wins a game */
    onGameWin: useCallback(
      (gameId: string, score?: number) => {
        triggerEvent({ type: 'game_win', gameId, score });
        if (score !== undefined) {
          triggerEvent({ type: 'score_earned', gameId, score });
        }
      },
      [triggerEvent]
    ),

    /** Called when a player plays a game (even without winning) */
    onGamePlayed: useCallback(
      (gameId: string) => {
        triggerEvent({ type: 'game_played', gameId });
      },
      [triggerEvent]
    ),

    /** Called when a player earns a score */
    onScoreEarned: useCallback(
      (gameId: string, score: number) => {
        triggerEvent({ type: 'score_earned', gameId, score });
      },
      [triggerEvent]
    ),

    /** Called when daily challenge streak is updated */
    onStreakUpdated: useCallback(
      (streak: number) => {
        triggerEvent({ type: 'streak_updated', gameId: '', streak });
      },
      [triggerEvent]
    ),

    /** Called when a perfect game is achieved */
    onPerfectGame: useCallback(
      (gameId: string) => {
        triggerEvent({ type: 'perfect_game', gameId, isPerfect: true });
      },
      [triggerEvent]
    ),
  };
}

export default AchievementContext;
