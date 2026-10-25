import { StrictMode } from 'react'
import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const trackAmplitude = vi.hoisted(() => vi.fn())
vi.mock('../infrastructure/analytics/amplitude', () => ({ trackAmplitude }))

import { useTrackGamePlayed } from './useTrackGamePlayed'

describe('useTrackGamePlayed', () => {
  beforeEach(() => trackAmplitude.mockClear())

  it('게임이 시작되면 game_played 를 한 번 보낸다', () => {
    const { rerender } = renderHook(({ isPlaying }) => useTrackGamePlayed('odd-even', isPlaying), {
      initialProps: { isPlaying: false },
    })
    expect(trackAmplitude).not.toHaveBeenCalled()

    rerender({ isPlaying: true })
    rerender({ isPlaying: true })

    expect(trackAmplitude).toHaveBeenCalledTimes(1)
    expect(trackAmplitude).toHaveBeenCalledWith('game_played', { game_id: 'odd-even' })
  })

  it('React StrictMode 에서도 중복 전송하지 않는다', () => {
    renderHook(() => useTrackGamePlayed('klondike', true), { wrapper: StrictMode })

    expect(trackAmplitude).toHaveBeenCalledTimes(1)
  })

  it('끝난 뒤 새 게임을 시작하면 다시 한 번 보낸다', () => {
    const { rerender } = renderHook(({ isPlaying }) => useTrackGamePlayed('sudoku', isPlaying), {
      initialProps: { isPlaying: true },
    })

    rerender({ isPlaying: false })
    rerender({ isPlaying: true })

    expect(trackAmplitude).toHaveBeenCalledTimes(2)
  })
})
