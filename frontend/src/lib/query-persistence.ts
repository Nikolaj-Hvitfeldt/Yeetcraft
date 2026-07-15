import { get, set, del } from 'idb-keyval'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import type { Query } from '@tanstack/react-query'
import { isPersistedQueryRoot } from './query-keys'

/** IndexedDB storage key; bump the version suffix when query keys, API shapes, or serialization change. */
export const QUERY_CACHE_STORAGE_KEY = 'yeetcraft-query-cache-v1'

/** IndexedDB persistence TTL across sessions (see READ_QUERY_* in query-defaults.ts). */
export const QUERY_CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

export function isPersistedQueryKey(queryKey: readonly unknown[]): boolean {
  const root = queryKey[0]
  return typeof root === 'string' && isPersistedQueryRoot(root)
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
  key: QUERY_CACHE_STORAGE_KEY,
})
