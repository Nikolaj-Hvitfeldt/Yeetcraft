import { beforeEach, describe, expect, it, vi } from 'vitest'
import { OUTBOX_STORAGE_KEY } from './storage'
import {
  __resetWriteOutboxStoreForTests,
  findSetPlayerStatsWrite,
  initWriteOutboxStore,
  removeWriteByDedupeKey,
  resetWriteForManualRetry,
  upsertSetPlayerStatsWrite,
} from './store'

const storage = new Map<string, unknown>()

vi.mock('idb-keyval', () => ({
  get: vi.fn(async (key: string) => storage.get(key)),
  set: vi.fn(async (key: string, value: unknown) => {
    storage.set(key, value)
  }),
  del: vi.fn(async (key: string) => {
    storage.delete(key)
  }),
}))

vi.mock('../../utils/token', () => ({
  getAccessToken: vi.fn(() => 'test-token'),
}))

describe('write outbox store', () => {
  beforeEach(() => {
    storage.clear()
    __resetWriteOutboxStoreForTests()
  })

  it('persists writes across reload', async () => {
    await upsertSetPlayerStatsWrite({
      playerId: 'p1',
      seasonId: 's1',
      stats: [{ dungeonId: 'd1', deaths: 1, yeets: 2 }],
    })

    __resetWriteOutboxStoreForTests()
    await initWriteOutboxStore()

    const write = findSetPlayerStatsWrite('p1', 's1')
    expect(write?.payload.stats).toEqual([{ dungeonId: 'd1', deaths: 1, yeets: 2 }])
    expect(storage.has(OUTBOX_STORAGE_KEY)).toBe(true)
  })

  it('consolidates multiple pending stats saves into one snapshot', async () => {
    await upsertSetPlayerStatsWrite({
      playerId: 'p1',
      seasonId: 's1',
      stats: [{ dungeonId: 'd1', deaths: 1, yeets: 2 }],
    })

    await upsertSetPlayerStatsWrite({
      playerId: 'p1',
      seasonId: 's1',
      stats: [{ dungeonId: 'd2', deaths: 3, yeets: 4 }],
    })

    const writes = findSetPlayerStatsWrite('p1', 's1')
    expect(writes?.payload.stats).toEqual([
      { dungeonId: 'd1', deaths: 1, yeets: 2 },
      { dungeonId: 'd2', deaths: 3, yeets: 4 },
    ])

    const snapshot = storage.get(OUTBOX_STORAGE_KEY) as { writes: unknown[] }
    expect(snapshot.writes).toHaveLength(1)
  })

  it('removes a write by dedupe key', async () => {
    await upsertSetPlayerStatsWrite({
      playerId: 'p1',
      seasonId: 's1',
      stats: [{ dungeonId: 'd1', deaths: 1, yeets: 2 }],
    })

    await removeWriteByDedupeKey('set-player-stats:p1:s1')

    expect(findSetPlayerStatsWrite('p1', 's1')).toBeUndefined()
  })

  it('does not enqueue writes without write access', async () => {
    const { getAccessToken } = await import('../../utils/token')
    vi.mocked(getAccessToken).mockReturnValueOnce(null)

    const write = await upsertSetPlayerStatsWrite({
      playerId: 'p1',
      seasonId: 's1',
      stats: [{ dungeonId: 'd1', deaths: 1, yeets: 2 }],
    })

    expect(write).toBeNull()
    expect(findSetPlayerStatsWrite('p1', 's1')).toBeUndefined()
  })

  it('resets only the targeted failed write for manual retry', async () => {
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

    expect(first).not.toBeNull()
    expect(second).not.toBeNull()

    storage.set(OUTBOX_STORAGE_KEY, {
      version: 1,
      writes: [
        { ...first!, status: 'failed', attempts: 5, lastError: 'offline' },
        { ...second!, status: 'failed', attempts: 5, lastError: 'offline' },
      ],
    })
    __resetWriteOutboxStoreForTests([], { keepInMemory: false })
    await initWriteOutboxStore()

    const didReset = await resetWriteForManualRetry(first!.id)
    expect(didReset).toBe(true)

    const writes = [findSetPlayerStatsWrite('p1', 's1'), findSetPlayerStatsWrite('p2', 's1')]
    expect(writes[0]?.status).toBe('pending')
    expect(writes[0]?.attempts).toBe(0)
    expect(writes[1]?.status).toBe('failed')
  })
})
