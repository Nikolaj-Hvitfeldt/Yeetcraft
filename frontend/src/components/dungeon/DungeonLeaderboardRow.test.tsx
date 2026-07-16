import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import type { DungeonLeaderboardEntry, SeasonSummary } from '../../api/types'
import { PLAYER_AVATAR_BY_KEY } from '../../utils/player-avatar'
import { DungeonLeaderboardRow } from './DungeonLeaderboardRow'

afterEach(() => {
  cleanup()
})

const season: SeasonSummary = {
  id: 's1',
  name: 'Midnight Season 1',
  expansion: 'Midnight',
  isCurrent: true,
}

const mappedPlayer: DungeonLeaderboardEntry = {
  playerId: 'p-martin',
  displayName: 'Martin',
  avatarUrl: null,
  deaths: 3,
  yeets: 2,
  totalMistakes: 5,
}

describe('DungeonLeaderboardRow', () => {
  it('renders a decorative local avatar with browser-default loading', () => {
    const { container } = render(
      <MemoryRouter>
        <DungeonLeaderboardRow player={mappedPlayer} rank={1} season={season} />
      </MemoryRouter>,
    )

    const image = container.querySelector(
      `img[src="${PLAYER_AVATAR_BY_KEY.martin}"]`,
    )
    expect(image).not.toBeNull()
    expect(image).toHaveAttribute('alt', '')
    expect(image).not.toHaveAttribute('loading')
    expect(image).toHaveAttribute('width', '48')
    expect(image).toHaveAttribute('height', '48')
    expect(screen.getByText('Martin')).toBeInTheDocument()
  })

  it('shows the initial placeholder for unmapped players without avatarUrl', () => {
    render(
      <MemoryRouter>
        <DungeonLeaderboardRow
          player={{
            playerId: 'p-guest',
            displayName: 'Guest',
            avatarUrl: null,
            deaths: 1,
            yeets: 0,
            totalMistakes: 1,
          }}
          rank={2}
          season={season}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('G')).toBeInTheDocument()
    expect(screen.getByText('Guest')).toBeInTheDocument()
  })
})
