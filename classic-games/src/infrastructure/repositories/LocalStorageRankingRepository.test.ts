import { describe, it, expect, beforeEach } from 'vitest'
import { LocalStorageRankingRepository } from './LocalStorageRankingRepository'

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

describe('LocalStorageRankingRepository', () => {
  let repository: LocalStorageRankingRepository

  beforeEach(() => {
    localStorageMock.clear()
    repository = new LocalStorageRankingRepository()
  })

  describe('getAll', () => {
    it('should return empty array when no rankings exist', async () => {
      const rankings = await repository.getAll('memory')
      expect(rankings).toEqual([])
    })

    it('should return rankings for specific game', async () => {
      await repository.save('memory', {
        playerName: 'Player1',
        score: 500,
        moves: 20,
        time: 120,
      })

      const rankings = await repository.getAll('memory')
      expect(rankings).toHaveLength(1)
      expect(rankings[0].playerName).toBe('Player1')
    })
  })

  describe('save', () => {
    it('should save and return a new ranking entry', async () => {
      const entry = await repository.save('memory', {
        playerName: 'TestPlayer',
        score: 800,
        moves: 15,
        time: 90,
      })

      expect(entry.id).toBeDefined()
      expect(entry.date).toBeDefined()
      expect(entry.playerName).toBe('TestPlayer')
      expect(entry.gameId).toBe('memory')
    })

    it('should sort rankings by score', async () => {
      await repository.save('memory', { playerName: 'Low', score: 100, moves: 20, time: 120 })
      await repository.save('memory', { playerName: 'High', score: 900, moves: 10, time: 60 })

      const rankings = await repository.getAll('memory')
      expect(rankings[0].playerName).toBe('High')
      expect(rankings[1].playerName).toBe('Low')
    })

    it('should keep only top 10 entries', async () => {
      for (let i = 0; i < 15; i++) {
        await repository.save('memory', {
          playerName: `Player${i}`,
          score: i * 100,
          moves: 10,
          time: 60,
        })
      }

      const rankings = await repository.getAll('memory')
      expect(rankings).toHaveLength(10)
    })
  })

  describe('clear', () => {
    it('should clear rankings for specific game only', async () => {
      await repository.save('memory', { playerName: 'P1', score: 100, moves: 10, time: 60 })
      await repository.save('sudoku', { playerName: 'P2', score: 200, moves: 20, time: 120 })

      await repository.clear('memory')

      expect(await repository.getAll('memory')).toHaveLength(0)
      expect(await repository.getAll('sudoku')).toHaveLength(1)
    })
  })

  describe('clearAll', () => {
    it('should clear all rankings', async () => {
      await repository.save('memory', { playerName: 'P1', score: 100, moves: 10, time: 60 })
      await repository.save('sudoku', { playerName: 'P2', score: 200, moves: 20, time: 120 })

      await repository.clearAll()

      expect(await repository.getAll('memory')).toHaveLength(0)
      expect(await repository.getAll('sudoku')).toHaveLength(0)
    })
  })
})
