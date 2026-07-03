import { ThemeSwitcher } from './ThemeSwitcher'

/**
 * Page header with title, subtitle, and theme switcher.
 */
export function Header() {
  return (
    <header className="text-center mb-8 animate-fade-in">
      <div className="flex justify-end mb-4">
        <ThemeSwitcher />
      </div>
      <h1 className="text-5xl md:text-6xl mb-2 tracking-wider">Yeetcraft</h1>
      <p className="mb-6 text-lg text-text-secondary font-body">
        Hall of Shame
      </p>
    </header>
  )
}
