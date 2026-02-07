import { useMemo, useCallback } from 'react'
import { Routes, Route, useSearchParams } from 'react-router-dom'
import { useMistakes, useLeaderboard, aggregateByPlayer, aggregateByCharacter, calculateTotalStats, type FilterTab, type LeaderboardBy, ThemeProvider } from './hooks'
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

function isValidLeaderboardBy(value: string | null): value is LeaderboardBy {
  return value === 'player' || value === 'character'
}

/**
 * Leaderboard page with URL-synced tab and leaderboard-by state.
 */
function LeaderboardPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const tabParam = searchParams.get('tab')
  const activeTab: FilterTab = isValidTab(tabParam) ? tabParam : 'all'
  const leaderboardByParam = searchParams.get('leaderboard')
  const leaderboardBy: LeaderboardBy = isValidLeaderboardBy(leaderboardByParam) ? leaderboardByParam : 'player'

  const handleTabChange = useCallback((tab: FilterTab) => {
    if (tab === 'all') {
      setSearchParams((p) => {
        const next = new URLSearchParams(p)
        next.delete('tab')
        return next
      }, { replace: true })
      return
    }
    setSearchParams((p) => {
      const next = new URLSearchParams(p)
      next.set('tab', tab)
      return next
    }, { replace: true })
  }, [setSearchParams])

  const handleLeaderboardByChange = useCallback((by: LeaderboardBy) => {
    setSearchParams((p) => {
      const next = new URLSearchParams(p)
      if (by === 'player') next.delete('leaderboard')
      else next.set('leaderboard', by)
      return next
    }, { replace: true })
  }, [setSearchParams])

  const { data: mistakes = [], isLoading, error } = useMistakes()
  const { data: leaderboardFromApi } = useLeaderboard(leaderboardBy)

  const fallbackLeaderboard = useMemo(
    () => leaderboardBy === 'player'
      ? aggregateByPlayer(mistakes, activeTab)
      : aggregateByCharacter(mistakes, activeTab),
    [leaderboardBy, mistakes, activeTab]
  )
  const leaderboard = leaderboardFromApi ?? fallbackLeaderboard
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
          leaderboardBy={leaderboardBy}
          onLeaderboardByChange={handleLeaderboardByChange}
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
