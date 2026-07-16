import { E2E_API_BASE_URL } from './constants'

export type E2EEnvironment = {
  testMode: string
  testDatabaseURL: string
  apiKey: string
  writeToken: string
}

export function requireE2EEnvironment(): E2EEnvironment {
  const testMode = process.env.YEETCRAFT_TEST_MODE?.trim()
  if (testMode !== '1') {
    throw new Error('YEETCRAFT_TEST_MODE must be set to 1 for Playwright E2E runs')
  }

  const testDatabaseURL = process.env.TEST_DATABASE_URL?.trim()
  if (!testDatabaseURL) {
    throw new Error('TEST_DATABASE_URL must be set for Playwright E2E runs')
  }

  if (!testDatabaseURLIncludesTestSuffix(testDatabaseURL)) {
    throw new Error('TEST_DATABASE_URL must point at a database whose name contains _test')
  }

  const apiKey = process.env.API_KEY?.trim() ?? ''
  const writeToken = process.env.E2E_WRITE_TOKEN?.trim() ?? ''

  if (!apiKey) {
    throw new Error('API_KEY must be set for Playwright E2E runs')
  }

  if (!writeToken) {
    throw new Error('E2E_WRITE_TOKEN must be set for Playwright E2E runs')
  }

  if (apiKey !== writeToken) {
    throw new Error('API_KEY and E2E_WRITE_TOKEN must match for Playwright E2E runs')
  }

  return {
    testMode,
    testDatabaseURL,
    apiKey,
    writeToken,
  }
}

export function testDatabaseURLIncludesTestSuffix(databaseURL: string): boolean {
  try {
    const parsed = new URL(databaseURL)
    const databaseName = parsed.pathname.replace(/^\//, '').split('/')[0] ?? ''
    return databaseName.includes('_test')
  } catch {
    return databaseURL.includes('_test')
  }
}

export function buildWebServerEnvironment(environment: E2EEnvironment): Record<string, string> {
  return {
    ...process.env,
    YEETCRAFT_TEST_MODE: '1',
    TEST_DATABASE_URL: environment.testDatabaseURL,
    DATABASE_URL: environment.testDatabaseURL,
    API_KEY: environment.writeToken,
    SERVER_HOST: '127.0.0.1',
    SERVER_PORT: String(18080),
    VITE_API_BASE_URL: E2E_API_BASE_URL,
  } as Record<string, string>
}

export function redactSecrets(text: string, secrets: string[]): string {
  let redacted = text
  for (const secret of secrets) {
    if (!secret) continue
    redacted = redacted.split(secret).join('[REDACTED]')
  }
  return redacted
}
