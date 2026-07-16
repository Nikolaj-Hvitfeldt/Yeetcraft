import { defineConfig, devices } from '@playwright/test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { buildE2EFrontend } from './helpers/build'
import { E2E_API_HEALTH_URL, E2E_API_PORT, E2E_WEB_BASE_URL, E2E_WEB_PORT } from './helpers/constants'
import { buildWebServerEnvironment, requireE2EEnvironment } from './helpers/env'
import { assertPortAvailable } from './helpers/ports'
import { backendRoot, frontendRoot } from './helpers/paths'

const configDirectory = path.dirname(fileURLToPath(import.meta.url))
const environment = requireE2EEnvironment()
const isPlaywrightWorker = process.env.TEST_WORKER_INDEX !== undefined

if (!isPlaywrightWorker) {
  await assertPortAvailable('127.0.0.1', E2E_API_PORT)
  await assertPortAvailable('127.0.0.1', E2E_WEB_PORT)
  buildE2EFrontend()
}

export default defineConfig({
  testDir: configDirectory,
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: E2E_WEB_BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },
  webServer: [
    {
      command: 'go run ./cmd/server',
      cwd: backendRoot,
      url: E2E_API_HEALTH_URL,
      reuseExistingServer: false,
      timeout: 120_000,
      env: buildWebServerEnvironment(environment),
    },
    {
      command: 'npx vite preview --host 127.0.0.1 --port 14173',
      cwd: frontendRoot,
      url: E2E_WEB_BASE_URL,
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
  projects: [
    {
      name: 'setup',
      testMatch: /setup\/.*\.setup\.ts/,
    },
    {
      name: 'chromium-read',
      dependencies: ['setup'],
      testMatch: /tests\/read\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        serviceWorkers: 'block',
      },
    },
    {
      name: 'chromium-write',
      dependencies: ['setup'],
      testMatch: /tests\/write\/.*\.spec\.ts/,
      workers: 1,
      fullyParallel: false,
      use: {
        ...devices['Desktop Chrome'],
        serviceWorkers: 'block',
      },
    },
  ],
})
