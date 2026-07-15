import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { ApiError } from '../utils/api-error'
import { parseApiResponse, toHttpApiError } from './api-response'

describe('api-response helpers', () => {
  it('maps HTTP statuses to ApiError kinds', () => {
    expect(toHttpApiError(401, 'Unauthorized').kind).toBe('auth')
    expect(toHttpApiError(403, 'Forbidden').kind).toBe('forbidden')
    expect(toHttpApiError(404, 'Not found').kind).toBe('not_found')
    expect(toHttpApiError(400, 'Bad request').kind).toBe('validation')
    expect(toHttpApiError(500, 'Server error').kind).toBe('server')
  })

  it('wraps Zod validation failures', () => {
    const schema = z.object({ id: z.string() })

    expect(() => parseApiResponse({ id: 1 }, schema, '/api/test')).toThrow(ApiError)
    expect(() => parseApiResponse({ id: 1 }, schema, '/api/test')).toThrow(/Invalid response/)
  })
})
