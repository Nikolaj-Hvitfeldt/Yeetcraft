import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useOnlineStatus } from '../hooks/online-status-context'
import { useQueryRestorePending } from '../hooks/query-restore-context'
import { useConnectionTimingSignals } from '../hooks/usePageConnectionState'
import { useFailedOutboxWrites } from '../hooks/useWriteOutboxStatus'
import {
  ConnectionStatusContext,
  ConnectionStatusRegistrarContext,
  usePageConnectionRegistrar,
  type PageConnectionRegistration,
} from '../hooks/connection-status-context'
import { getPageConnectionResults } from '../lib/page-connection'
import { retryOutboxSync } from '../lib/write-outbox/sync'

const DEFAULT_PAGE_INPUT: PageConnectionRegistration = {
  hasCachedData: false,
  isFetching: false,
  isPending: false,
  isError: false,
}

export function ConnectionStatusProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [pageInput, setPageInput] = useState<PageConnectionRegistration | null>(null)
  const registerPageConnection = usePageConnectionRegistrar(setPageInput)
  const failedWrites = useFailedOutboxWrites()
  const isOnline = useOnlineStatus()
  const isRestorePending = useQueryRestorePending()
  const hasCachedData = pageInput?.hasCachedData ?? DEFAULT_PAGE_INPUT.hasCachedData
  const isFetching = pageInput?.isFetching ?? DEFAULT_PAGE_INPUT.isFetching
  const isPending = pageInput?.isPending ?? DEFAULT_PAGE_INPUT.isPending
  const isError = pageInput?.isError ?? DEFAULT_PAGE_INPUT.isError
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
      isOnline,
      isRestorePending,
      slowFetch,
      justReconnected,
    ],
  )

  const handleOutboxRetry = useCallback(() => {
    void retryOutboxSync(queryClient)
  }, [queryClient])

  const bannerContent = useMemo(() => {
    if (failedWrites.length > 0) {
      return {
        message: "Couldn't sync changes",
        showRetry: true,
      }
    }

    return pageResults.bannerContent
  }, [failedWrites.length, pageResults.bannerContent])

  const onRetry = useMemo(() => {
    if (failedWrites.length > 0) {
      return handleOutboxRetry
    }

    return pageInput?.onRetry
  }, [failedWrites.length, handleOutboxRetry, pageInput?.onRetry])

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
        {children}
      </ConnectionStatusRegistrarContext.Provider>
    </ConnectionStatusContext.Provider>
  )
}
