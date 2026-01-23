import { describe, it, expect } from 'vitest'
import {
  createButtonMasher,
  startGame,
  click,
  updateTime,
  resetGame,
  calculateScore,
  getClicksPerSecond,
  GAME_DURATION
} from './ButtonMasher'

describe('ButtonMasher', () => {
  describe('createButtonMasher', () => {
    it('creates initial state with zero clicks', () => {
      const state = createButtonMasher()
      expect(state.clicks).toBe(0)
      expect(state.timeLeft).toBe(GAME_DURATION)
      expect(state.isRunning).toBe(false)
      expect(state.isComplete).toBe(false)
      expect(state.startTime).toBeNull()
    })
  })

  describe('startGame', () => {
    it('starts the game', () => {
      const initial = createButtonMasher()
      const started = startGame(initial)
      expect(started.isRunning).toBe(true)
      expect(started.isComplete).toBe(false)
      expect(started.clicks).toBe(0)
      expect(started.startTime).not.toBeNull()
    })

    it('does not restart if already running', () => {
      const started = startGame(createButtonMasher())
      const original = started.startTime
      const restarted = startGame(started)
      expect(restarted.startTime).toBe(original)
    })
  })

  describe('click', () => {
    it('increments click count when game is running', () => {
      const state = startGame(createButtonMasher())
      const afterClick = click(state)
      expect(afterClick.clicks).toBe(1)
    })

    it('does not increment when game is not running', () => {
      const state = createButtonMasher()
      const afterClick = click(state)
      expect(afterClick.clicks).toBe(0)
    })

    it('does not increment when game is complete', () => {
      let state = startGame(createButtonMasher())
      state = { ...state, isComplete: true, isRunning: false }
      const afterClick = click(state)
      expect(afterClick.clicks).toBe(0)
    })
  })

  describe('updateTime', () => {
    it('does not update when not running', () => {
      const state = createButtonMasher()
      const updated = updateTime(state)
      expect(updated).toBe(state)
    })

    it('updates time based on elapsed time', () => {
      let state = startGame(createButtonMasher())
      state = { ...state, startTime: Date.now() - 3000 } // 3 seconds ago
      const updated = updateTime(state)
      expect(updated.timeLeft).toBeLessThanOrEqual(GAME_DURATION - 3)
    })
  })

  describe('resetGame', () => {
    it('resets to initial state', () => {
      // Simulate a game in progress (setup for reset test)
      const started = startGame(createButtonMasher())
      click(started)
      click(started)
      // resetGame always returns fresh initial state
      const reset = resetGame()
      expect(reset.clicks).toBe(0)
      expect(reset.isRunning).toBe(false)
      expect(reset.isComplete).toBe(false)
    })
  })

  describe('calculateScore', () => {
    it('returns clicks times multiplier', () => {
      // Multiplier is 20 (increased from 10 to compensate for 5s duration)
      const score = calculateScore(100)
      expect(score).toBe(2000)
    })

    it('returns 0 for 0 clicks', () => {
      expect(calculateScore(0)).toBe(0)
    })
  })

  describe('getClicksPerSecond', () => {
    it('calculates clicks per second', () => {
      // With 5 second duration: 100 clicks / 5 seconds = 20.0 clicks/sec
      expect(getClicksPerSecond(100)).toBe('20.0')
      // With 5 second duration: 50 clicks / 5 seconds = 10.0 clicks/sec
      expect(getClicksPerSecond(50)).toBe('10.0')
    })
  })
})
