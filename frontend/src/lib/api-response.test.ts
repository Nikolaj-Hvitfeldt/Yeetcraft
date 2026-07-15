import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { ApiError } from '../utils/api-error'
import { clearAccessToken } from '../utils/token'
import { parseApiResponse, toHttpApiError, throwForFailedResponse } from './api-response'

vi.mock('../utils/token', async () => {
  const actual = await vi.importActual<typeof import('../utils/token')>('../utils/token')
  return {
    ...actual,
    clearAccessToken: vi.fn(actual.clearAccessToken),
  }
})

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

  it('clears write access on 401 when a token was sent', async () => {
    localStorage.setItem('yeetcraft_token', 'stored-token')

    await expect(
      throwForFailedResponse(
        new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 }),
        'stored-token',
      ),
    ).rejects.toMatchObject({ kind: 'auth' })

    expect(clearAccessToken).toHaveBeenCalled()
    expect(localStorage.getItem('yeetcraft_token')).toBeNull()
  })
})
