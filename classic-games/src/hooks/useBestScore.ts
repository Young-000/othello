import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'

interface BestScoreData {
  score: number
  date: string
}

export function useBestScore(gameKey: string) {
  const [bestData, setBestData] = useLocalStorage<BestScoreData | null>(
    `classic-games-best-${gameKey}`,
    null
  )

  const updateBestScore = useCallback((score: number, higherIsBetter = true) => {
    setBestData(prev => {
      const shouldUpdate = prev === null ||
        (higherIsBetter ? score > prev.score : score < prev.score)

      if (shouldUpdate) {
        return {
          score,
          date: new Date().toISOString(),
        }
      }
      return prev
    })
  }, [setBestData])

  const resetBestScore = useCallback(() => {
    setBestData(null)
  }, [setBestData])

  const isNewBest = useCallback((score: number, higherIsBetter = true) => {
    if (bestData === null) return true
    return higherIsBetter ? score > bestData.score : score < bestData.score
  }, [bestData])

  return {
    bestScore: bestData?.score ?? null,
    bestDate: bestData?.date ?? null,
    updateBestScore,
    resetBestScore,
    isNewBest,
  }
}
