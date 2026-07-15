import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useOnlineStatus } from '../hooks/online-status-context'
import { useQueryRestorePending } from '../hooks/query-restore-context'
import { useConnectionTimingSignals } from '../hooks/usePageConnectionState'
import { useFailedOutboxWrites } from '../hooks/useWriteOutboxStatus'
import { useWriteAccess } from '../hooks/useWriteAccess'
import {
  ConnectionRefreshRegistrarContext,
  ConnectionStatusContext,
  ConnectionStatusRegistrarContext,
  usePageConnectionRegistrar,
  type PageConnectionRegistration,
} from '../hooks/connection-status-context'
import { isBackgroundRefreshConnectionState } from '../lib/connection-state'
import { getPageConnectionResults } from '../lib/page-connection'
import { retryOutboxSync } from '../lib/write-outbox/sync'
import type { PendingWrite } from '../lib/write-outbox/types'

function getGlobalFailedOutboxWrites(
  failedWrites: readonly PendingWrite[],
  localOutboxScope?: { playerId: string; seasonId: string },
): readonly PendingWrite[] {
  if (!localOutboxScope) return failedWrites

  return failedWrites.filter((write) => {
    if (write.type !== 'set-player-stats') return true

    return !(
      write.payload.playerId === localOutboxScope.playerId &&
      write.payload.seasonId === localOutboxScope.seasonId
    )
  })
}

const DEFAULT_PAGE_INPUT: PageConnectionRegistration = {
  hasCachedData: false,
  isFetching: false,
  isPending: false,
  isError: false,
}

export function ConnectionStatusProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [pageInput, setPageInput] = useState<PageConnectionRegistration | null>(null)
  const [isPageRefreshing, setIsPageRefreshing] = useState(false)
  const registerPageConnection = usePageConnectionRegistrar(setPageInput)
  const registerPageRefresh = useCallback((isRefreshing: boolean) => {
    setIsPageRefreshing(isRefreshing)
  }, [])
  const failedWrites = useFailedOutboxWrites()
  const canWrite = useWriteAccess()
  const isOnline = useOnlineStatus()
  const isRestorePending = useQueryRestorePending()
  const hasCachedData = pageInput?.hasCachedData ?? DEFAULT_PAGE_INPUT.hasCachedData
  const isFetching = pageInput?.isFetching ?? DEFAULT_PAGE_INPUT.isFetching
  const isPending = pageInput?.isPending ?? DEFAULT_PAGE_INPUT.isPending
  const isError = pageInput?.isError ?? DEFAULT_PAGE_INPUT.isError
  const hasRecoverableError = pageInput?.hasRecoverableError ?? false
  const localOutboxScope = pageInput?.localOutboxScope
  const isFetchActive = isFetching || isPending

  const { slowFetch, justReconnected } = useConnectionTimingSignals(isOnline, isFetchActive)

  const pageResults = useMemo(
    () =>
      getPageConnectionResults(
        {
          hasCachedData,
          isFetching,
          isPending,
          isError,
          hasRecoverableError,
        },
        {
          isOnline,
          isRestorePending,
          slowFetch,
          justReconnected,
        },
      ),
    [
      hasCachedData,
      isFetching,
      isPending,
      isError,
      hasRecoverableError,
      isOnline,
      isRestorePending,
      slowFetch,
      justReconnected,
    ],
  )

  const handleOutboxRetry = useCallback(() => {
    void retryOutboxSync(queryClient)
  }, [queryClient])

  const globalFailedWrites = useMemo(
    () => (canWrite ? getGlobalFailedOutboxWrites(failedWrites, localOutboxScope) : []),
    [canWrite, failedWrites, localOutboxScope],
  )

  const bannerContent = useMemo(() => {
    if (globalFailedWrites.length > 0) {
      return {
        message: "Couldn't sync changes",
        showRetry: true,
      }
    }

    if (
      isPageRefreshing &&
      isBackgroundRefreshConnectionState(pageResults.connectionState)
    ) {
      return null
    }

    return pageResults.bannerContent
  }, [
    globalFailedWrites.length,
    isPageRefreshing,
    pageResults.bannerContent,
    pageResults.connectionState,
  ])

  const onRetry = useMemo(() => {
    if (globalFailedWrites.length > 0) {
      return handleOutboxRetry
    }

    return pageInput?.onRetry
  }, [globalFailedWrites.length, handleOutboxRetry, pageInput?.onRetry])

  const contextValue = useMemo(
    () => ({
      bannerContent,
      onRetry,
      loadingMessage: pageResults.loadingMessage,
      showOfflineNoCache: pageResults.showOfflineNoCache,
    }),
    [bannerContent, onRetry, pageResults.loadingMessage, pageResults.showOfflineNoCache],
  )

  return (
    <ConnectionStatusContext.Provider value={contextValue}>
      <ConnectionStatusRegistrarContext.Provider value={registerPageConnection}>
        <ConnectionRefreshRegistrarContext.Provider value={registerPageRefresh}>
          {children}
        </ConnectionRefreshRegistrarContext.Provider>
      </ConnectionStatusRegistrarContext.Provider>
    </ConnectionStatusContext.Provider>
  )
}
