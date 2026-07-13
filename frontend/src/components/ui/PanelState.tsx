import type { ReactNode } from 'react'
import { SkullIcon } from '../SkullIcon'
import { InlineSpinner } from '../LoadingSpinner'
import { getUserFacingErrorMessage, isRetryableError } from '../../utils/api-error'
import { cn } from '../../utils/cn'

export function PanelState({
  isLoading,
  isEmpty,
  error,
  onRetry,
  loadingMessage = 'Loading...',
  emptyMessage = 'Nothing to show yet.',
  refreshError,
  onRefreshRetry,
  className,
  children,
}: PanelStateProps) {
  if (isLoading) {
    return (
      <div className={className}>
        <InlineSpinner message={loadingMessage} />
      </div>
    )
  }

  if (error && !children) {
    return (
      <div className={cn('rounded-md border border-border-subtle bg-surface-base px-2xl py-4xl text-center', className)}>
        <SkullIcon className="mx-auto mb-md size-10 opacity-40 text-stat-deaths" />
        <p className="text-sm text-text-secondary">{getUserFacingErrorMessage(error)}</p>
        {onRetry && isRetryableError(error) ? (
          <button
            type="button"
            onClick={onRetry}
            className="mt-md rounded-[20px] border border-accent-primary px-lg py-sm text-xs font-semibold text-accent-primary transition-colors hover:bg-overlay-dark"
          >
            Try again
          </button>
        ) : null}
      </div>
    )
  }

  if (isEmpty && !children) {
    return (
      <div className={cn('rounded-md border border-border-subtle bg-surface-base px-2xl py-4xl text-center text-text-secondary', className)}>
        <SkullIcon className="mx-auto mb-md size-10 opacity-40" />
        <p className="text-sm">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={className}>
      {refreshError ? (
        <div
          role="alert"
          className="mb-md rounded-md border border-red-400/30 bg-red-950/20 px-md py-sm text-center text-xs text-red-300"
        >
          <p>{getUserFacingErrorMessage(refreshError)}</p>
          {onRefreshRetry && isRetryableError(refreshError) ? (
            <button
              type="button"
              onClick={onRefreshRetry}
              className="mt-xs font-semibold text-red-200 underline-offset-2 hover:underline"
            >
              Try again
            </button>
          ) : null}
        </div>
      ) : null}
      {children}
    </div>
  )
}

interface PanelStateProps {
  isLoading?: boolean
  isEmpty?: boolean
  error?: Error | null
  onRetry?: () => void
  loadingMessage?: string
  emptyMessage?: string
  refreshError?: Error | null
  onRefreshRetry?: () => void
  className?: string
  children?: ReactNode
}
