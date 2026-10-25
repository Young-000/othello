import { useEffect, useRef } from 'react'
import { trackAmplitude } from '../infrastructure/analytics/amplitude'

/**
 * 게임이 실제로 시작되는 순간(isPlaying 이 false → true)에 game_played 를 한 번 보낸다.
 * isPlaying 이 계속 true 인 동안, 그리고 StrictMode 의 이펙트 재실행에서는 다시 보내지 않는다.
 */
export function useTrackGamePlayed(gameId: string, isPlaying: boolean): void {
  const hasTrackedRef = useRef(false)

  useEffect(() => {
    if (!isPlaying) {
      hasTrackedRef.current = false
      return
    }
    if (hasTrackedRef.current) return
    hasTrackedRef.current = true
    trackAmplitude('game_played', { game_id: gameId })
  }, [gameId, isPlaying])
}
