interface LoadingSpinnerProps {
  message?: string
}

/**
 * Warcraft-themed loading spinner.
 */
export function LoadingSpinner({ message = 'Loading the Hall of Shame...' }: LoadingSpinnerProps) {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="wc-spinner mx-auto mb-4" />
        <p className="text-warcraft-text-muted font-warcraft">{message}</p>
      </div>
    </main>
  )
}
