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
    justReconnected: false,
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

  it('returns cached_refreshing before the cold-start delay elapses', () => {
    expect(
      deriveConnectionState({
        ...base,
        hasCachedData: true,
        isFetching: true,
      }),
    ).toBe('cached_refreshing')
  })

  it('returns cached_waking only after the cold-start delay elapses', () => {
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

  it('returns reconnecting after coming back online with cached data', () => {
    expect(
      deriveConnectionState({
        ...base,
        hasCachedData: true,
        isFetching: true,
        justReconnected: true,
      }),
    ).toBe('reconnecting')
  })

  it('returns idle after cached data has recovered', () => {
    expect(
      deriveConnectionState({
        ...base,
        hasCachedData: true,
      }),
    ).toBe('idle')
  })
})

describe('connection banner copy', () => {
  it('uses delayed cold-start messaging', () => {
    expect(getConnectionBannerContent('cached_refreshing')?.message).toBe(
      'Checking for updates...',
    )
    expect(getConnectionBannerContent('cached_waking')?.message).toBe(
      'Server may be waking up...',
    )
    expect(getConnectionBannerContent('cached_refresh_failed')?.showRetry).toBe(true)
    expect(getConnectionBannerContent('reconnecting')?.message).toContain('Back online')
  })

  it('returns no banner for idle recovery', () => {
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
