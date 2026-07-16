/**
 * Loading spinner.
 */
export function LoadingSpinner({ message = 'Loading the Hall of Shame...' }: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="min-h-screen flex items-center justify-center"
    >
      <div className="text-center">
        <SpinnerRing className="mx-auto mb-4 h-8 w-8" />
        <p className="text-text-secondary font-heading">{message}</p>
      </div>
    </div>
  )
}

export function InlineSpinner({ message }: InlineSpinnerProps) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className="flex flex-col items-center justify-center py-4xl text-center">
      <SpinnerRing className="mb-3 h-6 w-6" />
      {message ? <p className="text-sm text-text-secondary">{message}</p> : null}
    </div>
  )
}

function SpinnerRing({ className }: { className?: string }) {
  return (
    <div
      className={`animate-spin rounded-full border-2 border-border-subtle border-t-accent-primary ${className ?? ''}`}
    />
  )
}

interface LoadingSpinnerProps {
  message?: string
}

interface InlineSpinnerProps {
  message?: string
}
