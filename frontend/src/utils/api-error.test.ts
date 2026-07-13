import { describe, expect, it } from 'vitest'
import { getUserFacingErrorMessage, isRetryableError } from './api-error'

describe('getUserFacingErrorMessage', () => {
  it('maps auth errors', () => {
    expect(getUserFacingErrorMessage(new Error('Unauthorized'))).toContain('access link')
  })

  it('maps server errors', () => {
    expect(getUserFacingErrorMessage(new Error('API error: 500 Internal Server Error'))).toContain(
      'server had trouble',
    )
  })

  it('maps network errors', () => {
    expect(getUserFacingErrorMessage(new Error('Failed to fetch'))).toContain('connection')
  })
})

describe('isRetryableError', () => {
  it('returns false for auth errors', () => {
    expect(isRetryableError(new Error('Unauthorized'))).toBe(false)
  })

  it('returns true for server errors', () => {
    expect(isRetryableError(new Error('API error: 500'))).toBe(true)
  })
})
