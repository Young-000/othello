import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  IRankingRepository,
  RankingEntry,
  CreateRankingInput,
  validateRankingInput,
  sanitizePlayerName,
} from '../../domain/ranking/types'

const MAX_ENTRIES_PER_GAME = 10
const CLEANUP_THRESHOLD = 15 // Only cleanup when entries exceed this

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ClassicGamesSupabaseClient = SupabaseClient<any, 'classic_games', 'classic_games'>

interface DbRankingRow {
  id: string
  player_name: string
  score: number
  moves: number
  time: number
  created_at: string
  difficulty: string | null
  game_id: string
}

export class SupabaseRankingRepository implements IRankingRepository {
  private client: ClassicGamesSupabaseClient

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.client = createClient(supabaseUrl, supabaseKey, {
      db: {
        schema: 'classic_games',
      },
    })
  }

  async getAll(gameId: string): Promise<RankingEntry[]> {
    const { data, error } = await this.client
      .from('rankings')
      .select('*')
      .eq('game_id', gameId)
      .order('score', { ascending: false })
      .order('time', { ascending: true })
      .limit(MAX_ENTRIES_PER_GAME)

    if (error) {
      console.error('Failed to fetch rankings:', error)
      throw new Error(`Failed to fetch rankings: ${error.message}`)
    }

    return (data || []).map(this.mapToRankingEntry)
  }

  async save(gameId: string, input: CreateRankingInput): Promise<RankingEntry> {
    // Validate and sanitize input
    validateRankingInput(input)
    const sanitizedInput = {
      ...input,
      playerName: sanitizePlayerName(input.playerName),
    }

    const { data, error } = await this.client
      .from('rankings')
      .insert({
        game_id: gameId,
        player_name: sanitizedInput.playerName,
        score: sanitizedInput.score,
        moves: sanitizedInput.moves,
        time: sanitizedInput.time,
        difficulty: sanitizedInput.difficulty,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to save ranking: ${error.message}`)
    }

    // Only cleanup periodically to reduce race conditions
    // Use a higher threshold to batch cleanups
    this.scheduleCleanup(gameId)

    return this.mapToRankingEntry(data)
  }

  async clear(gameId: string): Promise<void> {
    const { error } = await this.client
      .from('rankings')
      .delete()
      .eq('game_id', gameId)

    if (error) {
      throw new Error(`Failed to clear rankings: ${error.message}`)
    }
  }

  async clearAll(): Promise<void> {
    // Use gt with a very old timestamp to delete all records
    // This is safer and more explicit than neq('id', '')
    const { error } = await this.client
      .from('rankings')
      .delete()
      .gt('created_at', '1970-01-01')

    if (error) {
      throw new Error(`Failed to clear all rankings: ${error.message}`)
    }
  }

  // Use debounced cleanup to reduce race conditions
  private cleanupTimers = new Map<string, ReturnType<typeof setTimeout>>()

  private scheduleCleanup(gameId: string): void {
    // Cancel any existing scheduled cleanup for this game
    const existingTimer = this.cleanupTimers.get(gameId)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    // Schedule cleanup after a short delay to batch multiple saves
    const timer = setTimeout(() => {
      this.cleanupOldEntries(gameId)
      this.cleanupTimers.delete(gameId)
    }, 1000)

    this.cleanupTimers.set(gameId, timer)
  }

  private async cleanupOldEntries(gameId: string): Promise<void> {
    try {
      const { data: allEntries, error } = await this.client
        .from('rankings')
        .select('id, score, time')
        .eq('game_id', gameId)
        .order('score', { ascending: false })
        .order('time', { ascending: true })

      if (error) {
        console.error('Failed to fetch entries for cleanup:', error)
        return
      }

      // Only cleanup if significantly over the limit
      if (allEntries && allEntries.length > CLEANUP_THRESHOLD) {
        const idsToDelete = allEntries
          .slice(MAX_ENTRIES_PER_GAME)
          .map(e => e.id)

        const { error: deleteError } = await this.client
          .from('rankings')
          .delete()
          .in('id', idsToDelete)

        if (deleteError) {
          console.error('Failed to cleanup old entries:', deleteError)
        }
      }
    } catch (err) {
      console.error('Cleanup failed:', err)
    }
  }

  private mapToRankingEntry(data: DbRankingRow): RankingEntry {
    return {
      id: data.id,
      playerName: data.player_name,
      score: data.score,
      moves: data.moves,
      time: data.time,
      date: data.created_at,
      difficulty: data.difficulty ?? undefined,
      gameId: data.game_id,
    }
  }
}
