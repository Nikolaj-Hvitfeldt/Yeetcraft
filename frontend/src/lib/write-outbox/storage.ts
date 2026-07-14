import { get, set } from 'idb-keyval'
import type { OutboxSnapshot, PendingWrite } from './types'

export const OUTBOX_STORAGE_KEY = 'yeetcraft-write-outbox-v1'

const EMPTY_SNAPSHOT: OutboxSnapshot = {
  version: 1,
  writes: [],
}

export async function loadOutboxSnapshot(): Promise<OutboxSnapshot> {
  const stored = await get<OutboxSnapshot>(OUTBOX_STORAGE_KEY)
  if (!stored || stored.version !== 1 || !Array.isArray(stored.writes)) {
    return { ...EMPTY_SNAPSHOT, writes: [] }
  }
  return stored
}

export async function persistOutboxSnapshot(writes: PendingWrite[]): Promise<void> {
  const snapshot: OutboxSnapshot = {
    version: 1,
    writes,
  }
  await set(OUTBOX_STORAGE_KEY, snapshot)
}
