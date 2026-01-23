export interface RankingEntry {
  id: string
  playerName: string
  score: number
  moves: number
  time: number
  date: string
  difficulty?: string
  gameId: string
}

export interface CreateRankingInput {
  playerName: string
  score: number
  moves: number
  time: number
  difficulty?: string
}

export interface IRankingRepository {
  getAll(gameId: string): Promise<RankingEntry[]>
  save(gameId: string, entry: CreateRankingInput): Promise<RankingEntry>
  clear(gameId: string): Promise<void>
  clearAll(): Promise<void>
}

// Input validation constants
export const RANKING_CONSTRAINTS = {
  MAX_PLAYER_NAME_LENGTH: 50,
  MIN_PLAYER_NAME_LENGTH: 1,
  MIN_SCORE: 0,
  MAX_SCORE: 1_000_000_000,
  MAX_MOVES: 1_000_000,
  MAX_TIME: 86_400_000, // 24 hours in ms
} as const

// Validation errors
export class RankingValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RankingValidationError'
  }
}

// Input validator
export function validateRankingInput(input: CreateRankingInput): void {
  const { playerName, score, moves, time } = input
  const c = RANKING_CONSTRAINTS

  if (!playerName || typeof playerName !== 'string') {
    throw new RankingValidationError('Player name is required')
  }
  if (playerName.length < c.MIN_PLAYER_NAME_LENGTH || playerName.length > c.MAX_PLAYER_NAME_LENGTH) {
    throw new RankingValidationError(`Player name must be ${c.MIN_PLAYER_NAME_LENGTH}-${c.MAX_PLAYER_NAME_LENGTH} characters`)
  }
  if (typeof score !== 'number' || score < 0 || score > c.MAX_SCORE) {
    throw new RankingValidationError(`Score must be 0-${c.MAX_SCORE}`)
  }
  if (typeof moves !== 'number' || moves < 0 || moves > c.MAX_MOVES) {
    throw new RankingValidationError(`Moves must be 0-${c.MAX_MOVES}`)
  }
  if (typeof time !== 'number' || time < 0 || time > c.MAX_TIME) {
    throw new RankingValidationError(`Time must be 0-${c.MAX_TIME}`)
  }
}

// Sanitize player name (XSS prevention)
export function sanitizePlayerName(name: string): string {
  return name
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim()
    .slice(0, RANKING_CONSTRAINTS.MAX_PLAYER_NAME_LENGTH)
}

// Type guard for RankingEntry
export function isRankingEntry(obj: unknown): obj is RankingEntry {
  if (!obj || typeof obj !== 'object') return false
  const entry = obj as Record<string, unknown>
  return (
    typeof entry.id === 'string' &&
    typeof entry.playerName === 'string' &&
    typeof entry.score === 'number' &&
    typeof entry.moves === 'number' &&
    typeof entry.time === 'number' &&
    typeof entry.date === 'string' &&
    typeof entry.gameId === 'string'
  )
}
