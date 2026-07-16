import { requireE2EEnvironment, type E2EEnvironment } from './env'
import { runTestdb, runTestdbAllowFail } from './testdb'

export function e2eSecrets(environment: E2EEnvironment = requireE2EEnvironment()): string[] {
  return [environment.apiKey, environment.writeToken, environment.testDatabaseURL]
}

export function resetAndVerifyBaseline(secrets: string[] = e2eSecrets()): void {
  runTestdb('reset', secrets)
  runTestdb('verify', secrets)
}

export function tryResetAndVerifyBaseline(secrets: string[] = e2eSecrets()): void {
  const resetResult = runTestdbAllowFail('reset', secrets)
  if (!resetResult.ok) {
    return
  }

  runTestdbAllowFail('verify', secrets)
}
