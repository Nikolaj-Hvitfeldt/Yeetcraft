import {
  CHARACTERS_BY_PLAYER,
  ROLES_BY_PLAYER,
  type PlayerCharacter,
  type PlayerRole,
} from '../data/player-characters'

export function getCharactersForPlayer(
  displayName: string | undefined,
): PlayerCharacter[] {
  if (!displayName) return []

  const key = displayName.trim().toLowerCase()
  const characters = CHARACTERS_BY_PLAYER[key]

  if (characters) return characters

  return [{ name: displayName }]
}

export function getRolesForPlayer(
  displayName: string | undefined,
): PlayerRole[] {
  if (!displayName) return []

  return ROLES_BY_PLAYER[displayName.trim().toLowerCase()] ?? []
}
