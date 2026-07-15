import { describe, expect, it } from 'vitest'
import {
  ApiError,
  getApiErrorKind,
  getUserFacingErrorMessage,
  isNotFoundApiError,
  isRetryableError,
} from './api-error'

describe('ApiError classification', () => {
  it('preserves typed ApiError kinds', () => {
    expect(getApiErrorKind(new ApiError('timeout', 'Request timed out'))).toBe('timeout')
    expect(getApiErrorKind(new ApiError('auth', 'Unauthorized', { status: 401 }))).toBe('auth')
    expect(getApiErrorKind(new ApiError('forbidden', 'Forbidden', { status: 403 }))).toBe(
      'forbidden',
    )
    expect(getApiErrorKind(new ApiError('not_found', 'Not found', { status: 404 }))).toBe(
      'not_found',
    )
    expect(getApiErrorKind(new ApiError('server', 'Server error', { status: 500 }))).toBe('server')
    expect(getApiErrorKind(new ApiError('network', 'Failed to reach the server'))).toBe('network')
  })

  it('classifies legacy string errors', () => {
    expect(getApiErrorKind(new Error('Failed to fetch'))).toBe('network')
    expect(getApiErrorKind(new Error('API error: 500 Internal Server Error'))).toBe('server')
    expect(getApiErrorKind(new Error('Unauthorized'))).toBe('auth')
  })

  it('maps not found helpers', () => {
    expect(isNotFoundApiError(new ApiError('not_found', 'missing'))).toBe(true)
    expect(isNotFoundApiError(new Error('API error: 404'))).toBe(true)
  })
})

describe('getUserFacingErrorMessage', () => {
  it('maps auth errors', () => {
    expect(getUserFacingErrorMessage(new ApiError('auth', 'Unauthorized'))).toContain('access link')
  })

  it('maps forbidden errors', () => {
    expect(getUserFacingErrorMessage(new ApiError('forbidden', 'Forbidden'))).toContain(
      'permission',
    )
  })

  it('maps server errors', () => {
    expect(getUserFacingErrorMessage(new ApiError('server', 'API error: 500'))).toContain(
      'server had trouble',
    )
  })

  it('maps network errors', () => {
    expect(getUserFacingErrorMessage(new ApiError('network', 'Failed to reach the server'))).toContain(
      'connection',
    )
  })

  it('maps timeout errors', () => {
    expect(getUserFacingErrorMessage(new ApiError('timeout', 'Request timed out'))).toContain(
      'waking up',
    )
  })
})

describe('isRetryableError', () => {
  it('returns false for auth, forbidden, not found, validation, and abort errors', () => {
    expect(isRetryableError(new ApiError('auth', 'Unauthorized'))).toBe(false)
    expect(isRetryableError(new ApiError('forbidden', 'Forbidden'))).toBe(false)
    expect(isRetryableError(new ApiError('not_found', 'Not found'))).toBe(false)
    expect(isRetryableError(new ApiError('validation', 'Bad request'))).toBe(false)
    expect(isRetryableError(new ApiError('abort', 'Aborted'))).toBe(false)
  })

  it('returns true for network, timeout, and server errors', () => {
    expect(isRetryableError(new ApiError('network', 'Failed to reach the server'))).toBe(true)
    expect(isRetryableError(new ApiError('timeout', 'Request timed out'))).toBe(true)
    expect(isRetryableError(new ApiError('server', 'API error: 500'))).toBe(true)
  })
})
