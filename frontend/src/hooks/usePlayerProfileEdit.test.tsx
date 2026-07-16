import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../utils/api-error'
import type { PlayerStatsResponse } from '../api/types'
import { usePlayerProfileEdit } from './usePlayerProfileEdit'

const mutateAsync = vi.fn()

vi.mock('./useSetPlayerStats', () => ({
  useSetPlayerStats: () => ({
    mutateAsync,
    isPending: false,
  }),
}))

const playerStats: PlayerStatsResponse = {
  player: { id: 'p1', displayName: 'Alpha', avatarUrl: null },
  season: { id: 's1', name: 'Season 1', expansion: null, isCurrent: true },
  totalDeaths: 1,
  totalYeets: 2,
  totalMistakes: 3,
  dungeons: [
    {
      dungeon: {
        id: 'd1',
        name: 'Test Dungeon',
        shortName: null,
        displayOrder: 1,
        totalDeaths: 1,
        totalYeets: 2,
        totalMistakes: 3,
      },
      deaths: 1,
      yeets: 2,
      totalMistakes: 3,
    },
  ],
}

const defaultOptions = {
  canWrite: true,
  playerStats,
  playerSlugParam: 'alpha',
  selectedSeasonId: 's1',
} as const

describe('usePlayerProfileEdit', () => {
  beforeEach(() => {
    mutateAsync.mockReset()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('does not enter edit mode without write access', () => {
    const { result } = renderHook(() =>
      usePlayerProfileEdit({
        ...defaultOptions,
        canWrite: false,
      }),
    )

    act(() => {
      result.current.handleEnterEdit()
    })

    expect(result.current.isEditing).toBe(false)
    expect(result.current.breakdownMode).toBe('browse')
  })

  it('exits edit mode when write access is revoked', () => {
    const { result, rerender } = renderHook(
      (canWrite: boolean) =>
        usePlayerProfileEdit({
          ...defaultOptions,
          canWrite,
        }),
      { initialProps: true },
    )

    act(() => {
      result.current.handleEnterEdit()
    })

    expect(result.current.isEditing).toBe(true)

    rerender(false)

    expect(result.current.isEditing).toBe(false)
    expect(result.current.breakdownMode).toBe('browse')
  })

  it('enters edit mode with a cloned draft', () => {
    const { result } = renderHook(() => usePlayerProfileEdit(defaultOptions))

    act(() => {
      result.current.handleEnterEdit()
    })

    expect(result.current.isEditing).toBe(true)
    expect(result.current.breakdownMode).toBe('edit')
    expect(result.current.dungeonsForBreakdown).toEqual(playerStats.dungeons)
    expect(result.current.dungeonsForBreakdown).not.toBe(playerStats.dungeons)
  })

  it('adjusts draft stats without going below zero', () => {
    const { result } = renderHook(() => usePlayerProfileEdit(defaultOptions))

    act(() => {
      result.current.handleEnterEdit()
    })

    act(() => {
      result.current.handleAdjustDraft('d1', 'deaths', -1)
    })

    expect(result.current.dungeonsForBreakdown[0]?.deaths).toBe(0)
    expect(result.current.dungeonsForBreakdown[0]?.totalMistakes).toBe(2)

    act(() => {
      result.current.handleAdjustDraft('d1', 'deaths', -1)
    })

    expect(result.current.dungeonsForBreakdown[0]?.deaths).toBe(0)
  })

  it('exits edit mode without saving when nothing changed', async () => {
    const { result } = renderHook(() => usePlayerProfileEdit(defaultOptions))

    act(() => {
      result.current.handleEnterEdit()
    })

    await act(async () => {
      await result.current.handleDoneEdit()
    })

    expect(mutateAsync).not.toHaveBeenCalled()
    expect(result.current.isEditing).toBe(false)
    expect(result.current.breakdownMode).toBe('browse')
  })

  it('saves changed rows and exits edit mode on success', async () => {
    mutateAsync.mockResolvedValue([])

    const { result } = renderHook(() => usePlayerProfileEdit(defaultOptions))

    act(() => {
      result.current.handleEnterEdit()
    })

    act(() => {
      result.current.handleAdjustDraft('d1', 'yeets', 1)
    })

    await act(async () => {
      await result.current.handleDoneEdit()
    })

    expect(mutateAsync).toHaveBeenCalledWith({
      playerId: 'p1',
      seasonId: 's1',
      stats: [{ dungeonId: 'd1', deaths: 1, yeets: 3 }],
    })
    expect(result.current.isEditing).toBe(false)
    expect(result.current.toastMessage).toBeNull()
  })

  it('keeps browse mode when a retryable save fails', async () => {
    mutateAsync.mockRejectedValue(new ApiError('network', 'Failed to reach the server'))

    const { result } = renderHook(() => usePlayerProfileEdit(defaultOptions))

    act(() => {
      result.current.handleEnterEdit()
    })

    act(() => {
      result.current.handleAdjustDraft('d1', 'yeets', 1)
    })

    await act(async () => {
      await result.current.handleDoneEdit()
    })

    expect(result.current.isEditing).toBe(false)
    expect(result.current.breakdownMode).toBe('browse')
    expect(result.current.toastMessage).toBeNull()
  })

  it('restores edit state and shows toast when save fails permanently', async () => {
    mutateAsync.mockRejectedValue(new ApiError('validation', 'Bad request'))

    const { result } = renderHook(() => usePlayerProfileEdit(defaultOptions))

    act(() => {
      result.current.handleEnterEdit()
    })

    act(() => {
      result.current.handleAdjustDraft('d1', 'yeets', 1)
    })

    await act(async () => {
      await result.current.handleDoneEdit()
    })

    expect(result.current.isEditing).toBe(true)
    expect(result.current.breakdownMode).toBe('edit')
    expect(result.current.toastMessage).toContain('unexpected data')
  })

  it('shows auth toast in browse mode when save is rejected', async () => {
    mutateAsync.mockRejectedValue(new ApiError('auth', 'Unauthorized', { status: 401 }))

    const { result, rerender } = renderHook(
      (canWrite: boolean) =>
        usePlayerProfileEdit({
          ...defaultOptions,
          canWrite,
        }),
      { initialProps: true },
    )

    act(() => {
      result.current.handleEnterEdit()
    })

    act(() => {
      result.current.handleAdjustDraft('d1', 'yeets', 1)
    })

    await act(async () => {
      await result.current.handleDoneEdit()
    })

    expect(result.current.isEditing).toBe(false)
    expect(result.current.breakdownMode).toBe('browse')
    expect(result.current.toastMessage).toContain('access link')

    rerender(false)

    expect(result.current.toastMessage).toContain('access link')
  })

  it('resets edit state when player or season changes', () => {
    const { result, rerender } = renderHook(
      (props: { slug: string; seasonId: string }) =>
        usePlayerProfileEdit({
          ...defaultOptions,
          playerSlugParam: props.slug,
          selectedSeasonId: props.seasonId,
        }),
      { initialProps: { slug: 'alpha', seasonId: 's1' } },
    )

    act(() => {
      result.current.handleEnterEdit()
    })

    rerender({ slug: 'bravo', seasonId: 's1' })

    expect(result.current.isEditing).toBe(false)
    expect(result.current.breakdownMode).toBe('browse')
  })

  it('clears toast after timeout', async () => {
    mutateAsync.mockRejectedValue(new ApiError('validation', 'Bad request'))

    const { result } = renderHook(() => usePlayerProfileEdit(defaultOptions))

    act(() => {
      result.current.handleEnterEdit()
    })

    act(() => {
      result.current.handleAdjustDraft('d1', 'yeets', 1)
    })

    await act(async () => {
      await result.current.handleDoneEdit()
    })

    expect(result.current.toastMessage).toContain('unexpected data')

    act(() => {
      vi.advanceTimersByTime(4000)
    })

    expect(result.current.toastMessage).toBeNull()
  })
})
