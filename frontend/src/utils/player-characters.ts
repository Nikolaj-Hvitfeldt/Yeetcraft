import {
  PLAYERS_BY_KEY,
  type PlayerCharacter,
  type PlayerRole,
} from '../data/player-characters'

/**
 * Resolves a frontend registry player key from a display name.
 * Returns undefined when the name is empty or not in `PLAYERS_BY_KEY`.
 */
export function getRegistryPlayerKey(
  displayName: string | null | undefined,
): string | undefined {
  if (!displayName) return undefined
  const key = displayName.trim().toLowerCase()
  if (!key || !(key in PLAYERS_BY_KEY)) return undefined
  return key
}

export function getPlayerProfile(displayName: string | undefined): {
  /** Registry key when the display name maps to `PLAYERS_BY_KEY`; otherwise undefined. */
  playerKey: string | undefined
  characters: PlayerCharacter[]
  roles: PlayerRole[]
} {
  const playerKey = getRegistryPlayerKey(displayName)
  if (!playerKey) {
    return {
      playerKey: undefined,
      characters: displayName ? [{ name: displayName }] : [],
      roles: [],
    }
  }

  const profile = PLAYERS_BY_KEY[playerKey]
  return {
    playerKey,
    characters: profile.characters,
    roles: profile.roles,
  }
}
