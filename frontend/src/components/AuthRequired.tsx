import { SkullIcon } from './SkullIcon'

/**
 * Auth required message when token is missing.
 */
export function AuthRequired() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md rounded-md border border-border-subtle bg-surface-base p-8 text-center animate-fade-in">
        <SkullIcon className="mx-auto mb-4 h-16 w-16 text-stat-deaths" />
        <h2 className="text-2xl mb-4">Access Required</h2>
        <p className="mb-4 text-text-secondary">
          The Hall of Shame is protected. Please use the shared link with your access token.
        </p>
        <p className="text-sm text-text-tertiary">
          Your link should include <code>?token=...</code>
        </p>
      </div>
    </main>
  )
}
