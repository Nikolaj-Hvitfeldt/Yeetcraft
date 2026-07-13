import type { ReactNode } from 'react'
import { AuthRequired } from '../AuthRequired'
import { ErrorMessage } from '../ErrorMessage'
import { LoadingSpinner } from '../LoadingSpinner'
import { useAuthGuard } from '../../hooks/useAuthGuard'
import { getUserFacingErrorMessage, isRetryableError } from '../../utils/api-error'
import { cn } from '../../utils/cn'

export function PageShell({
  isLoading,
  isRefreshing,
  isShowingStaleData,
  error,
  notFoundMessage,
  onRetry,
  children,
}: PageShellProps) {
  const { showAuthRequired } = useAuthGuard(error ?? null)
  const blockingError = error && !children ? error : null

  if (isLoading) return <LoadingSpinner />
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
      {isShowingStaleData ? (
        <div
          role="status"
          className="fixed left-1/2 top-3 z-50 -translate-x-1/2 rounded-full border border-border-subtle bg-surface-section/95 px-md py-xs text-xs font-semibold text-text-secondary shadow-lg backdrop-blur-sm"
        >
          Updating...
        </div>
      ) : null}
      <div
        className={cn(
          isRefreshing && 'transition-opacity duration-200',
          isRefreshing && 'opacity-80',
        )}
      >
        {children}
      </div>
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

interface PageShellProps {
  isLoading?: boolean
  isRefreshing?: boolean
  isShowingStaleData?: boolean
  error?: Error | null
  notFoundMessage?: string | null
  onRetry?: () => void
  children?: ReactNode
}
