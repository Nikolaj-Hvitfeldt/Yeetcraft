import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchSeasons } from './api'

vi.mock('../lib/fetch-with-timeout', () => ({
  fetchWithTimeout: vi.fn(),
}))

vi.mock('../utils/token', () => ({
  getAccessToken: vi.fn(() => 'stored-token'),
}))

import { fetchWithTimeout } from '../lib/fetch-with-timeout'

describe('api request auth headers', () => {
  beforeEach(() => {
    vi.mocked(fetchWithTimeout).mockReset()
    vi.mocked(fetchWithTimeout).mockResolvedValue(
      new Response(JSON.stringify({ seasons: [] }), { status: 200 }),
    )
  })

  it('does not send X-API-Key on public GET requests', async () => {
    await fetchSeasons()

    const [, options] = vi.mocked(fetchWithTimeout).mock.calls[0] ?? []
    const headers = options?.headers as Record<string, string> | undefined

    expect(headers?.['X-API-Key']).toBeUndefined()
  })
})
