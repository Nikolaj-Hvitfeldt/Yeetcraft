/**
 * Loading spinner.
 */
export function LoadingSpinner({ message = 'Loading the Hall of Shame...' }: LoadingSpinnerProps) {
  return (
    <main
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="min-h-screen flex items-center justify-center"
    >
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-border-subtle border-t-accent-primary" />
        <p className="text-text-secondary font-heading">{message}</p>
      </div>
    </main>
  )
}

interface LoadingSpinnerProps {
  message?: string
}
