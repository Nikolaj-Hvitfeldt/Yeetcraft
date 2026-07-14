import { describe, expect, it } from 'vitest'
import {
  isPersistedQueryKey,
  shouldDehydratePersistedQuery,
} from './query-persistence'

describe('query persistence allowlist', () => {
  it('allows approved read query roots', () => {
    expect(isPersistedQueryKey(['seasons'])).toBe(true)
    expect(isPersistedQueryKey(['season-leaders', 'season-1'])).toBe(true)
    expect(isPersistedQueryKey(['dungeon-leaderboard', 's1', 'd1'])).toBe(true)
  })

  it('rejects unknown query roots', () => {
    expect(isPersistedQueryKey(['mutations'])).toBe(false)
    expect(isPersistedQueryKey([])).toBe(false)
  })

  it('dehydrates only successful allowlisted queries', () => {
    expect(
      shouldDehydratePersistedQuery({
        queryKey: ['seasons'],
        state: { status: 'success' },
      } as never),
    ).toBe(true)

    expect(
      shouldDehydratePersistedQuery({
        queryKey: ['seasons'],
        state: { status: 'error' },
      } as never),
    ).toBe(false)

    expect(
      shouldDehydratePersistedQuery({
        queryKey: ['unknown'],
        state: { status: 'success' },
      } as never),
    ).toBe(false)
  })
})
