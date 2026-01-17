import { useState, useEffect } from 'react'
import { fetchHealth, fetchMistakes } from './api/api'
import { HealthResponse, MistakeDto } from './api/types'
import './styles/App.css'

/**
 * Main application component.
 * 
 * Architecture notes:
 * - Simple component structure
 * - API calls handled in separate api module
 * - TypeScript types mirror backend DTOs
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

  if (loading) {
    return (
      <div className="app">
        <div className="container">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app">
        <div className="container">
          <div className="error">Error: {error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="container">
        <header>
          <h1>Yeetcraft</h1>
          <p className="subtitle">Tracking WoW dungeon mistakes since forever</p>
          {health && (
            <div className="health-status">
              Status: <span className={health.status === 'ok' ? 'status-ok' : 'status-error'}>
                {health.status}
              </span>
            </div>
          )}
        </header>

        <main>
          <section className="mistakes-section">
            <h2>Recent Mistakes</h2>
            {mistakes.length === 0 ? (
              <p className="empty-state">No mistakes recorded yet.</p>
            ) : (
              <div className="mistakes-list">
                {mistakes.map((mistake) => (
                  <div key={mistake.id} className="mistake-card">
                    <div className="mistake-header">
                      <span className="player-name">{mistake.playerName}</span>
                      <span className={`mistake-type type-${mistake.type}`}>
                        {mistake.type.toUpperCase()}
                      </span>
                    </div>
                    <div className="mistake-dungeon">{mistake.dungeon}</div>
                    <div className="mistake-description">{mistake.description}</div>
                    <div className="mistake-timestamp">
                      {new Date(mistake.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
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
