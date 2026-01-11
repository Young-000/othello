import { getSupabase, isSupabaseConfigured } from '../infrastructure/supabase/client'

export interface RankingEntry {
  id: string
  playerName: string
  score: number
  moves: number
  time: number // in seconds
  date: string
  difficulty?: string
}

export interface GameRankings {
  [gameId: string]: RankingEntry[]
}

export interface GlobalRankingEntry {
  id: string
  game_id: string
  player_name: string
  score: number
  moves: number | null
  time_seconds: number | null
  difficulty: string | null
  created_at: string
}

const STORAGE_KEY = 'classic-games-rankings'
const MAX_ENTRIES_PER_GAME = 10

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export function getRankings(): GameRankings {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

export function getGameRankings(gameId: string): RankingEntry[] {
  const rankings = getRankings()
  return rankings[gameId] || []
}

export function saveRanking(
  gameId: string,
  entry: Omit<RankingEntry, 'id' | 'date'>
): RankingEntry {
  const rankings = getRankings()
  const gameRankings = rankings[gameId] || []

  const newEntry: RankingEntry = {
    ...entry,
    id: generateId(),
    date: new Date().toISOString(),
  }

  gameRankings.push(newEntry)

  // Sort by score (higher is better for most games)
  // For time-based games, lower time with same score is better
  gameRankings.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    if (a.time !== b.time) return a.time - b.time
    return a.moves - b.moves
  })

  // Keep only top entries
  rankings[gameId] = gameRankings.slice(0, MAX_ENTRIES_PER_GAME)

  localStorage.setItem(STORAGE_KEY, JSON.stringify(rankings))

  return newEntry
}

export function clearGameRankings(gameId: string): void {
  const rankings = getRankings()
  delete rankings[gameId]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rankings))
}

export function clearAllRankings(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function isTopScore(gameId: string, score: number, time: number): boolean {
  const rankings = getGameRankings(gameId)

  if (rankings.length < MAX_ENTRIES_PER_GAME) return true

  const lowestEntry = rankings[rankings.length - 1]
  if (score > lowestEntry.score) return true
  if (score === lowestEntry.score && time < lowestEntry.time) return true

  return false
}

export function calculateScore(
  gameId: string,
  moves: number,
  timeInSeconds: number,
  won: boolean,
  extra?: { difficulty?: string; completedSuits?: number; removedCards?: number }
): number {
  if (!won) return 0

  switch (gameId) {
    case 'klondike':
    case 'freecell': {
      // Base score for winning + time bonus - move penalty
      const baseScore = 1000
      const timeBonus = Math.max(0, 500 - timeInSeconds)
      const movePenalty = moves * 2
      return Math.max(0, baseScore + timeBonus - movePenalty)
    }
    case 'spider': {
      const suits = extra?.completedSuits || 8
      const baseScore = suits * 125
      const timeBonus = Math.max(0, 1000 - timeInSeconds)
      const movePenalty = moves
      return Math.max(0, baseScore + timeBonus - movePenalty)
    }
    case 'pyramid': {
      const removed = extra?.removedCards || 28
      const baseScore = removed * 50
      const timeBonus = Math.max(0, 300 - timeInSeconds)
      return Math.max(0, baseScore + timeBonus)
    }
    case '2048': {
      // Score is directly from the game (sum of merged tiles)
      return moves // In 2048, moves is actually the score from the game
    }
    case 'sudoku': {
      const difficultyMultiplier =
        extra?.difficulty === 'hard' ? 3 :
        extra?.difficulty === 'medium' ? 2 : 1
      const baseScore = 500 * difficultyMultiplier
      const timeBonus = Math.max(0, (300 * difficultyMultiplier) - timeInSeconds)
      return Math.max(0, baseScore + timeBonus)
    }
    case 'minesweeper': {
      const difficultyMultiplier =
        extra?.difficulty === 'hard' ? 3 :
        extra?.difficulty === 'medium' ? 2 : 1
      const baseScore = 500 * difficultyMultiplier
      const timeBonus = Math.max(0, (200 * difficultyMultiplier) - timeInSeconds)
      return Math.max(0, baseScore + timeBonus)
    }
    case 'memory': {
      const baseScore = 1000
      const movePenalty = (moves - 8) * 20 // Minimum possible moves is 8 for 8 pairs
      const timeBonus = Math.max(0, 120 - timeInSeconds)
      return Math.max(0, baseScore - movePenalty + timeBonus)
    }
    default:
      return 0
  }
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Global Ranking (Supabase) Functions
export async function saveToGlobalRanking(
  gameId: string,
  entry: Omit<RankingEntry, 'id' | 'date'>
): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, skipping global ranking save')
    return false
  }

  const supabase = getSupabase()
  if (!supabase) return false

  try {
    const { error } = await supabase.from('game_rankings').insert({
      game_id: gameId,
      player_name: entry.playerName,
      score: entry.score,
      moves: entry.moves || null,
      time_seconds: entry.time || null,
      difficulty: entry.difficulty || null,
    })

    if (error) {
      console.error('Failed to save to global ranking:', error)
      return false
    }

    return true
  } catch (err) {
    console.error('Error saving to global ranking:', err)
    return false
  }
}

export async function getGlobalRankings(
  gameId: string,
  limit: number = 10
): Promise<GlobalRankingEntry[]> {
  if (!isSupabaseConfigured()) {
    return []
  }

  const supabase = getSupabase()
  if (!supabase) return []

  try {
    const { data, error } = await supabase
      .from('game_rankings')
      .select('*')
      .eq('game_id', gameId)
      .order('score', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Failed to fetch global rankings:', error)
      return []
    }

    return data || []
  } catch (err) {
    console.error('Error fetching global rankings:', err)
    return []
  }
}

export async function getAllGlobalRankings(
  limit: number = 50
): Promise<GlobalRankingEntry[]> {
  if (!isSupabaseConfigured()) {
    return []
  }

  const supabase = getSupabase()
  if (!supabase) return []

  try {
    const { data, error } = await supabase
      .from('game_rankings')
      .select('*')
      .order('score', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Failed to fetch all global rankings:', error)
      return []
    }

    return data || []
  } catch (err) {
    console.error('Error fetching all global rankings:', err)
    return []
  }
}
