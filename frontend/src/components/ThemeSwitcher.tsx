import { useTheme } from '../hooks'

const THEMES = [
  { key: 'warcraft' as const, label: 'Daytime' },
  { key: 'midnight' as const, label: 'Midnight' },
]

/**
 * Small theme toggle in the header.
 * Switches between Warcraft (brown/gold) and Midnight (blue/void) themes.
 */
export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="inline-flex items-center gap-1 rounded-full border p-0.5"
      style={{ borderColor: 'var(--theme-border)' }}
    >
      {THEMES.map((t) => (
        <button
          key={t.key}
          onClick={() => setTheme(t.key)}
          className={`px-3 py-1 text-xs font-warcraft uppercase tracking-wider rounded-full transition-all duration-200 ${
            theme === t.key
              ? 'text-white'
              : ''
          }`}
          style={{
            backgroundColor: theme === t.key ? 'var(--theme-accent-dark)' : 'transparent',
            color: theme === t.key ? 'var(--theme-bg)' : 'var(--theme-text-muted)',
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
