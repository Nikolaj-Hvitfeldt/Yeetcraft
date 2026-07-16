import { spawnSync } from 'node:child_process'

import { backendRoot } from './paths'
import { redactSecrets } from './env'

export type TestdbCommand = 'prepare' | 'seed' | 'reset' | 'verify'

type TestdbRunResult = {
  ok: boolean
  exitCode: number | null
  output: string
}

export function runTestdb(command: TestdbCommand, secrets: string[] = []): void {
  const result = runTestdbAllowFail(command, secrets)
  if (!result.ok) {
    throw new Error(`testdb ${command} failed:\n${result.output}`)
  }
}

export function runTestdbAllowFail(command: TestdbCommand, secrets: string[] = []): TestdbRunResult {
  const result = spawnSync('go', ['run', './cmd/testdb', command], {
    cwd: backendRoot,
    env: {
      ...process.env,
      YEETCRAFT_TEST_MODE: '1',
    },
    encoding: 'utf8',
  })

  const combinedOutput = redactSecrets(
    [result.stdout, result.stderr].filter(Boolean).join('\n').trim(),
    secrets,
  )

  return {
    ok: result.status === 0,
    exitCode: result.status,
    output: combinedOutput,
  }
}

export function ensureTestDatabase(secrets: string[] = []): void {
  const verifyResult = runTestdbAllowFail('verify', secrets)
  if (verifyResult.ok) {
    runTestdb('reset', secrets)
    runTestdb('verify', secrets)
    return
  }

  const prepareResult = runTestdbAllowFail('prepare', secrets)
  if (prepareResult.ok) {
    runTestdb('verify', secrets)
    return
  }

  if (prepareResult.output.includes('already initialized')) {
    runTestdb('seed', secrets)
    runTestdb('reset', secrets)
    runTestdb('verify', secrets)
    return
  }

  throw new Error(
    `Unable to prepare test database.\nverify:\n${verifyResult.output}\nprepare:\n${prepareResult.output}`,
  )
}
