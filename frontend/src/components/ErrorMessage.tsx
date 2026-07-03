import { SkullIcon } from './SkullIcon'

interface ErrorMessageProps {
  title?: string
  message: string
}

/**
 * Error display.
 */
export function ErrorMessage({ 
  title = 'Something Went Wrong', 
  message 
}: ErrorMessageProps) {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md rounded-md border border-stat-deaths bg-surface-base p-8 text-center animate-fade-in">
        <SkullIcon className="mx-auto mb-4 h-16 w-16 text-stat-deaths" />
        <h2 className="mb-4 text-2xl text-stat-deaths">{title}</h2>
        <p className="text-text-secondary">{message}</p>
      </div>
    </main>
  )
}
