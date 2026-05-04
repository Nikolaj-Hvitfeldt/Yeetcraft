import { useParams, Link } from 'react-router-dom'

/**
 * Placeholder player profile page.
 * TODO: Build full profile with player statistics.
 */
export function PlayerProfile() {
  const { name } = useParams<{ name: string }>()

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/"
          className="inline-block mb-6 text-warcraft-text-muted hover:text-warcraft-gold transition-colors font-warcraft text-sm uppercase tracking-wider"
        >
          &larr; Back to Leaderboard
        </Link>
        <div className="wc-panel-gold p-8 text-center">
          <h1 className="text-4xl mb-4">{decodeURIComponent(name || '')}</h1>
          <p className="text-warcraft-text-muted text-lg">
            Player profile &mdash; coming soon
          </p>
        </div>
      </div>
    </div>
  )
}
