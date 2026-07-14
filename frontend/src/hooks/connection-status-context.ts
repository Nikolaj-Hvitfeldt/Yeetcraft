import { createContext, useContext, useLayoutEffect } from 'react'
import type { PageConnectionInput } from './usePageConnectionState'
import type { getConnectionBannerContent } from '../lib/connection-state'

export type PageConnectionRegistration = PageConnectionInput

type ConnectionStatusContextValue = {
  bannerContent: ReturnType<typeof getConnectionBannerContent>
  onRetry?: () => void
}

export const ConnectionStatusContext = createContext<ConnectionStatusContextValue>({
  bannerContent: null,
})

export const ConnectionStatusRegistrarContext = createContext<
  (input: PageConnectionRegistration | null) => void
>(() => {})

export function useReportPageConnection(input: PageConnectionInput): void {
  const setPageInput = useContext(ConnectionStatusRegistrarContext)

  useLayoutEffect(() => {
    setPageInput(input)
    return () => setPageInput(null)
    // Page components pass a fresh object each render; field deps are intentional.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    setPageInput,
    input.hasCachedData,
    input.isFetching,
    input.isPending,
    input.isError,
    input.onRetry,
  ])
}

export function useConnectionStatusBanner(): ConnectionStatusContextValue {
  return useContext(ConnectionStatusContext)
}
