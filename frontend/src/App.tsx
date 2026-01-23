import { useState, useMemo } from 'react'
import { useMistakes, useHealth, aggregateByPlayer, calculateTotalStats, FilterTab } from './hooks'
import {
  LoadingSpinner,
  ErrorMessage,
  AuthRequired,
  Header,
  StatsSummary,
  Leaderboard,
  Footer,
} from './components'
import { getAccessToken } from './utils/token'

/**
 * Main application component.
 * Orchestrates data fetching and renders the leaderboard UI.
 */
function App() {
  const [activeTab, setActiveTab] = useState<FilterTab>('all')

  // Fetch data with TanStack Query
  const { data: health } = useHealth()
  const { data: mistakes = [], isLoading, error } = useMistakes()

  // Compute derived state
  const leaderboard = useMemo(
    () => aggregateByPlayer(mistakes, activeTab),
    [mistakes, activeTab]
  )
  const totalStats = useMemo(() => calculateTotalStats(mistakes), [mistakes])

  // Auth check
  const hasToken = getAccessToken()
  const needsAuth = error?.message?.includes('Unauthorized') || error?.message?.includes('token')

  // Loading state
  if (isLoading) {
    return <LoadingSpinner />
  }

  // Auth required state
  if (needsAuth && !hasToken) {
    return <AuthRequired />
  }

  // Error state (only if we have no data fallback)
  if (error && mistakes.length === 0) {
    return <ErrorMessage message={error.message} />
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Header health={health} />
        <StatsSummary {...totalStats} />
        <Leaderboard
          leaderboard={leaderboard}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <Footer />
      </div>
    </div>
  )
}

export default App
