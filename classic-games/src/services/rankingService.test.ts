import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getRankings,
  getGameRankings,
  saveRanking,
  clearGameRankings,
  clearAllRankings,
  isTopScore,
  calculateScore,
  formatTime,
  RankingEntry,
} from './rankingService'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

describe('RankingService', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  describe('getRankings', () => {
    it('should return empty object when no rankings exist', () => {
      const rankings = getRankings()
      expect(rankings).toEqual({})
    })

    it('should return stored rankings', () => {
      const mockRankings = {
        memory: [{ id: '1', playerName: 'Test', score: 100, moves: 10, time: 60, date: '2024-01-01' }],
      }
      localStorage.setItem('classic-games-rankings', JSON.stringify(mockRankings))

      const rankings = getRankings()
      expect(rankings).toEqual(mockRankings)
    })

    it('should handle corrupted localStorage data gracefully', () => {
      localStorage.setItem('classic-games-rankings', 'invalid-json')

      const rankings = getRankings()
      expect(rankings).toEqual({})
    })
  })

  describe('getGameRankings', () => {
    it('should return empty array for non-existent game', () => {
      const rankings = getGameRankings('nonexistent')
      expect(rankings).toEqual([])
    })

    it('should return rankings for specific game', () => {
      const entry: RankingEntry = {
        id: '1',
        playerName: 'Player1',
        score: 500,
        moves: 20,
        time: 120,
        date: '2024-01-01',
      }
      const mockRankings = { memory: [entry] }
      localStorage.setItem('classic-games-rankings', JSON.stringify(mockRankings))

      const rankings = getGameRankings('memory')
      expect(rankings).toHaveLength(1)
      expect(rankings[0].playerName).toBe('Player1')
    })
  })

  describe('saveRanking', () => {
    it('should save a new ranking entry', () => {
      const entry = saveRanking('memory', {
        playerName: 'TestPlayer',
        score: 800,
        moves: 15,
        time: 90,
      })

      expect(entry.id).toBeDefined()
      expect(entry.date).toBeDefined()
      expect(entry.playerName).toBe('TestPlayer')
      expect(entry.score).toBe(800)
    })

    it('should sort rankings by score (descending)', () => {
      saveRanking('memory', { playerName: 'Low', score: 100, moves: 20, time: 120 })
      saveRanking('memory', { playerName: 'High', score: 900, moves: 10, time: 60 })
      saveRanking('memory', { playerName: 'Mid', score: 500, moves: 15, time: 90 })

      const rankings = getGameRankings('memory')
      expect(rankings[0].playerName).toBe('High')
      expect(rankings[1].playerName).toBe('Mid')
      expect(rankings[2].playerName).toBe('Low')
    })

    it('should sort by time when scores are equal', () => {
      saveRanking('memory', { playerName: 'Slow', score: 500, moves: 15, time: 120 })
      saveRanking('memory', { playerName: 'Fast', score: 500, moves: 15, time: 60 })

      const rankings = getGameRankings('memory')
      expect(rankings[0].playerName).toBe('Fast')
      expect(rankings[1].playerName).toBe('Slow')
    })

    it('should keep only top 10 entries', () => {
      for (let i = 0; i < 15; i++) {
        saveRanking('memory', {
          playerName: `Player${i}`,
          score: i * 100,
          moves: 10,
          time: 60,
        })
      }

      const rankings = getGameRankings('memory')
      expect(rankings).toHaveLength(10)
      expect(rankings[0].score).toBe(1400) // Highest score
    })
  })

  describe('clearGameRankings', () => {
    it('should clear rankings for specific game only', () => {
      saveRanking('memory', { playerName: 'P1', score: 100, moves: 10, time: 60 })
      saveRanking('sudoku', { playerName: 'P2', score: 200, moves: 20, time: 120 })

      clearGameRankings('memory')

      expect(getGameRankings('memory')).toHaveLength(0)
      expect(getGameRankings('sudoku')).toHaveLength(1)
    })
  })

  describe('clearAllRankings', () => {
    it('should clear all rankings', () => {
      saveRanking('memory', { playerName: 'P1', score: 100, moves: 10, time: 60 })
      saveRanking('sudoku', { playerName: 'P2', score: 200, moves: 20, time: 120 })

      clearAllRankings()

      expect(getRankings()).toEqual({})
    })
  })

  describe('isTopScore', () => {
    it('should return true when less than 10 entries exist', () => {
      expect(isTopScore('memory', 100, 60)).toBe(true)
    })

    it('should return true when score beats lowest entry', () => {
      for (let i = 0; i < 10; i++) {
        saveRanking('memory', {
          playerName: `Player${i}`,
          score: (i + 1) * 100,
          moves: 10,
          time: 60,
        })
      }

      // Score 150 should beat lowest (100)
      expect(isTopScore('memory', 150, 60)).toBe(true)
    })

    it('should return false when score does not make top 10', () => {
      for (let i = 0; i < 10; i++) {
        saveRanking('memory', {
          playerName: `Player${i}`,
          score: (i + 1) * 100,
          moves: 10,
          time: 60,
        })
      }

      // Score 50 should not beat lowest (100)
      expect(isTopScore('memory', 50, 60)).toBe(false)
    })

    it('should consider time when scores are equal', () => {
      for (let i = 0; i < 10; i++) {
        saveRanking('memory', {
          playerName: `Player${i}`,
          score: 100,
          moves: 10,
          time: 120,
        })
      }

      // Same score but faster time should qualify
      expect(isTopScore('memory', 100, 60)).toBe(true)
      // Same score but slower time should not qualify
      expect(isTopScore('memory', 100, 180)).toBe(false)
    })
  })

  describe('calculateScore', () => {
    it('should return 0 for lost game', () => {
      expect(calculateScore('memory', 10, 60, false)).toBe(0)
    })

    describe('memory game', () => {
      it('should calculate score with move penalty and time bonus', () => {
        // Base 1000 - (moves - 8) * 20 + max(0, 120 - time)
        const score = calculateScore('memory', 10, 60, true)
        // 1000 - (10-8)*20 + (120-60) = 1000 - 40 + 60 = 1020
        expect(score).toBe(1020)
      })

      it('should not go below 0', () => {
        const score = calculateScore('memory', 100, 300, true)
        expect(score).toBeGreaterThanOrEqual(0)
      })
    })

    describe('klondike game', () => {
      it('should calculate score correctly', () => {
        // Base 1000 + max(0, 500-time) - moves*2
        const score = calculateScore('klondike', 50, 200, true)
        // 1000 + 300 - 100 = 1200
        expect(score).toBe(1200)
      })
    })

    describe('2048 game', () => {
      it('should return moves as score (game score)', () => {
        // In 2048, moves parameter is actually the game score
        const score = calculateScore('2048', 2048, 300, true)
        expect(score).toBe(2048)
      })
    })

    describe('sudoku game', () => {
      it('should apply difficulty multiplier', () => {
        const easyScore = calculateScore('sudoku', 0, 60, true, { difficulty: 'easy' })
        const hardScore = calculateScore('sudoku', 0, 60, true, { difficulty: 'hard' })

        expect(hardScore).toBeGreaterThan(easyScore)
      })
    })

    describe('minesweeper game', () => {
      it('should apply difficulty multiplier', () => {
        const easyScore = calculateScore('minesweeper', 0, 60, true, { difficulty: 'easy' })
        const mediumScore = calculateScore('minesweeper', 0, 60, true, { difficulty: 'medium' })

        expect(mediumScore).toBeGreaterThan(easyScore)
      })
    })
  })

  describe('formatTime', () => {
    it('should format seconds to MM:SS', () => {
      expect(formatTime(65)).toBe('1:05')
      expect(formatTime(0)).toBe('0:00')
      expect(formatTime(3600)).toBe('60:00')
    })

    it('should pad seconds with leading zero', () => {
      expect(formatTime(5)).toBe('0:05')
      expect(formatTime(61)).toBe('1:01')
    })
  })
})
