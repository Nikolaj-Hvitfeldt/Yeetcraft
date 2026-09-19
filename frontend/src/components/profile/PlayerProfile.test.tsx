import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { PlayerRosterEntry, PlayerStatsResponse, SeasonSummary } from '../../api/types'
import { ThemeProvider } from '../../hooks'
import {
  usePlayerProfileEdit,
  usePlayerRoster,
  usePlayerStatsBySlug,
  useSeasonId,
  useSeasonLeaders,
} from '../../hooks'

vi.mock('../../hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../hooks')>()
  return {
    ...actual,
    useSeasonId: vi.fn(),
    useSeasonLeaders: vi.fn(),
    usePlayerStatsBySlug: vi.fn(),
    usePlayerRoster: vi.fn(),
    useWriteAccess: vi.fn(() => false),
    usePlayerProfileEdit: vi.fn(),
  }
})

vi.mock('../../hooks/usePageConnectionState', () => ({
  usePageConnection: () => ({ loadingMessage: undefined, showOfflineNoCache: false }),
}))

vi.mock('../../hooks/useWriteOutboxStatus', () => ({
  useSetPlayerStatsOutboxStatus: () => null,
}))

import { PlayerProfile } from './PlayerProfile'

afterEach(() => {
  cleanup()
})

const season: SeasonSummary = {
  id: 's1',
  name: 'Midnight Season 1',
  expansion: 'Midnight',
  isCurrent: true,
}

const editState = {
  breakdownMode: 'browse' as const,
  dungeonsForBreakdown: [],
  handleAdjustDraft: vi.fn(),
  handleCancelEdit: vi.fn(),
  handleDoneEdit: vi.fn(),
  handleEnterEdit: vi.fn(),
  isEditing: false,
  isSaving: false,
  toastMessage: null,
}

function playerStatsFor(id: string, displayName: string): PlayerStatsResponse {
  return {
    player: { id, displayName, avatarUrl: null },
    season,
    totalDeaths: 1,
    totalYeets: 1,
    totalMistakes: 2,
    dungeons: [],
  }
}

function rosterPlayer(
  id: string,
  displayName: string,
  characters: PlayerRosterEntry['characters'],
): PlayerRosterEntry {
  return { id, displayName, avatarUrl: null, characters }
}

function renderProfile(playerSlug: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <MemoryRouter initialEntries={[`/${playerSlug}`]}>
            <Routes>
              <Route path="/:playerSlug" element={children} />
            </Routes>
          </MemoryRouter>
        </ThemeProvider>
      </QueryClientProvider>
    )
  }

  return render(<PlayerProfile />, { wrapper: Wrapper })
}

describe('PlayerProfile character tags', () => {
  beforeEach(() => {
    vi.mocked(useSeasonId).mockReturnValue({
      seasons: [season],
      isPendingSeasons: false,
      isSeasonReady: true,
      selectedSeasonId: season.id,
      selectedSeason: season,
      setSeasonId: vi.fn(),
      homePath: '/midnight-season-1',
    })
    vi.mocked(useSeasonLeaders).mockReturnValue({ data: undefined } as never)
    vi.mocked(usePlayerProfileEdit).mockReturnValue(editState)
    vi.mocked(usePlayerRoster).mockReturnValue({ data: undefined } as never)
  })

  it('renders multiple roster character tags', () => {
    const stats = playerStatsFor('p-seb', 'Seb')
    vi.mocked(usePlayerStatsBySlug).mockReturnValue({
      data: stats,
      isPending: false,
      isFetching: false,
      isFetched: true,
      error: null,
      failureCount: 0,
      refetch: vi.fn(),
    } as never)
    vi.mocked(usePlayerRoster).mockReturnValue({
      data: {
        players: [
          rosterPlayer('p-seb', 'Seb', [
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
              name: 'ApiAlt',
              realm: null,
              region: null,
              classKey: 'priest',
              active: true,
              displayOrder: 1,
            },
          ]),
        ],
      },
    } as never)

    renderProfile('seb')

    expect(screen.getByText('2 characters tracked this season')).toBeInTheDocument()
    expect(screen.getByText('MostDope')).toBeInTheDocument()
    expect(screen.getByText('ApiAlt')).toBeInTheDocument()
  })

  it('renders an empty tag list for roster players with no characters', () => {
    const stats = playerStatsFor('p-empty', 'Empty')
    vi.mocked(usePlayerStatsBySlug).mockReturnValue({
      data: stats,
      isPending: false,
      isFetching: false,
      isFetched: true,
      error: null,
      failureCount: 0,
      refetch: vi.fn(),
    } as never)
    vi.mocked(usePlayerRoster).mockReturnValue({
      data: { players: [rosterPlayer('p-empty', 'Empty', [])] },
    } as never)

    renderProfile('empty')

    expect(screen.getByText('0 characters tracked this season')).toBeInTheDocument()
    expect(screen.queryByText('MostDope')).not.toBeInTheDocument()
  })

  it('keeps a synthetic tag for guest and unknown players', () => {
    const stats = playerStatsFor('p-guest', 'Guest')
    vi.mocked(usePlayerStatsBySlug).mockReturnValue({
      data: stats,
      isPending: false,
      isFetching: false,
      isFetched: true,
      error: null,
      failureCount: 0,
      refetch: vi.fn(),
    } as never)
    vi.mocked(usePlayerRoster).mockReturnValue({
      data: { players: [rosterPlayer('p-seb', 'Seb', [])] },
    } as never)

    renderProfile('guest')

    expect(screen.getByText('1 characters tracked this season')).toBeInTheDocument()
    expect(screen.getAllByText('Guest').length).toBeGreaterThan(1)
  })
})
