import { HealthResponse } from '../api/types'
import { ThemeSwitcher } from './ThemeSwitcher'

interface HeaderProps {
  health: HealthResponse | undefined
}

/**
 * Page header with title, subtitle, and theme switcher.
 */
export function Header({ health: _health }: HeaderProps) {
  void _health
  return (
    <header className="text-center mb-8 animate-fade-in">
      <div className="flex justify-end mb-4">
        <ThemeSwitcher />
      </div>
      <h1 className="text-5xl md:text-6xl mb-2 tracking-wider">Yeetcraft</h1>
      <p className="text-warcraft-text-muted text-lg font-body mb-6">
        Hall of Shame
      </p>
    </header>
  )
}
