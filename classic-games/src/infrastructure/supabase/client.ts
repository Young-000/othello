import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ClassicGamesSupabaseClient = SupabaseClient<any, 'classic_games', 'classic_games'>

let supabaseInstance: ClassicGamesSupabaseClient | null = null

function isValidSupabaseUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    // Supabase URLs typically end with .supabase.co or similar
    return parsed.protocol === 'https:' && url.length > 10
  } catch {
    return false
  }
}

function isValidSupabaseKey(key: string): boolean {
  // Supabase anon keys are typically JWT tokens (long strings)
  return typeof key === 'string' && key.length > 30
}

export function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!url || !key) return false

  return isValidSupabaseUrl(url) && isValidSupabaseKey(key)
}

export function getSupabase(): ClassicGamesSupabaseClient | null {
  if (!supabaseInstance && isSupabaseConfigured()) {
    supabaseInstance = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY,
      {
        db: {
          schema: 'classic_games',
        },
      }
    )
  }
  return supabaseInstance
}

export function resetSupabaseInstance(): void {
  supabaseInstance = null
}
