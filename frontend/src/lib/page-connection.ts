import {
  deriveConnectionState,
  getConnectionBannerContent,
  getPageLoadingMessage,
  shouldShowOfflineNoCache,
} from './connection-state'
import type { PageConnectionInput } from '../hooks/usePageConnectionState'

type PageConnectionSignals = {
  isOnline: boolean
  isRestorePending: boolean
  slowFetch: boolean
  justReconnected: boolean
}

export function getPageConnectionResults(
  input: PageConnectionInput,
  signals: PageConnectionSignals,
) {
  const connectionState = deriveConnectionState({
    isOnline: signals.isOnline,
    isRestorePending: signals.isRestorePending,
    hasCachedData: input.hasCachedData,
    isFetching: input.isFetching,
    isPending: input.isPending,
    isError: input.isError,
    hasRecoverableError: input.hasRecoverableError ?? false,
    slowFetch: signals.slowFetch,
    justReconnected: signals.justReconnected,
  })

  return {
    loadingMessage: getPageLoadingMessage(connectionState),
    showOfflineNoCache: shouldShowOfflineNoCache(connectionState),
    bannerContent: getConnectionBannerContent(connectionState),
  }
}
