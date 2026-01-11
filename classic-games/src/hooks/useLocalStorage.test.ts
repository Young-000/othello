import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLocalStorage, useSavedGame } from './useLocalStorage'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('should return initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
    expect(result.current[0]).toBe('initial')
  })

  it('should return stored value from localStorage', () => {
    localStorageMock.setItem('test-key', JSON.stringify('stored'))
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
    expect(result.current[0]).toBe('stored')
  })

  it('should update localStorage when value changes', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))

    act(() => {
      result.current[1]('updated')
    })

    expect(result.current[0]).toBe('updated')
    expect(JSON.parse(localStorageMock.getItem('test-key')!)).toBe('updated')
  })

  it('should handle objects', () => {
    const initial = { count: 0 }
    const { result } = renderHook(() => useLocalStorage('test-key', initial))

    act(() => {
      result.current[1]({ count: 5 })
    })

    expect(result.current[0]).toEqual({ count: 5 })
  })

  it('should handle function updater', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 0))

    act(() => {
      result.current[1]((prev: number) => prev + 1)
    })

    expect(result.current[0]).toBe(1)
  })
})

describe('useSavedGame', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  it('should create new game on first load', () => {
    const createGame = () => ({ score: 0, level: 1 })
    const { result } = renderHook(() => useSavedGame('test-game', createGame))

    expect(result.current.state).toEqual({ score: 0, level: 1 })
  })

  it('should restore saved game', () => {
    localStorageMock.setItem('classic-games-test-game', JSON.stringify({ score: 100, level: 5 }))
    const createGame = () => ({ score: 0, level: 1 })
    const { result } = renderHook(() => useSavedGame('test-game', createGame))

    expect(result.current.state).toEqual({ score: 100, level: 5 })
  })

  it('should reset game with newGame', () => {
    localStorageMock.setItem('classic-games-test-game', JSON.stringify({ score: 100, level: 5 }))
    const createGame = () => ({ score: 0, level: 1 })
    const { result } = renderHook(() => useSavedGame('test-game', createGame))

    act(() => {
      result.current.newGame()
    })

    expect(result.current.state).toEqual({ score: 0, level: 1 })
  })

  it('should persist state changes', () => {
    const createGame = () => ({ score: 0 })
    const { result } = renderHook(() => useSavedGame('test-game', createGame))

    act(() => {
      result.current.setState({ score: 50 })
    })

    const stored = JSON.parse(localStorageMock.getItem('classic-games-test-game')!)
    expect(stored).toEqual({ score: 50 })
  })
})
