import { IRankingRepository } from '../../domain/ranking/types'
import { LocalStorageRankingRepository } from './LocalStorageRankingRepository'
import { SupabaseRankingRepository } from './SupabaseRankingRepository'
import { isSupabaseConfigured } from '../supabase/client'

let rankingRepository: IRankingRepository | null = null

export function getRankingRepository(): IRankingRepository {
  if (!rankingRepository) {
    if (isSupabaseConfigured()) {
      const url = import.meta.env.VITE_SUPABASE_URL
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY
      rankingRepository = new SupabaseRankingRepository(url, key)
    } else {
      rankingRepository = new LocalStorageRankingRepository()
    }
  }
  return rankingRepository
}

export function setRankingRepository(repo: IRankingRepository): void {
  rankingRepository = repo
}

export function resetRankingRepository(): void {
  rankingRepository = null
}

export { LocalStorageRankingRepository } from './LocalStorageRankingRepository'
export { SupabaseRankingRepository } from './SupabaseRankingRepository'
