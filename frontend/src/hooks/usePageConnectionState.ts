import { useEffect, useMemo, useRef, useState } from 'react'
import { useQueryRestorePending } from './query-restore-context'
import { useReportPageConnection } from './connection-status-context'
import {
  COLD_START_MESSAGE_DELAY_MS,
  deriveConnectionState,
  getConnectionBannerContent,
  getPageLoadingMessage,
  shouldShowOfflineNoCache,
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

function useJustReconnected(isOnline: boolean, isFetchActive: boolean): boolean {
  const wasOfflineRef = useRef(false)
  const [justReconnected, setJustReconnected] = useState(false)

  useEffect(() => {
    if (!isOnline) {
      wasOfflineRef.current = true
      setJustReconnected(false)
      return
    }

    if (wasOfflineRef.current) {
      wasOfflineRef.current = false
      setJustReconnected(true)
    }
  }, [isOnline])

  useEffect(() => {
    if (justReconnected && !isFetchActive) {
      setJustReconnected(false)
    }
  }, [justReconnected, isFetchActive])

  return justReconnected
}

function useSlowFetch(
  isActive: boolean,
  thresholdMs = COLD_START_MESSAGE_DELAY_MS,
): boolean {
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
  loadingMessage: string | undefined
  showOfflineNoCache: boolean
  bannerContent: ReturnType<typeof getConnectionBannerContent>
} {
  const isOnline = useOnlineStatus()
  const isRestorePending = useQueryRestorePending()
  const isFetchActive = input.isFetching || input.isPending
  const slowFetch = useSlowFetch(isFetchActive)
  const justReconnected = useJustReconnected(isOnline, isFetchActive)

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
        justReconnected,
      }),
    [
      isOnline,
      isRestorePending,
      input.hasCachedData,
      input.isFetching,
      input.isPending,
      input.isError,
      slowFetch,
      justReconnected,
    ],
  )

  return useMemo(
    () => ({
      loadingMessage: getPageLoadingMessage(connectionState),
      showOfflineNoCache: shouldShowOfflineNoCache(connectionState),
      bannerContent: getConnectionBannerContent(connectionState),
    }),
    [connectionState],
  )
}

export function usePageConnection(input: PageConnectionInput) {
  useReportPageConnection(input)
  return usePageConnectionState(input)
}
