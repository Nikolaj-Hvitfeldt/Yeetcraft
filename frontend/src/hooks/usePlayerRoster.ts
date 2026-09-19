import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { fetchPlayerRoster } from '../api/api'
import type { PlayerRosterEntry } from '../api/types'
import { isClassKey, type ClassKey } from '../assets/classes'
import type { PlayerCharacter } from '../data/player-characters'
import { queryKeys } from '../lib/query-keys'
import { getPlayerProfile } from '../utils/player-characters'

interface QueryEnabledOptions {
  enabled?: boolean
}

export function usePlayerRoster(options?: QueryEnabledOptions) {
  return useQuery({
    queryKey: queryKeys.playerRoster(),
    queryFn: fetchPlayerRoster,
    enabled: options?.enabled ?? true,
    placeholderData: keepPreviousData,
  })
}

export function findRosterPlayer(
  players: readonly PlayerRosterEntry[],
  playerId?: string,
  displayName?: string,
): PlayerRosterEntry | undefined {
  if (playerId) {
    const playerById = players.find((player) => player.id === playerId)
    if (playerById) return playerById
  }

  if (!displayName) return undefined
  const normalizedName = displayName.trim().toLowerCase()
  if (!normalizedName) return undefined

  return players.find((player) => player.displayName.trim().toLowerCase() === normalizedName)
}

export function charactersFromRoster(player: PlayerRosterEntry): PlayerCharacter[] {
  return player.characters.map((character) => ({
    name: character.name,
    wowClass: toWowClass(character.classKey),
  }))
}

/**
 * Resolves profile character tags from the public roster when present.
 *
 * Roster data (network or persisted `player-roster` cache) is matched by
 * `player.id`, then `displayName`. `classKey` maps onto existing `wowClass`.
 * Players missing from a loaded roster keep the same synthetic tag as
 * `getPlayerProfile` (`{ name: displayName }`) so guests are not shown an
 * empty list.
 *
 * When the roster query has no data (cache empty / still loading / fetch
 * failed), tags fall back to hardcoded `PLAYERS_BY_KEY` characters only.
 */
export function resolvePlayerCharacters({
  rosterPlayers,
  playerId,
  displayName,
}: {
  rosterPlayers: readonly PlayerRosterEntry[] | undefined
  playerId?: string
  displayName?: string
}): PlayerCharacter[] {
  if (!rosterPlayers) {
    return getPlayerProfile(displayName).characters
  }

  const rosterPlayer = findRosterPlayer(rosterPlayers, playerId, displayName)
  if (rosterPlayer) return charactersFromRoster(rosterPlayer)

  return getPlayerProfile(displayName).characters
}

function toWowClass(classKey: string | null): ClassKey | undefined {
  if (!classKey || !isClassKey(classKey)) return undefined
  return classKey
}
