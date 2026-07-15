import { describe, expect, it } from 'vitest'
import { getPageConnectionResults } from './page-connection'

describe('getPageConnectionResults', () => {
  it('derives offline cached state from shared inputs', () => {
    const results = getPageConnectionResults(
      {
        hasCachedData: true,
        isFetching: false,
        isPending: false,
        isError: false,
      },
      {
        isOnline: false,
        isRestorePending: false,
        slowFetch: false,
        justReconnected: false,
      },
    )

    expect(results.bannerContent).toEqual({
      message: 'Offline — showing saved data.',
      showRetry: false,
    })
    expect(results.showOfflineNoCache).toBe(false)
  })

  it('derives cold-start messaging when fetch is slow', () => {
    const results = getPageConnectionResults(
      {
        hasCachedData: true,
        isFetching: true,
        isPending: false,
        isError: false,
      },
      {
        isOnline: true,
        isRestorePending: false,
        slowFetch: true,
        justReconnected: false,
      },
    )

    expect(results.bannerContent).toEqual({
      message: 'Server may be waking up...',
      showRetry: false,
    })
    expect(results.loadingMessage).toBeUndefined()
  })
})
