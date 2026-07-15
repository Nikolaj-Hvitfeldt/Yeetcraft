import { describe, expect, it } from 'vitest'
import { ApiError } from '../utils/api-error'
import { MAX_QUERY_RETRY_COUNT, queryRetryDelay, shouldRetryQuery } from './query-defaults'

describe('shouldRetryQuery', () => {
  it('retries network, timeout, and server failures up to the cap', () => {
    const networkError = new ApiError('network', 'Failed to reach the server')
    const timeoutError = new ApiError('timeout', 'Request timed out')
    const serverError = new ApiError('server', 'API error: 500')

    expect(shouldRetryQuery(0, networkError)).toBe(true)
    expect(shouldRetryQuery(1, timeoutError)).toBe(true)
    expect(shouldRetryQuery(MAX_QUERY_RETRY_COUNT, serverError)).toBe(false)
  })

  it('does not retry auth, forbidden, not found, validation, or abort errors', () => {
    expect(shouldRetryQuery(0, new ApiError('auth', 'Unauthorized'))).toBe(false)
    expect(shouldRetryQuery(0, new ApiError('forbidden', 'Forbidden'))).toBe(false)
    expect(shouldRetryQuery(0, new ApiError('not_found', 'Not found'))).toBe(false)
    expect(shouldRetryQuery(0, new ApiError('validation', 'Bad request'))).toBe(false)
    expect(shouldRetryQuery(0, new ApiError('abort', 'Aborted'))).toBe(false)
  })

  it('aligns unknown HTTP 400 errors with isRetryableError', () => {
    expect(
      shouldRetryQuery(0, new ApiError('unknown', 'Bad request', { status: 400 })),
    ).toBe(false)
  })
})

describe('queryRetryDelay', () => {
  it('uses exponential backoff capped at 8 seconds', () => {
    expect(queryRetryDelay(0)).toBe(1000)
    expect(queryRetryDelay(1)).toBe(2000)
    expect(queryRetryDelay(2)).toBe(4000)
    expect(queryRetryDelay(3)).toBe(8000)
    expect(queryRetryDelay(4)).toBe(8000)
  })
})
