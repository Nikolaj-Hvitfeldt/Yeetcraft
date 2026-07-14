import { describe, expect, it } from 'vitest'
import {
  deriveConnectionState,
  getConnectionBannerContent,
  getPageLoadingMessage,
  shouldShowOfflineNoCache,
} from './connection-state'

describe('deriveConnectionState', () => {
  const base = {
    isOnline: true,
    isRestorePending: false,
    hasCachedData: false,
    isFetching: false,
    isPending: false,
    isError: false,
    slowFetch: false,
  }

  it('returns restoring when cache hydrate is pending', () => {
    expect(
      deriveConnectionState({ ...base, isRestorePending: true }),
    ).toBe('restoring')
  })

  it('returns offline_no_cache when offline without data', () => {
    expect(
      deriveConnectionState({ ...base, isOnline: false, hasCachedData: false }),
    ).toBe('offline_no_cache')
  })

  it('returns offline_cached when offline with data', () => {
    expect(
      deriveConnectionState({ ...base, isOnline: false, hasCachedData: true }),
    ).toBe('offline_cached')
  })

  it('returns first_load_slow when first visit fetch is slow', () => {
    expect(
      deriveConnectionState({
        ...base,
        isPending: true,
        slowFetch: true,
      }),
    ).toBe('first_load_slow')
  })

  it('returns cached_refreshing when cached data is refreshing', () => {
    expect(
      deriveConnectionState({
        ...base,
        hasCachedData: true,
        isFetching: true,
      }),
    ).toBe('cached_refreshing')
  })

  it('returns cached_waking when cached refresh is slow', () => {
    expect(
      deriveConnectionState({
        ...base,
        hasCachedData: true,
        isFetching: true,
        slowFetch: true,
      }),
    ).toBe('cached_waking')
  })

  it('returns cached_refresh_failed when refresh failed with cache', () => {
    expect(
      deriveConnectionState({
        ...base,
        hasCachedData: true,
        isError: true,
      }),
    ).toBe('cached_refresh_failed')
  })

  it('returns idle when cached and settled', () => {
    expect(
      deriveConnectionState({
        ...base,
        hasCachedData: true,
      }),
    ).toBe('idle')
  })
})

describe('connection banner copy', () => {
  it('maps cached refresh states to banner messages', () => {
    expect(getConnectionBannerContent('cached_refreshing')?.message).toContain(
      'saved data',
    )
    expect(getConnectionBannerContent('cached_waking')?.message).toBe(
      'Server is waking up...',
    )
    expect(getConnectionBannerContent('cached_refresh_failed')?.showRetry).toBe(
      true,
    )
  })

  it('returns no banner for idle', () => {
    expect(getConnectionBannerContent('idle')).toBeNull()
  })

  it('uses cold-start loading copy after slow first load', () => {
    expect(getPageLoadingMessage('first_load_slow')).toBe(
      'Starting the YeetCraft server...',
    )
  })

  it('flags offline without cache', () => {
    expect(shouldShowOfflineNoCache('offline_no_cache')).toBe(true)
    expect(shouldShowOfflineNoCache('offline_cached')).toBe(false)
  })
})
