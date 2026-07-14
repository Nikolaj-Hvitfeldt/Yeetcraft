import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { usePageConnectionState } from '../hooks/usePageConnectionState'
import { useFailedOutboxWrites } from '../hooks/useWriteOutboxStatus'
import {
  ConnectionStatusContext,
  ConnectionStatusRegistrarContext,
  type PageConnectionRegistration,
} from '../hooks/connection-status-context'
import { retryOutboxSync } from '../lib/write-outbox/sync'

export function ConnectionStatusProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [pageInput, setPageInput] = useState<PageConnectionRegistration | null>(null)
  const failedWrites = useFailedOutboxWrites()
  const { bannerContent: connectionBannerContent } = usePageConnectionState(
    pageInput ?? {
      hasCachedData: false,
      isFetching: false,
      isPending: false,
      isError: false,
    },
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

    return connectionBannerContent
  }, [connectionBannerContent, failedWrites.length])

  const onRetry = useMemo(() => {
    if (failedWrites.length > 0) {
      return handleOutboxRetry
    }

    return pageInput?.onRetry
  }, [failedWrites.length, handleOutboxRetry, pageInput?.onRetry])

  return (
    <ConnectionStatusContext.Provider
      value={{
        bannerContent,
        onRetry,
      }}
    >
      <ConnectionStatusRegistrarContext.Provider value={setPageInput}>
        {children}
      </ConnectionStatusRegistrarContext.Provider>
    </ConnectionStatusContext.Provider>
  )
}
