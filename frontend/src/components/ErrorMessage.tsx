import { SkullIcon } from './SkullIcon'

interface ErrorMessageProps {
  title?: string
  message: string
}

/**
 * Warcraft-themed error display.
 */
export function ErrorMessage({ 
  title = 'Something Went Wrong', 
  message 
}: ErrorMessageProps) {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="wc-panel border-mistake-wipe p-8 max-w-md text-center animate-fade-in">
        <SkullIcon className="w-16 h-16 mx-auto mb-4 text-mistake-wipe" />
        <h2 className="text-2xl text-mistake-wipe mb-4">{title}</h2>
        <p className="text-warcraft-text-muted">{message}</p>
      </div>
    </main>
  )
}
