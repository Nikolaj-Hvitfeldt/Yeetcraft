import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchPlayerRoster } from '../api/api'
import type { PlayerRosterEntry, PlayersResponse } from '../api/types'
import { queryKeys } from '../lib/query-keys'
import { resolvePlayerCharacters, usePlayerRoster } from './usePlayerRoster'

vi.mock('../api/api', () => ({
  fetchPlayerRoster: vi.fn(),
}))

const sebRosterPlayer: PlayerRosterEntry = {
  id: 'p-seb',
  displayName: 'Seb',
  avatarUrl: null,
  characters: [
    {
      id: 'c-1',
      name: 'MostDope',
      realm: null,
      region: null,
      classKey: 'warlock',
      active: true,
      displayOrder: 0,
    },
    {
      id: 'c-2',
      name: 'Nudelkriger',
      realm: null,
      region: null,
      classKey: 'priest',
      active: true,
      displayOrder: 1,
    },
  ],
}

const emptyRosterPlayer: PlayerRosterEntry = {
  id: 'p-empty',
  displayName: 'Empty',
  avatarUrl: null,
  characters: [],
}

const rosterResponse: PlayersResponse = {
  players: [sebRosterPlayer, emptyRosterPlayer],
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }

  return { queryClient, Wrapper }
}

describe('usePlayerRoster', () => {
  beforeEach(() => {
    vi.mocked(fetchPlayerRoster).mockReset()
    vi.mocked(fetchPlayerRoster).mockResolvedValue(rosterResponse)
  })

  it('loads the public player roster', async () => {
    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => usePlayerRoster(), { wrapper: Wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(fetchPlayerRoster).toHaveBeenCalledTimes(1)
    expect(result.current.data).toEqual(rosterResponse)
  })
})

describe('resolvePlayerCharacters', () => {
  it('maps multiple roster characters and classKey onto wowClass', () => {
    expect(
      resolvePlayerCharacters({
        rosterPlayers: rosterResponse.players,
        playerId: 'p-seb',
        displayName: 'Seb',
      }),
    ).toEqual([
      { name: 'MostDope', wowClass: 'warlock' },
      { name: 'Nudelkriger', wowClass: 'priest' },
    ])
  })

  it('returns an empty tag list for roster players with no characters', () => {
    expect(
      resolvePlayerCharacters({
        rosterPlayers: rosterResponse.players,
        playerId: 'p-empty',
        displayName: 'Empty',
      }),
    ).toEqual([])
  })

  it('matches by displayName when player id is missing', () => {
    expect(
      resolvePlayerCharacters({
        rosterPlayers: rosterResponse.players,
        displayName: '  SEB ',
      }),
    ).toEqual([
      { name: 'MostDope', wowClass: 'warlock' },
      { name: 'Nudelkriger', wowClass: 'priest' },
    ])
  })

  it('keeps a synthetic display-name tag for guest and unknown players', () => {
    expect(
      resolvePlayerCharacters({
        rosterPlayers: rosterResponse.players,
        playerId: 'p-guest',
        displayName: 'Guest',
      }),
    ).toEqual([{ name: 'Guest' }])
  })

  it('falls back to hardcoded characters only when the roster cache is empty', () => {
    expect(
      resolvePlayerCharacters({
        rosterPlayers: undefined,
        playerId: 'p-seb',
        displayName: 'Seb',
      }),
    ).toEqual([
      { name: 'MostDope', wowClass: 'warlock' },
      { name: 'Nudelkriger', wowClass: 'priest' },
    ])
  })

  it('omits wowClass when classKey is unknown', () => {
    expect(
      resolvePlayerCharacters({
        rosterPlayers: [
          {
            id: 'p-unknown-class',
            displayName: 'Mystery',
            avatarUrl: null,
            characters: [
              {
                id: 'c-unknown',
                name: 'MysteryAlt',
                realm: null,
                region: null,
                classKey: 'not-a-class',
                active: true,
                displayOrder: 0,
              },
            ],
          },
        ],
        playerId: 'p-unknown-class',
        displayName: 'Mystery',
      }),
    ).toEqual([{ name: 'MysteryAlt' }])
  })
})

describe('player roster query key', () => {
  it('uses the persisted player-roster root', () => {
    expect(queryKeys.playerRoster()).toEqual(['player-roster'])
  })
})
