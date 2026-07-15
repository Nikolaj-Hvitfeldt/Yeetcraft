import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
  type Dispatch,
  type SetStateAction,
} from 'react'
import type { LocalOutboxScope, PageConnectionInput } from './usePageConnectionState'
import type { getConnectionBannerContent } from '../lib/connection-state'

export type PageConnectionRegistration = PageConnectionInput

type ConnectionStatusContextValue = {
  bannerContent: ReturnType<typeof getConnectionBannerContent>
  onRetry?: () => void
  loadingMessage: string | undefined
  showOfflineNoCache: boolean
}

const DEFAULT_CONNECTION_STATUS: ConnectionStatusContextValue = {
  bannerContent: null,
  loadingMessage: undefined,
  showOfflineNoCache: false,
}

export const ConnectionStatusContext = createContext<ConnectionStatusContextValue>(
  DEFAULT_CONNECTION_STATUS,
)

export const ConnectionStatusRegistrarContext = createContext<
  (input: PageConnectionRegistration | null) => void
>(() => {})

function isSameLocalOutboxScope(
  previous: LocalOutboxScope | undefined,
  next: LocalOutboxScope | undefined,
): boolean {
  if (previous === next) return true
  if (previous === undefined || next === undefined) return false
  return previous.playerId === next.playerId && previous.seasonId === next.seasonId
}

function isSamePageConnectionRegistration(
  previous: PageConnectionRegistration | null,
  next: PageConnectionRegistration | null,
): boolean {
  if (previous === next) return true
  if (previous === null || next === null) return false

  return (
    previous.hasCachedData === next.hasCachedData &&
    previous.isFetching === next.isFetching &&
    previous.isPending === next.isPending &&
    previous.isError === next.isError &&
    (previous.hasRecoverableError ?? false) === (next.hasRecoverableError ?? false) &&
    isSameLocalOutboxScope(previous.localOutboxScope, next.localOutboxScope) &&
    previous.onRetry === next.onRetry
  )
}

export function usePageConnectionRegistrar(
  setPageInput: Dispatch<SetStateAction<PageConnectionRegistration | null>>,
): (input: PageConnectionRegistration | null) => void {
  return useCallback((next: PageConnectionRegistration | null) => {
    setPageInput((previous) =>
      isSamePageConnectionRegistration(previous, next) ? previous : next,
    )
  }, [setPageInput])
}

export function useReportPageConnection(input: PageConnectionInput): void {
  const registerPageConnection = useContext(ConnectionStatusRegistrarContext)
  const onRetryRef = useRef(input.onRetry)
  onRetryRef.current = input.onRetry

  const stableOnRetry = useCallback(() => {
    onRetryRef.current?.()
  }, [])

  const hasOnRetry = Boolean(input.onRetry)
  const hasRecoverableError = input.hasRecoverableError ?? false
  const localOutboxPlayerId = input.localOutboxScope?.playerId
  const localOutboxSeasonId = input.localOutboxScope?.seasonId

  useLayoutEffect(() => {
    registerPageConnection({
      hasCachedData: input.hasCachedData,
      isFetching: input.isFetching,
      isPending: input.isPending,
      isError: input.isError,
      hasRecoverableError,
      localOutboxScope:
        localOutboxPlayerId && localOutboxSeasonId
          ? { playerId: localOutboxPlayerId, seasonId: localOutboxSeasonId }
          : undefined,
      onRetry: hasOnRetry ? stableOnRetry : undefined,
    })

    return () => registerPageConnection(null)
  }, [
    registerPageConnection,
    stableOnRetry,
    hasOnRetry,
    hasRecoverableError,
    localOutboxPlayerId,
    localOutboxSeasonId,
    input.hasCachedData,
    input.isFetching,
    input.isPending,
    input.isError,
  ])
}

export function useConnectionStatusBanner(): Pick<
  ConnectionStatusContextValue,
  'bannerContent' | 'onRetry'
> {
  const { bannerContent, onRetry } = useContext(ConnectionStatusContext)
  return { bannerContent, onRetry }
}

export function useConnectionPageState(): Pick<
  ConnectionStatusContextValue,
  'loadingMessage' | 'showOfflineNoCache'
> {
  const { loadingMessage, showOfflineNoCache } = useContext(ConnectionStatusContext)
  return { loadingMessage, showOfflineNoCache }
}
