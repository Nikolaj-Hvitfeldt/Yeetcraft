import {
  PLAYERS_BY_KEY,
  type PlayerCharacter,
  type PlayerRole,
} from '../data/player-characters'

function getPlayerKey(displayName: string | undefined): string | undefined {
  if (!displayName) return undefined
  return displayName.trim().toLowerCase()
}

export function getPlayerProfile(displayName: string | undefined): {
  characters: PlayerCharacter[]
  roles: PlayerRole[]
} {
  const key = getPlayerKey(displayName)
  if (!key) return { characters: [], roles: [] }

  const profile = PLAYERS_BY_KEY[key]
  if (profile) {
    return {
      characters: profile.characters,
      roles: profile.roles,
    }
  }

  return {
    characters: [{ name: displayName ?? '' }],
    roles: [],
  }
}
