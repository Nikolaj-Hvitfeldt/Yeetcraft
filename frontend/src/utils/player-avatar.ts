import martinAvatar from '../assets/player-avatars/martin.webp'
import niklasAvatar from '../assets/player-avatars/niklas.webp'
import nikoAvatar from '../assets/player-avatars/niko.webp'
import sebAvatar from '../assets/player-avatars/seb.webp'
import { getRegistryPlayerKey } from './player-characters'

/** Bundled avatars keyed by stable frontend player keys (`PLAYERS_BY_KEY`). */
export const PLAYER_AVATAR_BY_KEY: Readonly<Record<string, string>> = {
  seb: sebAvatar,
  martin: martinAvatar,
  niklas: niklasAvatar,
  niko: nikoAvatar,
}

export type ResolvePlayerAvatarSrcInput = {
  /** Preferred when the caller already has or naturally derives a registry key. */
  playerKey?: string | null
  displayName?: string | null
  avatarUrl?: string | null
}

/**
 * Resolves an avatar URL with precedence:
 * explicit `playerKey` → local map → displayName→key fallback → API `avatarUrl` → null.
 */
export function resolvePlayerAvatarSrc({
  playerKey,
  displayName,
  avatarUrl,
}: ResolvePlayerAvatarSrcInput): string | null {
  if (playerKey) {
    const localByKey = PLAYER_AVATAR_BY_KEY[playerKey]
    if (localByKey) return localByKey
  }

  const fallbackKey = getRegistryPlayerKey(displayName)
  if (fallbackKey) {
    const localByName = PLAYER_AVATAR_BY_KEY[fallbackKey]
    if (localByName) return localByName
  }

  return avatarUrl ?? null
}
