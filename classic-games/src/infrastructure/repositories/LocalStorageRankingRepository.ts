import {
  IRankingRepository,
  RankingEntry,
  CreateRankingInput,
  validateRankingInput,
  sanitizePlayerName,
  isRankingEntry,
} from '../../domain/ranking/types'

const STORAGE_KEY = 'classic-games-rankings'
const MAX_ENTRIES_PER_GAME = 10

function generateId(): string {
  // Use crypto.randomUUID if available, fallback to timestamp + random
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export class LocalStorageRankingRepository implements IRankingRepository {
  async getAll(gameId: string): Promise<RankingEntry[]> {
    const rankings = this.getAllRankings()
    return rankings[gameId] || []
  }

  async save(gameId: string, input: CreateRankingInput): Promise<RankingEntry> {
    // Validate and sanitize input
    validateRankingInput(input)
    const sanitizedInput = {
      ...input,
      playerName: sanitizePlayerName(input.playerName),
    }

    const rankings = this.getAllRankings()
    const gameRankings = rankings[gameId] || []

    const newEntry: RankingEntry = {
      ...sanitizedInput,
      id: generateId(),
      date: new Date().toISOString(),
      gameId,
    }

    gameRankings.push(newEntry)
    gameRankings.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      if (a.time !== b.time) return a.time - b.time
      return a.moves - b.moves
    })

    rankings[gameId] = gameRankings.slice(0, MAX_ENTRIES_PER_GAME)

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rankings))
    } catch (error) {
      // Handle QuotaExceededError
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded, clearing old data')
        this.clearOldestEntries(rankings)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(rankings))
      } else {
        throw error
      }
    }

    return newEntry
  }

  async clear(gameId: string): Promise<void> {
    const rankings = this.getAllRankings()
    delete rankings[gameId]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rankings))
  }

  async clearAll(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY)
  }

  private getAllRankings(): Record<string, RankingEntry[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      if (!data) return {}

      const parsed = JSON.parse(data)
      return this.validateAndSanitizeRankings(parsed)
    } catch {
      // If data is corrupted, start fresh
      localStorage.removeItem(STORAGE_KEY)
      return {}
    }
  }

  private validateAndSanitizeRankings(data: unknown): Record<string, RankingEntry[]> {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return {}
    }

    const result: Record<string, RankingEntry[]> = {}
    const rankings = data as Record<string, unknown>

    for (const [gameId, entries] of Object.entries(rankings)) {
      if (!Array.isArray(entries)) continue

      const validEntries = entries.filter(isRankingEntry)
      if (validEntries.length > 0) {
        result[gameId] = validEntries
      }
    }

    return result
  }

  private clearOldestEntries(rankings: Record<string, RankingEntry[]>): void {
    // Remove half of entries from each game to free up space
    for (const gameId of Object.keys(rankings)) {
      const entries = rankings[gameId]
      if (entries.length > 5) {
        rankings[gameId] = entries.slice(0, Math.ceil(entries.length / 2))
      }
    }
  }
}
