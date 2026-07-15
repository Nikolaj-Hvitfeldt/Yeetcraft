import type { SetPlayerStatsBatchRequest } from './types'
import { getAccessToken } from '../../utils/token'
import { mergeSetPlayerStatsPayload } from './merge'
import { loadOutboxSnapshot, persistOutboxSnapshot } from './storage'
import {
  getSetPlayerStatsDedupeKey,
  type PendingWrite,
  type SetPlayerStatsWrite,
  type WriteStatus,
} from './types'

type OutboxListener = (writes: readonly PendingWrite[]) => void

let writesCache: PendingWrite[] = []
let initPromise: Promise<void> | null = null
const listeners = new Set<OutboxListener>()

function notifyListeners(): void {
  const snapshot = [...writesCache]
  for (const listener of listeners) {
    listener(snapshot)
  }
}

async function persistCurrentWrites(): Promise<void> {
  await persistOutboxSnapshot(writesCache)
  notifyListeners()
}

export async function initWriteOutboxStore(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      const snapshot = await loadOutboxSnapshot()
      writesCache = snapshot.writes.map((write) =>
        write.status === 'syncing'
          ? {
              ...write,
              status: 'pending' satisfies WriteStatus,
            }
          : write,
      )
      if (writesCache.some((write, index) => write !== snapshot.writes[index])) {
        await persistOutboxSnapshot(writesCache)
      }
      notifyListeners()
    })()
  }
  await initPromise
}

export function getOutboxWrites(): readonly PendingWrite[] {
  return writesCache
}

export function subscribeOutbox(listener: OutboxListener): () => void {
  listeners.add(listener)
  listener([...writesCache])
  return () => {
    listeners.delete(listener)
  }
}

export function findWriteByDedupeKey(dedupeKey: string): PendingWrite | undefined {
  return writesCache.find((write) => write.dedupeKey === dedupeKey)
}

export function findSetPlayerStatsWrite(
  playerId: string,
  seasonId: string,
): SetPlayerStatsWrite | undefined {
  const dedupeKey = getSetPlayerStatsDedupeKey({ playerId, seasonId, stats: [] })
  const write = findWriteByDedupeKey(dedupeKey)
  return write?.type === 'set-player-stats' ? write : undefined
}

export async function removeWriteByDedupeKey(dedupeKey: string): Promise<void> {
  await initWriteOutboxStore()
  const nextWrites = writesCache.filter((write) => write.dedupeKey !== dedupeKey)
  if (nextWrites.length === writesCache.length) return
  writesCache = nextWrites
  await persistCurrentWrites()
}

export async function upsertSetPlayerStatsWrite(
  payload: SetPlayerStatsBatchRequest,
): Promise<SetPlayerStatsWrite | null> {
  await initWriteOutboxStore()

  const authScope = getAccessToken()
  if (!authScope) {
    return null
  }

  const dedupeKey = getSetPlayerStatsDedupeKey(payload)
  const now = new Date().toISOString()
  const existingIndex = writesCache.findIndex((write) => write.dedupeKey === dedupeKey)

  if (existingIndex === -1) {
    const created: SetPlayerStatsWrite = {
      id: crypto.randomUUID(),
      type: 'set-player-stats',
      createdAt: now,
      updatedAt: now,
      attempts: 0,
      status: 'pending',
      authScope,
      dedupeKey,
      payload,
    }
    writesCache = [...writesCache, created]
    await persistCurrentWrites()
    return created
  }

  const existing = writesCache[existingIndex]
  if (existing.type !== 'set-player-stats') {
    throw new Error(`Unexpected write type for dedupe key ${dedupeKey}`)
  }

  const updated: SetPlayerStatsWrite = {
    ...existing,
    updatedAt: now,
    status: 'pending',
    lastError: undefined,
    authScope,
    payload: mergeSetPlayerStatsPayload(existing.payload, payload),
  }

  writesCache = writesCache.map((write, index) => (index === existingIndex ? updated : write))
  await persistCurrentWrites()
  return updated
}

export async function updateWrite(
  id: string,
  patch: Partial<Pick<PendingWrite, 'status' | 'attempts' | 'lastError' | 'updatedAt'>>,
): Promise<void> {
  await initWriteOutboxStore()
  writesCache = writesCache.map((write) =>
    write.id === id
      ? {
          ...write,
          ...patch,
          updatedAt: patch.updatedAt ?? new Date().toISOString(),
        }
      : write,
  )
  await persistCurrentWrites()
}

export async function resetWriteForManualRetry(writeId: string): Promise<boolean> {
  await initWriteOutboxStore()
  const target = writesCache.find((write) => write.id === writeId)
  if (!target || target.status !== 'failed') return false

  writesCache = writesCache.map((write) =>
    write.id === writeId
      ? {
          ...write,
          status: 'pending' satisfies WriteStatus,
          attempts: 0,
          lastError: undefined,
          updatedAt: new Date().toISOString(),
        }
      : write,
  )
  await persistCurrentWrites()
  return true
}

export async function resetFailedWritesForManualRetry(): Promise<void> {
  await initWriteOutboxStore()
  writesCache = writesCache.map((write) =>
    write.status === 'failed'
      ? {
          ...write,
          status: 'pending' satisfies WriteStatus,
          attempts: 0,
          lastError: undefined,
          updatedAt: new Date().toISOString(),
        }
      : write,
  )
  await persistCurrentWrites()
}

export function __resetWriteOutboxStoreForTests(
  writes: PendingWrite[] = [],
  options?: { keepInMemory?: boolean },
): void {
  writesCache = writes
  initPromise = options?.keepInMemory ? Promise.resolve() : null
  notifyListeners()
}
