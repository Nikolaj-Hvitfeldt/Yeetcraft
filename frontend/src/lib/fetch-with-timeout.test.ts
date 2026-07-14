import { describe, expect, it, vi, afterEach } from 'vitest'
import { API_REQUEST_TIMEOUT_MS, fetchWithTimeout } from './fetch-with-timeout'

describe('fetchWithTimeout', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('rejects with a waking-up message when the request times out', async () => {
    vi.spyOn(AbortSignal, 'timeout').mockReturnValue(AbortSignal.abort())
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(
      new DOMException('The operation was aborted.', 'AbortError'),
    )

    await expect(fetchWithTimeout('https://example.com/api/seasons')).rejects.toThrow(
      'Request timed out. The server may still be waking up.',
    )
  })

  it('uses a 45 second timeout budget', () => {
    const timeoutSpy = vi.spyOn(AbortSignal, 'timeout').mockReturnValue(new AbortController().signal)
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }))

    void fetchWithTimeout('https://example.com/api/seasons')

    expect(timeoutSpy).toHaveBeenCalledWith(API_REQUEST_TIMEOUT_MS)
  })
})
