import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './hooks'
import { ErrorBoundary } from './components/ErrorBoundary'
import { DungeonDetail } from './components/dungeon'
import { PlayerProfile } from './components/PlayerProfile'
import { HomePage } from './components/home'

/**
 * Main application component with routing, error boundary, and theme.
 */
export function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/player/:playerId" element={<PlayerProfile />} />
          <Route path="/dungeon/:dungeonId" element={<DungeonDetail />} />
        </Routes>
      </ErrorBoundary>
    </ThemeProvider>
  )
}
