import { describe, expect, it } from 'vitest'
import {
  PLAYER_AVATAR_BY_KEY,
  resolvePlayerAvatarSrc,
} from './player-avatar'

describe('resolvePlayerAvatarSrc', () => {
  it('resolves local bundled avatars via registry player keys', () => {
    expect(resolvePlayerAvatarSrc({ displayName: 'Seb' })).toBe(
      PLAYER_AVATAR_BY_KEY.seb,
    )
    expect(resolvePlayerAvatarSrc({ displayName: 'martin' })).toBe(
      PLAYER_AVATAR_BY_KEY.martin,
    )
    expect(resolvePlayerAvatarSrc({ displayName: 'Niklas' })).toBe(
      PLAYER_AVATAR_BY_KEY.niklas,
    )
    expect(resolvePlayerAvatarSrc({ displayName: 'NIKO' })).toBe(
      PLAYER_AVATAR_BY_KEY.niko,
    )
  })

  it('prefers local bundled avatars over API avatarUrl', () => {
    expect(
      resolvePlayerAvatarSrc({
        displayName: 'Seb',
        avatarUrl: 'https://cdn.example.com/seb.png',
      }),
    ).toBe(PLAYER_AVATAR_BY_KEY.seb)
  })

  it('falls back to API avatarUrl when no local avatar exists', () => {
    expect(
      resolvePlayerAvatarSrc({
        displayName: 'Guest',
        avatarUrl: 'https://cdn.example.com/guest.png',
      }),
    ).toBe('https://cdn.example.com/guest.png')
  })

  it('returns null when neither local avatar nor avatarUrl exists', () => {
    expect(resolvePlayerAvatarSrc({ displayName: 'Guest' })).toBeNull()
    expect(resolvePlayerAvatarSrc({ displayName: undefined })).toBeNull()
    expect(resolvePlayerAvatarSrc({})).toBeNull()
  })

  it('accepts playerId without changing current resolution', () => {
    expect(
      resolvePlayerAvatarSrc({
        playerId: '00000000-0000-0000-0000-000000000001',
        displayName: 'Seb',
      }),
    ).toBe(PLAYER_AVATAR_BY_KEY.seb)

    expect(
      resolvePlayerAvatarSrc({
        playerId: '00000000-0000-0000-0000-000000000001',
        displayName: 'Guest',
        avatarUrl: 'https://cdn.example.com/guest.png',
      }),
    ).toBe('https://cdn.example.com/guest.png')
  })
})
