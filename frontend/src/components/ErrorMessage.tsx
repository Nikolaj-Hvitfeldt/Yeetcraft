import { SkullIcon } from './SkullIcon'

export function ErrorMessage({
  title = 'Something Went Wrong',
  message,
  onRetry,
}: ErrorMessageProps) {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md rounded-md border border-stat-deaths bg-surface-base p-8 text-center animate-fade-in">
        <SkullIcon className="mx-auto mb-4 h-16 w-16 text-stat-deaths" />
        <h2 className="mb-4 text-2xl text-stat-deaths">{title}</h2>
        <p className="text-text-secondary">{message}</p>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="mt-lg rounded-[20px] border border-accent-primary px-xl py-sm text-sm font-semibold text-accent-primary transition-colors hover:bg-overlay-dark"
          >
            Try again
          </button>
        ) : null}
      </div>
    </main>
  )
}

interface ErrorMessageProps {
  title?: string
  message: string
  onRetry?: () => void
}
