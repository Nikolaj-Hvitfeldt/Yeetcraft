import { useState, type ReactNode } from 'react'
import { usePageConnectionState } from '../hooks/usePageConnectionState'
import {
  ConnectionStatusContext,
  ConnectionStatusRegistrarContext,
  type PageConnectionRegistration,
} from '../hooks/connection-status-context'

export function ConnectionStatusProvider({ children }: { children: ReactNode }) {
  const [pageInput, setPageInput] = useState<PageConnectionRegistration | null>(null)
  const { bannerContent } = usePageConnectionState(
    pageInput ?? {
      hasCachedData: false,
      isFetching: false,
      isPending: false,
      isError: false,
    },
  )

  return (
    <ConnectionStatusContext.Provider
      value={{
        bannerContent,
        onRetry: pageInput?.onRetry,
      }}
    >
      <ConnectionStatusRegistrarContext.Provider value={setPageInput}>
        {children}
      </ConnectionStatusRegistrarContext.Provider>
    </ConnectionStatusContext.Provider>
  )
}
