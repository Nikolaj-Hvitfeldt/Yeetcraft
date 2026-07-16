import { test as setup } from '@playwright/test'

import { requireE2EEnvironment } from '../helpers/env'
import { ensureTestDatabase } from '../helpers/testdb'

setup('prepare guarded test database', async () => {
  const environment = requireE2EEnvironment()
  ensureTestDatabase([environment.apiKey, environment.writeToken, environment.testDatabaseURL])
})
