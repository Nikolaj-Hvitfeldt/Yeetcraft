import { useState, useEffect } from 'react'
import { fetchHealth, fetchMistakes } from './api/api'
import { HealthResponse, MistakeDto } from './api/types'
import { getAccessToken } from './utils/token'

/**
 * Main application component.
 * 
 * Handles:
 * - Initial data fetching (health check and mistakes)
 * - Loading and error states
 * - URL-based token authentication
 * - Rendering mistake cards in a responsive grid
 */
function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [mistakes, setMistakes] = useState<MistakeDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Fetch health check and mistakes on mount
    Promise.all([
      fetchHealth(),
      fetchMistakes()
    ])
      .then(([healthData, mistakesData]) => {
        setHealth(healthData)
        setMistakes(mistakesData.mistakes)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch data')
        setLoading(false)
      })
  }, [])

  // Check if token is needed but missing (unauthorized error)
  const hasToken = getAccessToken()
  const needsAuth = error?.includes('Unauthorized') || error?.includes('token')

  if (loading) {
    return (
      <main className="min-h-screen bg-dark-bg p-8">
        <section className="max-w-7xl mx-auto">
          <p className="text-center text-gray-400 py-12">Loading...</p>
        </section>
      </main>
    )
  }

  if (needsAuth && !hasToken) {
    return (
      <main className="min-h-screen bg-dark-bg p-8">
        <section className="max-w-7xl mx-auto">
          <article className="bg-red-600 text-white p-6 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-2">Access Required</h2>
            <p className="mb-4">Please use the shared link with your access token.</p>
            <p className="text-sm text-red-100 mt-4">
              If you have the link, make sure it includes <code className="bg-red-700 px-2 py-1 rounded">?token=...</code>
            </p>
          </article>
        </section>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-dark-bg p-8">
        <section className="max-w-7xl mx-auto">
          <article className="bg-red-600 text-white p-4 rounded-lg text-center" role="alert">
            <strong>Error:</strong> {error}
          </article>
        </section>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-dark-bg p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12 pb-8 border-b-2 border-dark-border">
          <h1 className="text-4xl font-bold text-white mb-2">Yeetcraft</h1>
          <p className="text-gray-400 text-lg mb-4">
            Tracking WoW dungeon mistakes since forever
          </p>
          {health && (
            <aside className="inline-block px-4 py-2 bg-dark-surface rounded text-sm" aria-label="Server status">
              Status:{' '}
              <strong className={health.status === 'ok' ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'}>
                {health.status}
              </strong>
            </aside>
          )}
        </header>

        {/* Main Content */}
        <main className="mt-8">
          <section aria-labelledby="mistakes-heading">
            <h2 id="mistakes-heading" className="text-3xl font-bold text-white mb-6">Recent Mistakes</h2>
            {mistakes.length === 0 ? (
              <p className="text-center text-gray-400 py-12 bg-dark-surface rounded-lg" role="status">
                No mistakes recorded yet.
              </p>
            ) : (
              <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 list-none">
                {mistakes.map((mistake: MistakeDto) => (
                  <li key={mistake.id}>
                    <article className="bg-dark-surface border border-dark-border rounded-lg p-6 transition-colors hover:border-dark-border-hover">
                      {/* Mistake Header */}
                      <header className="flex justify-between items-center mb-3">
                        <h3 className="text-xl font-semibold text-white">
                          {mistake.playerName}
                        </h3>
                        <span
                          className={`mistake-badge mistake-badge-${mistake.type}`}
                          aria-label={`Mistake type: ${mistake.type}`}
                        >
                          {mistake.type.toUpperCase()}
                        </span>
                      </header>

                      {/* Dungeon */}
                      <p className="text-blue-400 font-medium mb-2">
                        <strong>Dungeon:</strong> {mistake.dungeon}
                      </p>

                      {/* Description */}
                      <p className="text-gray-300 mb-3 leading-relaxed">
                        {mistake.description}
                      </p>

                      {/* Timestamp */}
                      <time 
                        className="text-gray-500 text-sm" 
                        dateTime={new Date(mistake.timestamp).toISOString()}
                      >
                        {new Date(mistake.timestamp).toLocaleString()}
                      </time>
                    </article>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </main>

        {/* TODO: Add more sections as needed:
          - Player statistics
          - Dungeon leaderboard
          - Recent activity feed
        */}
      </div>
    </div>
  )
}

export default App
