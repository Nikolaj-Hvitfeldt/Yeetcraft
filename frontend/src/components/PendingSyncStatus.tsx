type PendingSyncStatusProps = {
  status: 'pending' | 'syncing' | 'failed'
  lastError?: string
  onRetry?: () => void
}

const STATUS_COPY = {
  pending: 'Saved locally — waiting to sync',
  syncing: 'Syncing saved changes…',
  failed: "Couldn't sync changes",
} as const

export function PendingSyncStatus({ status, lastError, onRetry }: PendingSyncStatusProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="inline-flex flex-wrap items-center gap-sm rounded-[12px] border border-amber-400/40 bg-amber-950/30 px-[10px] py-xs text-[11px] font-semibold text-amber-200"
    >
      <span>{STATUS_COPY[status]}</span>
      {status === 'failed' && lastError ? (
        <span className="font-normal text-amber-100/80">{lastError}</span>
      ) : null}
      {status === 'failed' && onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="text-accent-primary underline-offset-2 hover:underline"
        >
          Retry now
        </button>
      ) : null}
    </div>
  )
}
