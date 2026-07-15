import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { QueryClient } from '@tanstack/react-query'
import { ApiError } from '../../utils/api-error'
import {
  __processWriteForTests,
  __resetOutboxSyncForTests,
  MAX_AUTO_SYNC_ATTEMPTS,
  retryOutboxSync,
  syncOutbox,
} from './sync'
import {
  __resetWriteOutboxStoreForTests,
  getOutboxWrites,
  initWriteOutboxStore,
  resetWriteForManualRetry,
  upsertSetPlayerStatsWrite,
} from './store'

const fetchSetStatsBatch = vi.fn()

vi.mock('../../api/api', () => ({
  fetchSetStatsBatch: (...args: unknown[]) => fetchSetStatsBatch(...args),
}))

vi.mock('idb-keyval', () => ({
  get: vi.fn(async () => undefined),
  set: vi.fn(async () => undefined),
  del: vi.fn(async () => undefined),
}))

vi.mock('../../utils/token', () => ({
  getAccessToken: vi.fn(() => 'test-token'),
}))

describe('outbox sync', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  beforeEach(async () => {
    fetchSetStatsBatch.mockReset()
    __resetWriteOutboxStoreForTests()
    __resetOutboxSyncForTests()
    vi.useFakeTimers()
    vi.stubGlobal('navigator', {
      ...globalThis.navigator,
      locks: {
        request: async (_name: string, callback: () => Promise<void>) => callback(),
      },
    })

    const { getAccessToken } = await import('../../utils/token')
    vi.mocked(getAccessToken).mockReturnValue('test-token')
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('syncs pending writes on reconnect and removes them after success', async () => {
    fetchSetStatsBatch.mockResolvedValue([])

    await upsertSetPlayerStatsWrite({
      playerId: 'p1',
      seasonId: 's1',
      stats: [{ dungeonId: 'd1', deaths: 1, yeets: 2 }],
    })

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const syncPromise = syncOutbox(queryClient)
    await vi.runAllTimersAsync()
    await syncPromise

    expect(fetchSetStatsBatch).toHaveBeenCalledTimes(1)
    expect(getOutboxWrites()).toHaveLength(0)
    expect(invalidateSpy).toHaveBeenCalled()
  })

  it('marks permanent failures and stops automatic retry', async () => {
    fetchSetStatsBatch.mockRejectedValue(new ApiError('validation', 'Bad request', { status: 400 }))

    await upsertSetPlayerStatsWrite({
      playerId: 'p1',
      seasonId: 's1',
      stats: [{ dungeonId: 'd1', deaths: 1, yeets: 2 }],
    })

    const syncPromise = syncOutbox(queryClient)
    await vi.runAllTimersAsync()
    await syncPromise
    __resetOutboxSyncForTests()
    const secondSyncPromise = syncOutbox(queryClient)
    await vi.runAllTimersAsync()
    await secondSyncPromise

    const write = getOutboxWrites()[0]
    expect(write.status).toBe('failed')
    expect(fetchSetStatsBatch).toHaveBeenCalledTimes(1)
  })

  it('manual retry resets failed writes and syncs again', async () => {
    fetchSetStatsBatch.mockRejectedValue(new ApiError('network', 'offline'))

    await upsertSetPlayerStatsWrite({
      playerId: 'p1',
      seasonId: 's1',
      stats: [{ dungeonId: 'd1', deaths: 1, yeets: 2 }],
    })

    for (let attempt = 0; attempt < MAX_AUTO_SYNC_ATTEMPTS; attempt += 1) {
      __resetOutboxSyncForTests()
      const syncPromise = syncOutbox(queryClient)
      await vi.runAllTimersAsync()
      await syncPromise
    }

    expect(getOutboxWrites()[0]?.status).toBe('failed')

    fetchSetStatsBatch.mockResolvedValue([])
    const retryPromise = retryOutboxSync(queryClient)
    await vi.runAllTimersAsync()
    await retryPromise

    expect(getOutboxWrites()).toHaveLength(0)
    expect(fetchSetStatsBatch).toHaveBeenCalled()
  })

  it('does not sync when auth scope mismatches', async () => {
    const { getAccessToken } = await import('../../utils/token')
    vi.mocked(getAccessToken).mockReturnValueOnce('token-a')

    await upsertSetPlayerStatsWrite({
      playerId: 'p1',
      seasonId: 's1',
      stats: [{ dungeonId: 'd1', deaths: 1, yeets: 2 }],
    })

    vi.mocked(getAccessToken).mockReturnValue('token-b')
    const syncPromise = syncOutbox(queryClient)
    await vi.runAllTimersAsync()
    await syncPromise

    expect(fetchSetStatsBatch).not.toHaveBeenCalled()
    expect(getOutboxWrites()[0]?.status).toBe('failed')
    expect(getOutboxWrites()[0]?.lastError).toContain('different access link')
  })

  it('avoids concurrent sync loops', async () => {
    let inFlight = 0
    let maxInFlight = 0

    fetchSetStatsBatch.mockImplementation(async () => {
      inFlight += 1
      maxInFlight = Math.max(maxInFlight, inFlight)
      await Promise.resolve()
      inFlight -= 1
      return []
    })

    await upsertSetPlayerStatsWrite({
      playerId: 'p1',
      seasonId: 's1',
      stats: [{ dungeonId: 'd1', deaths: 1, yeets: 2 }],
    })

    const first = syncOutbox(queryClient)
    const second = syncOutbox(queryClient)
    await vi.runAllTimersAsync()
    await Promise.all([first, second])

    expect(fetchSetStatsBatch).toHaveBeenCalledTimes(1)
    expect(maxInFlight).toBe(1)
  })

  it('fails after max automatic attempts for retryable errors', async () => {
    fetchSetStatsBatch.mockRejectedValue(new ApiError('network', 'offline'))

    await upsertSetPlayerStatsWrite({
      playerId: 'p1',
      seasonId: 's1',
      stats: [{ dungeonId: 'd1', deaths: 1, yeets: 2 }],
    })

    await initWriteOutboxStore()

    for (let attempt = 0; attempt < MAX_AUTO_SYNC_ATTEMPTS; attempt += 1) {
      __resetOutboxSyncForTests()
      const syncPromise = syncOutbox(queryClient)
      await vi.runAllTimersAsync()
      await syncPromise
    }

    expect(getOutboxWrites()[0]?.status).toBe('failed')
    expect(getOutboxWrites()[0]?.attempts).toBe(MAX_AUTO_SYNC_ATTEMPTS)
  })

  it('keeps pending writes when access token is missing', async () => {
    const { getAccessToken } = await import('../../utils/token')
    vi.mocked(getAccessToken).mockReturnValue(null)

    await upsertSetPlayerStatsWrite({
      playerId: 'p1',
      seasonId: 's1',
      stats: [{ dungeonId: 'd1', deaths: 1, yeets: 2 }],
    })

    const syncPromise = syncOutbox(queryClient)
    await vi.runAllTimersAsync()
    await syncPromise

    expect(fetchSetStatsBatch).not.toHaveBeenCalled()
    expect(getOutboxWrites()[0]?.status).toBe('pending')
    expect(getOutboxWrites()[0]?.lastError).toBeUndefined()
  })

  it('does not remove a write when it changes during sync', async () => {
    let releaseFetch!: (value: never[]) => void
    fetchSetStatsBatch.mockReturnValue(
      new Promise<never[]>((resolve) => {
        releaseFetch = resolve
      }),
    )

    await upsertSetPlayerStatsWrite({
      playerId: 'p1',
      seasonId: 's1',
      stats: [{ dungeonId: 'd1', deaths: 1, yeets: 2 }],
    })

    const write = getOutboxWrites()[0]!
    const processPromise = __processWriteForTests(queryClient, write, 1)

    for (let attempt = 0; attempt < 50; attempt += 1) {
      if (getOutboxWrites()[0]?.status === 'syncing') break
      await Promise.resolve()
    }

    expect(getOutboxWrites()[0]?.status).toBe('syncing')

    await upsertSetPlayerStatsWrite({
      playerId: 'p1',
      seasonId: 's1',
      stats: [{ dungeonId: 'd2', deaths: 3, yeets: 4 }],
    })

    releaseFetch([])
    await vi.runAllTimersAsync()
    await processPromise

    const remainingWrite = getOutboxWrites()[0]
    expect(remainingWrite?.status).toBe('pending')
    expect(remainingWrite?.payload.stats).toEqual(
      expect.arrayContaining([
        { dungeonId: 'd1', deaths: 1, yeets: 2 },
        { dungeonId: 'd2', deaths: 3, yeets: 4 },
      ]),
    )
    expect(fetchSetStatsBatch).toHaveBeenCalledTimes(1)
  })

  it('retries only a targeted failed write on manual retry', async () => {
    const first = await upsertSetPlayerStatsWrite({
      playerId: 'p1',
      seasonId: 's1',
      stats: [{ dungeonId: 'd1', deaths: 1, yeets: 2 }],
    })
    const second = await upsertSetPlayerStatsWrite({
      playerId: 'p2',
      seasonId: 's1',
      stats: [{ dungeonId: 'd1', deaths: 2, yeets: 3 }],
    })

    __resetWriteOutboxStoreForTests(
      [
        { ...first, status: 'failed', attempts: 5, lastError: 'offline' },
        { ...second, status: 'failed', attempts: 5, lastError: 'offline' },
      ],
      { keepInMemory: true },
    )

    fetchSetStatsBatch.mockResolvedValue([])
    expect(await resetWriteForManualRetry(first.id)).toBe(true)
    expect(getOutboxWrites().filter((write) => write.status === 'pending')).toHaveLength(1)

    const syncPromise = syncOutbox(queryClient)
    await vi.runAllTimersAsync()
    await syncPromise

    const writes = getOutboxWrites()
    expect(fetchSetStatsBatch).toHaveBeenCalledTimes(1)
    expect(writes.find((write) => write.payload.playerId === 'p1')).toBeUndefined()
    expect(writes.find((write) => write.payload.playerId === 'p2')?.status).toBe('failed')
  })
})
