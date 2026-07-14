import { getApiErrorKind } from '../utils/api-error'

/**
 * In-memory query freshness and retention (see also QUERY_CACHE_MAX_AGE_MS in
 * query-persistence.ts for IndexedDB persistence across sessions).
 */
export const READ_QUERY_STALE_TIME_MS = 5 * 60 * 1000
export const READ_QUERY_GC_TIME_MS = 24 * 60 * 60 * 1000

/** Max retry attempts after the initial request (2 retries = 3 total attempts). */
export const MAX_QUERY_RETRY_COUNT = 2

const NON_RETRYABLE_KINDS = new Set([
  'auth',
  'forbidden',
  'not_found',
  'validation',
  'abort',
])

export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (failureCount >= MAX_QUERY_RETRY_COUNT) return false

  const kind = getApiErrorKind(error)
  if (NON_RETRYABLE_KINDS.has(kind)) return false

  return kind === 'network' || kind === 'timeout' || kind === 'server' || kind === 'unknown'
}

export function queryRetryDelay(attemptIndex: number): number {
  return Math.min(1000 * 2 ** attemptIndex, 8000)
}
