import { createContext, useContext, useState, useEffect, useCallback, createElement, type ReactNode } from 'react'
import { themeBackgroundImages } from '../assets/background-themes'
import { applyColorTheme, applyGlobalTheme, type ThemeName } from '../themes'

export type Theme = ThemeName

const STORAGE_KEY = 'yeetcraft-theme'
const DEFAULT_THEME: Theme = 'daytime'

export const ThemeContext = createContext<ThemeContextValue | null>(null)

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return DEFAULT_THEME
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'daytime' || stored === 'midnight') return stored
  return DEFAULT_THEME
}

function applyThemeBackgroundImage(theme: Theme) {
  document.documentElement.style.setProperty(
    '--background-theme-image',
    `url("${themeBackgroundImages[theme]}")`,
  )
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme)
  applyGlobalTheme()
  applyColorTheme(theme)
  applyThemeBackgroundImage(theme)
}

if (typeof window !== 'undefined') {
  applyTheme(getInitialTheme())
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t)
    localStorage.setItem(STORAGE_KEY, t)
    applyTheme(t)
  }, [])

  return createElement(ThemeContext.Provider, { value: { theme, setTheme } }, children)
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within a ThemeContext.Provider')
  return ctx
}

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
}
