import martinAvatar from '../assets/player-avatars/martin.webp'
import niklasAvatar from '../assets/player-avatars/niklas.webp'
import nikoAvatar from '../assets/player-avatars/niko.webp'
import sebAvatar from '../assets/player-avatars/seb.webp'
import { PLAYERS_BY_KEY } from '../data/player-characters'

/** Bundled avatars keyed by stable frontend player keys (`PLAYERS_BY_KEY`). */
export const PLAYER_AVATAR_BY_KEY: Readonly<Record<string, string>> = {
  seb: sebAvatar,
  martin: martinAvatar,
  niklas: niklasAvatar,
  niko: nikoAvatar,
}

export type ResolvePlayerAvatarSrcInput = {
  /** Reserved for future ID-based lookup; not used for resolution yet. */
  playerId?: string | null
  displayName?: string | null
  avatarUrl?: string | null
}

/**
 * Resolves an avatar URL with precedence:
 * local bundled avatar (by player key) → API `avatarUrl` → null (placeholder).
 *
 * Player key is derived from `displayName` using the same convention as the
 * player registry (`trim` + lowercase), then validated against `PLAYERS_BY_KEY`.
 */
export function resolvePlayerAvatarSrc({
  displayName,
  avatarUrl,
}: ResolvePlayerAvatarSrcInput): string | null {
  const playerKey = resolveRegistryPlayerKey(displayName)
  if (playerKey) {
    const localAvatar = PLAYER_AVATAR_BY_KEY[playerKey]
    if (localAvatar) return localAvatar
  }

  return avatarUrl ?? null
}

function resolveRegistryPlayerKey(
  displayName: string | null | undefined,
): string | undefined {
  if (!displayName) return undefined
  const key = displayName.trim().toLowerCase()
  if (!key || !(key in PLAYERS_BY_KEY)) return undefined
  return key
}
