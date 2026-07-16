import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { PLAYER_AVATAR_BY_KEY } from '../../utils/player-avatar'
import { PlayerAvatar } from './PlayerAvatar'

afterEach(() => {
  cleanup()
})

describe('PlayerAvatar', () => {
  it('renders the local avatar from an explicit playerKey', () => {
    render(<PlayerAvatar playerKey="seb" displayName="Someone Else" />)

    expect(screen.getByRole('img', { name: 'Someone Else avatar' })).toHaveAttribute(
      'src',
      PLAYER_AVATAR_BY_KEY.seb,
    )
  })

  it('renders the resolved local avatar via displayName fallback', () => {
    render(<PlayerAvatar displayName="Seb" />)

    expect(screen.getByRole('img', { name: 'Seb avatar' })).toHaveAttribute(
      'src',
      PLAYER_AVATAR_BY_KEY.seb,
    )
  })

  it('renders a placeholder when resolution returns null', () => {
    render(<PlayerAvatar displayName="Guest" />)

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByText('G')).toBeInTheDocument()
  })
})
