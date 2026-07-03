import { useTheme } from '../hooks'

const THEMES = [
  { key: 'daytime' as const, label: 'Daytime' },
  { key: 'midnight' as const, label: 'Midnight' },
]

/**
 * Small theme toggle in the header.
 * Switches between Daytime (gold) and Midnight (blue) themes.
 */
export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="inline-flex items-center gap-1 rounded-full border p-0.5"
      style={{ borderColor: 'var(--color-border-subtle)' }}
    >
      {THEMES.map((t) => (
        <button
          key={t.key}
          type="button"
          role="radio"
          aria-checked={theme === t.key}
          onClick={() => setTheme(t.key)}
          className={`px-3 py-1 text-xs font-heading uppercase tracking-wider rounded-full transition-all duration-200 ${
            theme === t.key
              ? 'text-white'
              : ''
          }`}
          style={{
            backgroundColor: theme === t.key ? 'var(--color-accent-secondary)' : 'transparent',
            color: theme === t.key ? 'var(--color-background-app)' : 'var(--color-text-secondary)',
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
