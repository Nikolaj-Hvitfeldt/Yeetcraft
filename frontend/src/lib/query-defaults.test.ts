import { describe, expect, it } from 'vitest'
import { ApiError } from '../utils/api-error'
import { MAX_QUERY_RETRY_COUNT, shouldRetryQuery } from './query-defaults'

describe('shouldRetryQuery', () => {
  it('retries network, timeout, and server failures up to the cap', () => {
    const networkError = new ApiError('network', 'Failed to reach the server')
    const timeoutError = new ApiError('timeout', 'Request timed out')
    const serverError = new ApiError('server', 'API error: 500')

    expect(shouldRetryQuery(0, networkError)).toBe(true)
    expect(shouldRetryQuery(1, timeoutError)).toBe(true)
    expect(shouldRetryQuery(MAX_QUERY_RETRY_COUNT, serverError)).toBe(false)
  })

  it('does not retry auth, forbidden, not found, or abort errors', () => {
    expect(shouldRetryQuery(0, new ApiError('auth', 'Unauthorized'))).toBe(false)
    expect(shouldRetryQuery(0, new ApiError('forbidden', 'Forbidden'))).toBe(false)
    expect(shouldRetryQuery(0, new ApiError('not_found', 'Not found'))).toBe(false)
    expect(shouldRetryQuery(0, new ApiError('abort', 'Aborted'))).toBe(false)
  })
})
