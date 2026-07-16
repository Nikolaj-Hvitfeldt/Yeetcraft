import { describe, expect, it } from 'vitest'
import {
  PLAYER_AVATAR_BY_KEY,
  resolvePlayerAvatarSrc,
} from './player-avatar'

describe('resolvePlayerAvatarSrc', () => {
  it('resolves local bundled avatars via explicit playerKey', () => {
    expect(resolvePlayerAvatarSrc({ playerKey: 'seb' })).toBe(
      PLAYER_AVATAR_BY_KEY.seb,
    )
    expect(resolvePlayerAvatarSrc({ playerKey: 'martin' })).toBe(
      PLAYER_AVATAR_BY_KEY.martin,
    )
  })

  it('prefers explicit playerKey over displayName-derived key', () => {
    expect(
      resolvePlayerAvatarSrc({
        playerKey: 'martin',
        displayName: 'Seb',
        avatarUrl: 'https://cdn.example.com/ignored.png',
      }),
    ).toBe(PLAYER_AVATAR_BY_KEY.martin)
  })

  it('falls back to displayName→key when playerKey is omitted', () => {
    expect(resolvePlayerAvatarSrc({ displayName: 'Seb' })).toBe(
      PLAYER_AVATAR_BY_KEY.seb,
    )
    expect(resolvePlayerAvatarSrc({ displayName: 'NIKO' })).toBe(
      PLAYER_AVATAR_BY_KEY.niko,
    )
  })

  it('falls back to displayName→key when playerKey misses the local map', () => {
    expect(
      resolvePlayerAvatarSrc({
        playerKey: 'unknown',
        displayName: 'Niklas',
      }),
    ).toBe(PLAYER_AVATAR_BY_KEY.niklas)
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
})
