import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

import { E2E_API_BASE_URL } from './constants'
import { distDirectory, frontendRoot } from './paths'

export function buildE2EFrontend(): void {
  const result = spawnSync('npm', ['run', 'build'], {
    cwd: frontendRoot,
    env: {
      ...process.env,
      VITE_API_BASE_URL: E2E_API_BASE_URL,
    },
    encoding: 'utf8',
    shell: process.platform === 'win32',
  })

  if (result.status !== 0) {
    throw new Error(
      ['E2E frontend build failed', result.stdout, result.stderr].filter(Boolean).join('\n'),
    )
  }

  assertBuiltApiTarget()
}

export function assertBuiltApiTarget(): void {
  if (!fs.existsSync(distDirectory)) {
    throw new Error(`Expected E2E build output at ${distDirectory}`)
  }

  const assetFiles = collectFiles(distDirectory).filter((filePath) => filePath.endsWith('.js'))
  if (assetFiles.length === 0) {
    throw new Error('Expected built JavaScript assets for API target verification')
  }

  const apiTargetFound = assetFiles.some((filePath) => {
    const contents = fs.readFileSync(filePath, 'utf8')
    return contents.includes(E2E_API_BASE_URL)
  })

  if (!apiTargetFound) {
    throw new Error(
      `Built frontend does not contain expected API target ${E2E_API_BASE_URL}. Rebuild with VITE_API_BASE_URL set.`,
    )
  }
}

function collectFiles(directory: string): string[] {
  const entries = fs.readdirSync(directory, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...collectFiles(entryPath))
      continue
    }

    files.push(entryPath)
  }

  return files
}
