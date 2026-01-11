import { useState, useCallback } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Failed to load saved data for "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue(prev => {
      const valueToStore = value instanceof Function ? value(prev) : value
      try {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      } catch (error) {
        console.warn(`Failed to save data for "${key}":`, error)
      }
      return valueToStore
    })
  }, [key])

  return [storedValue, setValue]
}

export function useSavedGame<T>(
  gameKey: string,
  createGame: () => T
): {
  state: T
  setState: (value: T | ((prev: T) => T)) => void
  newGame: () => void
  clearSave: () => void
} {
  const [state, setState] = useLocalStorage<T>(`classic-games-${gameKey}`, createGame())

  const newGame = useCallback(() => {
    setState(createGame())
  }, [createGame, setState])

  const clearSave = useCallback(() => {
    try {
      window.localStorage.removeItem(`classic-games-${gameKey}`)
    } catch (error) {
      console.warn(`Failed to clear saved game "${gameKey}":`, error)
    }
    setState(createGame())
  }, [gameKey, createGame, setState])

  return { state, setState, newGame, clearSave }
}
