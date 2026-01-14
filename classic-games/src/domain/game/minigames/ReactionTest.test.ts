import { describe, it, expect } from 'vitest'
import {
  createReactionTest,
  startRound,
  showGo,
  clickedTooEarly,
  recordReaction,
  resetGame,
  getAverageTime,
  calculateScore,
  getRating,
  getRandomWaitTime,
  MIN_WAIT,
  MAX_WAIT
} from './ReactionTest'

describe('ReactionTest', () => {
  describe('createReactionTest', () => {
    it('creates initial state in waiting phase', () => {
      const state = createReactionTest()
      expect(state.phase).toBe('waiting')
      expect(state.reactionTime).toBeNull()
      expect(state.attempts).toBe(0)
      expect(state.bestTime).toBeNull()
      expect(state.totalTime).toBe(0)
      expect(state.goTime).toBeNull()
    })
  })

  describe('startRound', () => {
    it('transitions to ready phase', () => {
      const state = startRound(createReactionTest())
      expect(state.phase).toBe('ready')
      expect(state.goTime).toBeNull()
    })
  })

  describe('showGo', () => {
    it('transitions to go phase and records go time', () => {
      let state = startRound(createReactionTest())
      state = showGo(state)
      expect(state.phase).toBe('go')
      expect(state.goTime).not.toBeNull()
    })

    it('does nothing if not in ready phase', () => {
      const state = createReactionTest()
      const result = showGo(state)
      expect(result.phase).toBe('waiting')
    })
  })

  describe('clickedTooEarly', () => {
    it('transitions to too-early phase', () => {
      let state = startRound(createReactionTest())
      state = clickedTooEarly(state)
      expect(state.phase).toBe('too-early')
    })

    it('does nothing if not in ready phase', () => {
      const state = createReactionTest()
      const result = clickedTooEarly(state)
      expect(result.phase).toBe('waiting')
    })
  })

  describe('recordReaction', () => {
    it('records reaction time and transitions to result', () => {
      let state = startRound(createReactionTest())
      state = showGo(state)
      // Simulate some delay
      state = { ...state, goTime: Date.now() - 250 }
      state = recordReaction(state)

      expect(state.phase).toBe('result')
      expect(state.reactionTime).toBeGreaterThan(200)
      expect(state.reactionTime).toBeLessThan(400)
      expect(state.attempts).toBe(1)
    })

    it('updates best time', () => {
      let state = startRound(createReactionTest())
      state = showGo(state)
      state = { ...state, goTime: Date.now() - 200 }
      state = recordReaction(state)

      expect(state.bestTime).not.toBeNull()
      expect(state.bestTime).toBeGreaterThan(150)
    })

    it('accumulates total time', () => {
      let state = startRound(createReactionTest())
      state = showGo(state)
      state = { ...state, goTime: Date.now() - 200 }
      state = recordReaction(state)

      expect(state.totalTime).toBeGreaterThan(0)
    })
  })

  describe('getAverageTime', () => {
    it('returns null for no attempts', () => {
      const state = createReactionTest()
      expect(getAverageTime(state)).toBeNull()
    })

    it('calculates average correctly', () => {
      const state = {
        ...createReactionTest(),
        attempts: 3,
        totalTime: 600
      }
      expect(getAverageTime(state)).toBe(200)
    })
  })

  describe('calculateScore', () => {
    it('returns higher score for faster reaction', () => {
      const fastScore = calculateScore(150)
      const slowScore = calculateScore(500)
      expect(fastScore).toBeGreaterThan(slowScore)
    })

    it('returns max score for very fast reaction', () => {
      expect(calculateScore(100)).toBe(1000)
      expect(calculateScore(50)).toBe(1000)
    })

    it('returns min score for very slow reaction', () => {
      expect(calculateScore(1000)).toBe(100)
      expect(calculateScore(2000)).toBe(100)
    })
  })

  describe('getRating', () => {
    it('returns Incredible for very fast reaction', () => {
      expect(getRating(130)).toBe('Incredible!')
    })

    it('returns Amazing for fast reaction', () => {
      expect(getRating(170)).toBe('Amazing!')
    })

    it('returns Great for good reaction', () => {
      expect(getRating(220)).toBe('Great!')
    })

    it('returns Good for average reaction', () => {
      expect(getRating(280)).toBe('Good')
    })

    it('returns Average for slower reaction', () => {
      expect(getRating(350)).toBe('Average')
    })

    it('returns Keep practicing for slow reaction', () => {
      expect(getRating(500)).toBe('Keep practicing!')
    })
  })

  describe('getRandomWaitTime', () => {
    it('returns value within range', () => {
      for (let i = 0; i < 10; i++) {
        const wait = getRandomWaitTime()
        expect(wait).toBeGreaterThanOrEqual(MIN_WAIT)
        expect(wait).toBeLessThanOrEqual(MAX_WAIT)
      }
    })
  })

  describe('resetGame', () => {
    it('resets to initial state', () => {
      const reset = resetGame()
      expect(reset.phase).toBe('waiting')
      expect(reset.attempts).toBe(0)
      expect(reset.bestTime).toBeNull()
    })
  })
})
