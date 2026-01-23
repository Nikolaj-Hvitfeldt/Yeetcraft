import { SkullIcon } from './SkullIcon'

/**
 * Auth required message when token is missing.
 */
export function AuthRequired() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="wc-panel-gold p-8 max-w-md text-center animate-fade-in">
        <SkullIcon className="w-16 h-16 mx-auto mb-4 text-mistake-wipe" />
        <h2 className="text-2xl mb-4">Access Required</h2>
        <p className="text-warcraft-text-muted mb-4">
          The Hall of Shame is protected. Please use the shared link with your access token.
        </p>
        <p className="text-sm text-warcraft-text-dark">
          Your link should include <code>?token=...</code>
        </p>
      </div>
    </main>
  )
}
