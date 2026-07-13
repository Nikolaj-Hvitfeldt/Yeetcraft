import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './hooks'
import { ErrorBoundary } from './components/ErrorBoundary'
import { AppLayout } from './components/layout/AppLayout'
import { DungeonDetail } from './components/dungeon'
import { PlayerProfile } from './components/profile'
import { HomePage } from './components/home'
import { RootRedirect } from './components/routing/RootRedirect'
import { ScrollToTop } from './components/routing/ScrollToTop'

/**
 * Main application component with routing, error boundary, and theme.
 */
export function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <ScrollToTop />
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/:seasonSlug/player/:playerSlug" element={<PlayerProfile />} />
            <Route path="/:seasonSlug/dungeon/:dungeonSlug" element={<DungeonDetail />} />
            <Route path="/:seasonSlug" element={<HomePage />} />
          </Route>
        </Routes>
      </ErrorBoundary>
    </ThemeProvider>
  )
}
