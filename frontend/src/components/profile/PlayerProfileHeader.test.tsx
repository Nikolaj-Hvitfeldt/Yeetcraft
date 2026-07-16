import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { PlayerStatsResponse, SeasonSummary } from '../../api/types'
import { PLAYER_AVATAR_BY_KEY } from '../../utils/player-avatar'
import { PlayerProfileHeader } from './PlayerProfileHeader'

afterEach(() => {
  cleanup()
})

const season: SeasonSummary = {
  id: 's1',
  name: 'Midnight Season 1',
  expansion: 'Midnight',
  isCurrent: true,
}

const playerStats: PlayerStatsResponse = {
  player: {
    id: 'p-niklas',
    displayName: 'Niklas',
    avatarUrl: null,
  },
  season,
  totalDeaths: 4,
  totalYeets: 2,
  totalMistakes: 6,
  dungeons: [],
}

describe('PlayerProfileHeader', () => {
  it('renders an eager, non-decorative local avatar at lg size', () => {
    render(
      <PlayerProfileHeader
        playerStats={playerStats}
        seasons={[season]}
        selectedSeasonId={season.id}
        onSeasonChange={vi.fn()}
        isEditing={false}
        isKingOfYeets={false}
        isKingOfDeaths={false}
        flavor="Test flavor"
        characters={[{ name: 'Ungeork', wowClass: 'hunter' }]}
      />,
    )

    const image = screen.getByRole('img', { name: 'Niklas avatar' })
    expect(image).toHaveAttribute('src', PLAYER_AVATAR_BY_KEY.niklas)
    expect(image).toHaveAttribute('loading', 'eager')
    expect(image).toHaveAttribute('width', '96')
    expect(image).toHaveAttribute('height', '96')
    expect(image.className).toContain('drop-shadow-[0_12px_25px_rgba(0,0,0,0.35)]')
  })

  it('shows the initial placeholder for unmapped players without avatarUrl', () => {
    render(
      <PlayerProfileHeader
        playerStats={{
          ...playerStats,
          player: {
            id: 'p-guest',
            displayName: 'Guest',
            avatarUrl: null,
          },
        }}
        seasons={[season]}
        selectedSeasonId={season.id}
        onSeasonChange={vi.fn()}
        isEditing={false}
        isKingOfYeets={false}
        isKingOfDeaths={false}
        flavor="Test flavor"
        characters={[{ name: 'GuestAlt' }]}
      />,
    )

    expect(screen.queryByRole('img', { name: 'Guest avatar' })).not.toBeInTheDocument()
    expect(screen.getByText('G')).toBeInTheDocument()
  })
})
