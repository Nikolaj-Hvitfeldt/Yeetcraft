import { useEffect, useMemo, useState } from 'react'
import { useQueryRestorePending } from './query-restore-context'
import {
  deriveConnectionState,
  getConnectionBannerContent,
  getPageLoadingMessage,
  shouldShowOfflineNoCache,
  type ConnectionState,
} from '../lib/connection-state'

export type PageConnectionInput = {
  hasCachedData: boolean
  isFetching: boolean
  isPending: boolean
  isError: boolean
  onRetry?: () => void
}

export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(
    () => typeof navigator !== 'undefined' && navigator.onLine,
  )

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true)
    }

    function handleOffline() {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}

export function useSlowFetch(isActive: boolean, thresholdMs = 5000): boolean {
  const [isSlow, setIsSlow] = useState(false)

  useEffect(() => {
    if (!isActive) {
      setIsSlow(false)
      return
    }

    const timer = window.setTimeout(() => setIsSlow(true), thresholdMs)
    return () => window.clearTimeout(timer)
  }, [isActive, thresholdMs])

  return isSlow
}

export function usePageConnectionState(
  input: PageConnectionInput,
): {
  connectionState: ConnectionState
  loadingMessage: string | undefined
  showOfflineNoCache: boolean
  bannerContent: ReturnType<typeof getConnectionBannerContent>
} {
  const isOnline = useOnlineStatus()
  const isRestorePending = useQueryRestorePending()
  const isFetchActive = input.isFetching || input.isPending
  const slowFetch = useSlowFetch(isFetchActive)

  const connectionState = useMemo(
    () =>
      deriveConnectionState({
        isOnline,
        isRestorePending,
        hasCachedData: input.hasCachedData,
        isFetching: input.isFetching,
        isPending: input.isPending,
        isError: input.isError,
        slowFetch,
      }),
    [
      isOnline,
      isRestorePending,
      input.hasCachedData,
      input.isFetching,
      input.isPending,
      input.isError,
      slowFetch,
    ],
  )

  return useMemo(
    () => ({
      connectionState,
      loadingMessage: getPageLoadingMessage(connectionState),
      showOfflineNoCache: shouldShowOfflineNoCache(connectionState),
      bannerContent: getConnectionBannerContent(connectionState),
    }),
    [connectionState],
  )
}
