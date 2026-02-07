import { useMemo, useCallback } from 'react'
import { Routes, Route, useSearchParams } from 'react-router-dom'
import { useMistakes, aggregateByPlayer, calculateTotalStats, type FilterTab, ThemeProvider } from './hooks'
import {
  LoadingSpinner,
  ErrorMessage,
  AuthRequired,
  Header,
  StatsSummary,
  Leaderboard,
  Footer,
} from './components'
import { ErrorBoundary } from './components/ErrorBoundary'
import { PlayerProfile } from './components/PlayerProfile'
import { getAccessToken } from './utils/token'

function isValidTab(value: string | null): value is FilterTab {
  if (!value) return false
  return value === 'all' || value === 'death' || value === 'yeet'
}

/**
 * Leaderboard page with URL-synced tab state.
 */
function LeaderboardPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const tabParam = searchParams.get('tab')
  const activeTab: FilterTab = isValidTab(tabParam) ? tabParam : 'all'

  const handleTabChange = useCallback((tab: FilterTab) => {
    if (tab === 'all') {
      setSearchParams({}, { replace: true })
      return
    }
    setSearchParams({ tab }, { replace: true })
  }, [setSearchParams])

  // Fetch data with TanStack Query
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

  if (isLoading) return <LoadingSpinner />
  if (needsAuth && !hasToken) return <AuthRequired />
  if (error && mistakes.length === 0) return <ErrorMessage message={error.message} />

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Header />
        <StatsSummary {...totalStats} />
        <Leaderboard
          leaderboard={leaderboard}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
        <Footer />
      </div>
    </div>
  )
}

/**
 * Main application component with routing, error boundary, and theme.
 */
export function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<LeaderboardPage />} />
          <Route path="/player/:name" element={<PlayerProfile />} />
        </Routes>
      </ErrorBoundary>
    </ThemeProvider>
  )
}
