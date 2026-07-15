import { useConnectionStatusBanner } from '../hooks/connection-status-context'

export function ConnectionStatusBanner() {
  const { bannerContent, onRetry } = useConnectionStatusBanner()

  if (!bannerContent) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed left-1/2 top-3 z-50 -translate-x-1/2 rounded-full border border-border-subtle bg-surface-secondary/95 px-md py-xs text-xs font-semibold text-text-secondary shadow-lg backdrop-blur-sm"
    >
      <span>{bannerContent.message}</span>
      {bannerContent.showRetry && onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="ml-sm text-accent-primary underline-offset-2 hover:underline"
        >
          Try again
        </button>
      ) : null}
    </div>
  )
}
