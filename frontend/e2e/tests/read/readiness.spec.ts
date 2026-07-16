import { expect, test } from '@playwright/test'

import { E2E_API_HEALTH_URL } from '../../helpers/constants'

test('preview and API health are ready', async ({ page, request }) => {
  const healthResponse = await request.get(E2E_API_HEALTH_URL)
  expect(healthResponse.ok()).toBeTruthy()

  const healthBody = await healthResponse.json()
  expect(healthBody).toMatchObject({ status: 'ok' })

  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'YeetCraft' })).toBeVisible()
})
