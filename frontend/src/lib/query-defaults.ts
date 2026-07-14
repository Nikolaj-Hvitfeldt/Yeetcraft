export const READ_QUERY_STALE_TIME_MS = 5 * 60 * 1000
export const READ_QUERY_GC_TIME_MS = 24 * 60 * 60 * 1000

const NON_RETRYABLE_PATTERNS = [
  'Unauthorized',
  'token',
  '404',
  'not found',
  'Missing player',
  'Missing season',
]

export function isNonRetryableQueryError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  const message = error.message
  return NON_RETRYABLE_PATTERNS.some(
    (pattern) =>
      message.includes(pattern) ||
      message.toLowerCase().includes(pattern.toLowerCase()),
  )
}

export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (failureCount >= 3) return false
  if (isNonRetryableQueryError(error)) return false
  return true
}

export function queryRetryDelay(attemptIndex: number): number {
  return Math.min(1000 * 2 ** attemptIndex, 8000)
}
