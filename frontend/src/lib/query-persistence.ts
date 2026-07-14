import { get, set, del } from 'idb-keyval'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import type { Query } from '@tanstack/react-query'

/** Bump only when query keys, API shapes, or serialization change. */
export const QUERY_CACHE_BUSTER = 'yeetcraft-query-cache-v1'

export const QUERY_CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

const PERSISTED_QUERY_KEY_ROOTS = new Set([
  'seasons',
  'season-leaders',
  'season-dungeons',
  'player-stats',
  'player-stats-by-slug',
  'dungeon-leaderboard',
])

export function isPersistedQueryKey(queryKey: readonly unknown[]): boolean {
  const root = queryKey[0]
  return typeof root === 'string' && PERSISTED_QUERY_KEY_ROOTS.has(root)
}

export function shouldDehydratePersistedQuery(query: Query): boolean {
  if (query.state.status !== 'success') return false
  return isPersistedQueryKey(query.queryKey)
}

export const queryPersister = createAsyncStoragePersister({
  storage: {
    getItem: async (key) => (await get<string>(key)) ?? null,
    setItem: async (key, value) => {
      await set(key, value)
    },
    removeItem: async (key) => {
      await del(key)
    },
  },
  key: QUERY_CACHE_BUSTER,
})
