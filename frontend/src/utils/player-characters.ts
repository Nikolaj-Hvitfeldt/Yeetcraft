import {
  CHARACTERS_BY_PLAYER,
  type PlayerCharacter,
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
