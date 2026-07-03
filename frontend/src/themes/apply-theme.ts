import { colorThemes, sharedColors, type ThemeName } from './colors'
import { fonts } from './fonts'
import { radius } from './radius'
import { space } from './space'
import { text } from './text'

type TokenValue = string | number
type TokenTree = {
  readonly [key: string]: TokenValue | TokenTree
}

function toKebabCase(value: string): string {
  return value.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)
}

function flattenTokens(tokens: TokenTree, prefix: string[] = []): Record<string, string> {
  return Object.entries(tokens).reduce<Record<string, string>>((vars, [key, value]) => {
    const path = [...prefix, toKebabCase(key)]

    if (typeof value === 'string' || typeof value === 'number') {
      vars[`--${path.join('-')}`] = String(value)
      return vars
    }

    return {
      ...vars,
      ...flattenTokens(value, path),
    }
  }, {})
}

function applyCssVariables(vars: Record<string, string>): void {
  const root = document.documentElement

  Object.entries(vars).forEach(([name, value]) => {
    root.style.setProperty(name, value)
  })
}

export function applyGlobalTheme(): void {
  applyCssVariables({
    ...flattenTokens(sharedColors, ['color']),
    ...flattenTokens(space, ['spacing']),
    ...flattenTokens(radius, ['radius']),
    ...flattenTokens(fonts, ['font']),
    ...flattenTokens(text, ['text']),
  })
}

export function applyColorTheme(theme: ThemeName): void {
  applyCssVariables(flattenTokens(colorThemes[theme], ['color']))
}
