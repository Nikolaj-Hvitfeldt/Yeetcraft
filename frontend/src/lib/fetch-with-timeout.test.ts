import { describe, expect, it, vi, afterEach } from 'vitest'
import { ApiError } from '../utils/api-error'
import { API_REQUEST_TIMEOUT_MS, fetchWithTimeout } from './fetch-with-timeout'

describe('fetchWithTimeout', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('rejects with a timeout ApiError when the request times out', async () => {
    vi.spyOn(AbortSignal, 'timeout').mockReturnValue(AbortSignal.abort())
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(
      new DOMException('The operation was aborted.', 'AbortError'),
    )

    await expect(fetchWithTimeout('https://example.com/api/seasons')).rejects.toMatchObject({
      kind: 'timeout',
    })
  })

  it('preserves a caller abort as an abort ApiError', async () => {
    const controller = new AbortController()
    controller.abort()

    await expect(
      fetchWithTimeout('https://example.com/api/seasons', { signal: controller.signal }),
    ).rejects.toMatchObject({
      kind: 'abort',
    })
  })

  it('maps fetch network failures to a network ApiError', async () => {
    vi.spyOn(AbortSignal, 'timeout').mockReturnValue(new AbortController().signal)
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'))

    await expect(fetchWithTimeout('https://example.com/api/seasons')).rejects.toMatchObject({
      kind: 'network',
    })
  })

  it('uses a 45 second timeout budget', () => {
    const timeoutSpy = vi.spyOn(AbortSignal, 'timeout').mockReturnValue(new AbortController().signal)
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }))

    void fetchWithTimeout('https://example.com/api/seasons')

    expect(timeoutSpy).toHaveBeenCalledWith(API_REQUEST_TIMEOUT_MS)
  })

  it('throws typed ApiError instances', async () => {
    vi.spyOn(AbortSignal, 'timeout').mockReturnValue(AbortSignal.abort())
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(
      new DOMException('The operation was aborted.', 'AbortError'),
    )

    await expect(fetchWithTimeout('https://example.com/api/seasons')).rejects.toBeInstanceOf(
      ApiError,
    )
  })
})
