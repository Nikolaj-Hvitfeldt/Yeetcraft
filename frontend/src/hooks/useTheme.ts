import { createContext, useContext, useState, useEffect, useCallback, createElement, type FC, type ReactNode } from 'react'

export type Theme = 'warcraft' | 'midnight'

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const STORAGE_KEY = 'yeetcraft-theme'
const DEFAULT_THEME: Theme = 'warcraft'

export const ThemeContext = createContext<ThemeContextValue | null>(null)

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return DEFAULT_THEME
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'warcraft' || stored === 'midnight') return stored
  return DEFAULT_THEME
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme)
}

export const ThemeProvider: FC<{ children: ReactNode }> = ({ children }) => {
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
