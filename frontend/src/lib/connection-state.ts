export type ConnectionState =
  | 'restoring'
  | 'first_load'
  | 'first_load_slow'
  | 'cached_refreshing'
  | 'cached_waking'
  | 'cached_refresh_failed'
  | 'offline_cached'
  | 'offline_no_cache'
  | 'idle'

export type ConnectionStateInput = {
  isOnline: boolean
  isRestorePending: boolean
  hasCachedData: boolean
  isFetching: boolean
  isPending: boolean
  isError: boolean
  slowFetch: boolean
}

export type ConnectionBannerContent = {
  message: string
  showRetry: boolean
}

export function deriveConnectionState(input: ConnectionStateInput): ConnectionState {
  if (input.isRestorePending) return 'restoring'

  if (!input.isOnline) {
    return input.hasCachedData ? 'offline_cached' : 'offline_no_cache'
  }

  if (!input.hasCachedData) {
    if (input.isPending || input.isFetching) {
      return input.slowFetch ? 'first_load_slow' : 'first_load'
    }
    return 'first_load'
  }

  if (input.isError && !input.isFetching && !input.isPending) {
    return 'cached_refresh_failed'
  }

  if (input.isFetching || input.isPending) {
    return input.slowFetch ? 'cached_waking' : 'cached_refreshing'
  }

  return 'idle'
}

export function getConnectionBannerContent(
  state: ConnectionState,
): ConnectionBannerContent | null {
  switch (state) {
    case 'restoring':
      return { message: 'Restoring saved data...', showRetry: false }
    case 'cached_refreshing':
      return {
        message: 'Showing saved data — checking for updates...',
        showRetry: false,
      }
    case 'cached_waking':
      return { message: 'Server is waking up...', showRetry: false }
    case 'cached_refresh_failed':
      return {
        message: "Couldn't refresh — showing saved data.",
        showRetry: true,
      }
    case 'offline_cached':
      return { message: 'Offline — showing saved data.', showRetry: false }
    case 'first_load':
    case 'first_load_slow':
    case 'offline_no_cache':
    case 'idle':
      return null
  }
}

export function getPageLoadingMessage(state: ConnectionState): string | undefined {
  if (state === 'first_load_slow') {
    return 'Starting the YeetCraft server...'
  }
  return undefined
}

export function shouldShowOfflineNoCache(state: ConnectionState): boolean {
  return state === 'offline_no_cache'
}
