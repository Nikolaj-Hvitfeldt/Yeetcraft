import type { ReactNode } from 'react'
import { AuthRequired } from '../AuthRequired'
import { ErrorMessage } from '../ErrorMessage'
import { LoadingSpinner } from '../LoadingSpinner'
import { OfflineNoCacheState } from '../OfflineNoCacheState'
import { useReportPageRefresh } from '../../hooks/connection-status-context'
import { useAuthGuard } from '../../hooks/useAuthGuard'
import { getUserFacingErrorMessage, isRetryableError } from '../../utils/api-error'

export function PageBoundary({
  isLoading,
  isRefreshing = false,
  error,
  notFoundMessage,
  onRetry,
  loadingMessage,
  showOfflineNoCache,
  children,
}: PageBoundaryProps) {
  useReportPageRefresh(Boolean(isRefreshing))
  const { showAuthRequired } = useAuthGuard(error ?? null)
  const blockingError = error && !children ? error : null

  if (showOfflineNoCache) return <OfflineNoCacheState />
  if (isLoading) return <LoadingSpinner message={loadingMessage} />
  if (showAuthRequired) return <AuthRequired />
  if (blockingError) {
    return (
      <ErrorMessage
        message={getUserFacingErrorMessage(blockingError)}
        onRetry={onRetry && isRetryableError(blockingError) ? onRetry : undefined}
      />
    )
  }
  if (notFoundMessage) {
    return <ErrorMessage title="Not Found" message={notFoundMessage} />
  }

  return (
    <>
      {isRefreshing ? <RefreshingBar /> : null}
      {children}
    </>
  )
}

function RefreshingBar() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden bg-border-subtle"
    >
      <div className="h-full w-1/3 animate-pulse bg-accent-primary" />
    </div>
  )
}

interface PageBoundaryProps {
  isLoading?: boolean
  isRefreshing?: boolean
  error?: Error | null
  notFoundMessage?: string | null
  onRetry?: () => void
  loadingMessage?: string
  showOfflineNoCache?: boolean
  children?: ReactNode
}
