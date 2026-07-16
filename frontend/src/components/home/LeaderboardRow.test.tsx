import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import type { SeasonSummary } from '../../api/types'
import { PLAYER_AVATAR_BY_KEY } from '../../utils/player-avatar'
import { LeaderboardRow } from './LeaderboardRow'

afterEach(() => {
  cleanup()
})

const season: SeasonSummary = {
  id: 's1',
  name: 'Midnight Season 1',
  expansion: 'Midnight',
  isCurrent: true,
}

describe('LeaderboardRow', () => {
  it('renders a decorative local avatar for mapped players', () => {
    const { container } = render(
      <MemoryRouter>
        <LeaderboardRow
          player={{
            playerId: 'p-seb',
            playerName: 'Seb',
            avatarUrl: null,
            total: 10,
            deaths: 4,
            yeets: 6,
          }}
          rank={1}
          season={season}
          isKingOfYeets={false}
          isKingOfDeaths={false}
        />
      </MemoryRouter>,
    )

    const image = container.querySelector(
      `img[src="${PLAYER_AVATAR_BY_KEY.seb}"]`,
    )
    expect(image).not.toBeNull()
    expect(image).toHaveAttribute('alt', '')
    expect(image).not.toHaveAttribute('loading')
    expect(image).toHaveAttribute('width', '48')
    expect(image).toHaveAttribute('height', '48')
    expect(screen.getByText('Seb')).toBeInTheDocument()
  })

  it('falls back to the initial placeholder for unmapped players without avatarUrl', () => {
    render(
      <MemoryRouter>
        <LeaderboardRow
          player={{
            playerId: 'p-guest',
            playerName: 'Guest',
            avatarUrl: null,
            total: 1,
            deaths: 1,
            yeets: 0,
          }}
          rank={2}
          season={season}
          isKingOfYeets={false}
          isKingOfDeaths={false}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('G')).toBeInTheDocument()
    expect(screen.getByText('Guest')).toBeInTheDocument()
  })

  it('uses API avatarUrl for unmapped players', () => {
    const { container } = render(
      <MemoryRouter>
        <LeaderboardRow
          player={{
            playerId: 'p-guest',
            playerName: 'Guest',
            avatarUrl: 'https://cdn.example.com/guest.webp',
            total: 1,
            deaths: 0,
            yeets: 1,
          }}
          rank={3}
          season={season}
          isKingOfYeets={false}
          isKingOfDeaths={false}
        />
      </MemoryRouter>,
    )

    expect(
      container.querySelector('img[src="https://cdn.example.com/guest.webp"]'),
    ).not.toBeNull()
  })
})
