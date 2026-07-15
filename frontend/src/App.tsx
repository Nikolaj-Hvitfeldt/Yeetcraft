import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './hooks'
import { ErrorBoundary } from './components/ErrorBoundary'
import { LoadingSpinner } from './components/LoadingSpinner'
import { AppLayout } from './components/layout/AppLayout'
import { HomePage } from './components/home'
import { RootRedirect } from './components/routing/RootRedirect'
import { ScrollToTop } from './components/routing/ScrollToTop'
import { AppUpdatePrompt } from './components/AppUpdatePrompt'

const PlayerProfile = lazy(() =>
  import('./components/profile').then((module) => ({ default: module.PlayerProfile })),
)
const DungeonDetail = lazy(() =>
  import('./components/dungeon').then((module) => ({ default: module.DungeonDetail })),
)

function RouteFallback() {
  return <LoadingSpinner />
}

/**
 * Main application component with routing, error boundary, and theme.
 */
export function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <ScrollToTop />
        <AppUpdatePrompt />
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<RootRedirect />} />
            <Route
              path="/:seasonSlug/player/:playerSlug"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <PlayerProfile />
                </Suspense>
              }
            />
            <Route
              path="/:seasonSlug/dungeon/:dungeonSlug"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <DungeonDetail />
                </Suspense>
              }
            />
            <Route path="/:seasonSlug" element={<HomePage />} />
          </Route>
        </Routes>
      </ErrorBoundary>
    </ThemeProvider>
  )
}
