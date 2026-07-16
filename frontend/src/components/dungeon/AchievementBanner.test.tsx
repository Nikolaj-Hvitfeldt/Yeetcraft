import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { PLAYER_AVATAR_BY_KEY } from '../../utils/player-avatar'
import { AchievementBanner } from './AchievementBanner'

afterEach(() => {
  cleanup()
})

describe('AchievementBanner', () => {
  it('renders a lazy decorative achievement-sized local avatar', () => {
    const { container } = render(
      <AchievementBanner
        icon="yeets"
        title="The Liability"
        holder={{
          playerId: 'p-niko',
          displayName: 'Niko',
          avatarUrl: null,
        }}
        description="Owned the blame"
        tooltip="Tooltip detail"
      />,
    )

    const images = container.querySelectorAll('img')
    const avatar = Array.from(images).find(
      (image) => image.getAttribute('src') === PLAYER_AVATAR_BY_KEY.niko,
    )

    expect(avatar).toBeDefined()
    expect(avatar).toHaveAttribute('alt', '')
    expect(avatar).toHaveAttribute('loading', 'lazy')
    expect(avatar).toHaveAttribute('width', '28')
    expect(avatar).toHaveAttribute('height', '28')
    expect(avatar?.className).toContain('rounded-full')
    expect(avatar?.className).toContain('size-7')
    expect(avatar?.className).toContain('sm:size-8')
    expect(screen.getByText('Niko', { selector: '.sr-only' })).toBeInTheDocument()
  })

  it('shows the initial placeholder when the holder has no local or remote avatar', () => {
    render(
      <AchievementBanner
        icon="yeets"
        title="Quiet Lobby"
        holder={{
          playerId: 'p-guest',
          displayName: 'Guest',
          avatarUrl: null,
        }}
        description="Placeholder holder"
        tooltip="Tooltip detail"
      />,
    )

    expect(screen.getByText('G')).toBeInTheDocument()
    expect(screen.getByText('Guest', { selector: '.sr-only' })).toBeInTheDocument()
  })
})
