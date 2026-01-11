import { useState, useEffect, useCallback, useRef } from 'react'

export function useGameTimer(isRunning: boolean = true) {
  const [seconds, setSeconds] = useState(0)
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setSeconds(s => s + 1)
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning])

  const reset = useCallback(() => {
    setSeconds(0)
  }, [])

  const formatTime = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return {
    seconds,
    formattedTime: formatTime(seconds),
    reset,
  }
}
