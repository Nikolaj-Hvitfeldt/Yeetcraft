import { useTheme } from '../hooks'
import type { Theme } from '../hooks'

const THEMES = [
  { key: 'daytime' as const, label: 'daytime' },
  { key: 'midnight' as const, label: 'midnight' },
] as const

const ACTIVE_THEME_STYLES: Record<Theme, string> = {
  daytime:
    'bg-accent-secondary text-background-app shadow-[0_10px_7.5px_rgba(254,154,0,0.2),0_4px_3px_rgba(254,154,0,0.2)]',
  midnight:
    'bg-accent-secondary text-background-app shadow-[0_10px_7.5px_rgba(0,211,243,0.28),0_4px_3px_rgba(194,122,255,0.2)]',
}

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="inline-flex items-start rounded-pill border border-border-subtle bg-overlay-dark p-xs shadow-[0_20px_25px_rgba(0,0,0,0.2),0_8px_10px_rgba(0,0,0,0.2)]"
    >
      {THEMES.map((t) => {
        const isActive = theme === t.key

        return (
          <button
            key={t.key}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => setTheme(t.key)}
            className={`min-h-9 rounded-pill px-lg py-0 text-xs font-bold leading-4 transition-all duration-200 ${
              isActive ? ACTIVE_THEME_STYLES[t.key] : 'text-text-secondary'
            }`}
          >
            {t.label}
          </button>
        )
      })}
    </div>
  )
}
