import { StrictMode } from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const trackAmplitude = vi.hoisted(() => vi.fn())
vi.mock('../../infrastructure/analytics/amplitude', () => ({ trackAmplitude }))

import WinModal from './WinModal'

function renderModal(gameId: string) {
  return render(
    <StrictMode>
      <MemoryRouter>
        <WinModal gameId={gameId} moves={10} time="0:30" timeInSeconds={30} onPlayAgain={vi.fn()} />
      </MemoryRouter>
    </StrictMode>,
  )
}

describe('WinModal analytics', () => {
  beforeEach(() => trackAmplitude.mockClear())

  it('열릴 때 game_won 을 한 번만 보낸다 (StrictMode 포함)', () => {
    renderModal('memory')

    const wins = trackAmplitude.mock.calls.filter(([name]) => name === 'game_won')
    expect(wins).toEqual([['game_won', { game_id: 'memory' }]])
  })

  it('리렌더로는 다시 보내지 않고, 새로 열리면 다시 보낸다', () => {
    const first = renderModal('memory')
    first.rerender(
      <StrictMode>
        <MemoryRouter>
          <WinModal gameId="memory" moves={11} time="0:31" timeInSeconds={31} onPlayAgain={vi.fn()} />
        </MemoryRouter>
      </StrictMode>,
    )
    first.unmount()
    renderModal('memory')

    expect(trackAmplitude.mock.calls.filter(([name]) => name === 'game_won')).toHaveLength(2)
  })
})
