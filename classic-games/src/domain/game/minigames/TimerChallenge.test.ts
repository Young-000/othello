import { describe, it, expect } from 'vitest'
import {
  createTimerChallenge,
  startTimer,
  stopTimer,
  updateTime,
  resetGame,
  calculateScore,
  formatTime,
  getDifferenceText,
  DEFAULT_TARGET
} from './TimerChallenge'

describe('TimerChallenge', () => {
  describe('createTimerChallenge', () => {
    it('creates initial state with default target', () => {
      const state = createTimerChallenge()
      expect(state.targetTime).toBe(DEFAULT_TARGET)
      expect(state.currentTime).toBe(0)
      expect(state.isRunning).toBe(false)
      expect(state.isComplete).toBe(false)
      expect(state.showTimer).toBe(false)
    })

    it('accepts custom target time', () => {
      const state = createTimerChallenge(3.0)
      expect(state.targetTime).toBe(3.0)
    })
  })

  describe('startTimer', () => {
    it('starts the timer', () => {
      const state = startTimer(createTimerChallenge())
      expect(state.isRunning).toBe(true)
      expect(state.startTime).not.toBeNull()
      expect(state.showTimer).toBe(false)
    })

    it('does not restart if already running', () => {
      const started = startTimer(createTimerChallenge())
      const original = started.startTime
      const restarted = startTimer(started)
      expect(restarted.startTime).toBe(original)
    })
  })

  describe('stopTimer', () => {
    it('stops the timer and shows result', () => {
      let state = startTimer(createTimerChallenge())
      state = { ...state, startTime: Date.now() - 4800 }
      const stopped = stopTimer(state)
      expect(stopped.isRunning).toBe(false)
      expect(stopped.isComplete).toBe(true)
      expect(stopped.showTimer).toBe(true)
      expect(stopped.accuracy).not.toBeNull()
    })
  })

  describe('updateTime', () => {
    it('does not update when not running', () => {
      const state = createTimerChallenge()
      const updated = updateTime(state)
      expect(updated).toBe(state)
    })

    it('updates current time based on elapsed time', () => {
      let state = startTimer(createTimerChallenge())
      state = { ...state, startTime: Date.now() - 1000 }
      const updated = updateTime(state)
      expect(updated.currentTime).toBeGreaterThan(0.9)
      expect(updated.currentTime).toBeLessThan(1.2)
    })
  })

  describe('calculateScore', () => {
    it('returns higher score for higher accuracy', () => {
      const highScore = calculateScore(95)
      const lowScore = calculateScore(50)
      expect(highScore).toBeGreaterThan(lowScore)
    })

    it('returns accuracy times 10', () => {
      expect(calculateScore(100)).toBe(1000)
      expect(calculateScore(50)).toBe(500)
    })
  })

  describe('formatTime', () => {
    it('formats seconds to fixed decimal', () => {
      expect(formatTime(5)).toBe('5.00')
      expect(formatTime(5.123)).toBe('5.12')
      expect(formatTime(12.345)).toBe('12.35')
    })
  })

  describe('getDifferenceText', () => {
    it('shows perfect for near match', () => {
      expect(getDifferenceText(5.0, 5.0)).toBe('Perfect!')
      expect(getDifferenceText(5.02, 5.0)).toBe('Perfect!')
    })

    it('shows too slow for positive difference', () => {
      expect(getDifferenceText(5.5, 5.0)).toBe('0.50s too slow')
    })

    it('shows too fast for negative difference', () => {
      expect(getDifferenceText(4.5, 5.0)).toBe('0.50s too fast')
    })
  })

  describe('resetGame', () => {
    it('resets to initial state', () => {
      const reset = resetGame()
      expect(reset.currentTime).toBe(0)
      expect(reset.isRunning).toBe(false)
      expect(reset.isComplete).toBe(false)
    })
  })
})
