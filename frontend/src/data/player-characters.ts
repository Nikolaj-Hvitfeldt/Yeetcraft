import type { ClassKey } from '../assets/classes'

export type PlayerRole = 'DPS' | 'Healer' | 'Tank'

export type PlayerCharacter = {
  name: string
  wowClass?: ClassKey
}

export type PlayerRegistryEntry = {
  roles: PlayerRole[]
  characters: PlayerCharacter[]
}

/**
 * Frontend registry for player-level roles and avatar keys.
 *
 * Character lists are a temporary cache-empty fallback only: profile tags
 * load from `GET /api/players` when a roster is available (network or
 * persisted query cache). Do not treat these characters as the live source
 * of truth.
 */
export const PLAYERS_BY_KEY: Record<string, PlayerRegistryEntry> = {
  seb: {
    roles: ['DPS', 'Healer'],
    characters: [
      { name: 'MostDope', wowClass: 'warlock' },
      { name: 'Nudelkriger', wowClass: 'priest' },
    ],
  },
  martin: {
    roles: ['DPS', 'Healer', 'Tank'],
    characters: [
      { name: 'Zorker', wowClass: 'priest' },
      { name: 'Rauw', wowClass: 'shaman' },
    ],
  },
  niklas: {
    roles: ['DPS', 'Tank'],
    characters: [{ name: 'Ungeork', wowClass: 'hunter' }],
  },
  niko: {
    roles: ['DPS'],
    characters: [
      { name: 'Freecry', wowClass: 'demonhunter' },
      { name: 'LouiLoui', wowClass: 'evoker' },
    ],
  },
}
