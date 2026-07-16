import { expect, test } from '@playwright/test'

import { SEASON_HOME_PATH } from '../../helpers/fixtures'

test.describe('theme smoke', () => {
  test.beforeEach(async ({ context }) => {
    await context.addInitScript(() => {
      localStorage.removeItem('yeetcraft-theme')
    })
  })

  test('switches Daytime and Midnight using the theme radiogroup', async ({ page }) => {
    await page.goto(SEASON_HOME_PATH)

    const themeGroup = page.getByRole('radiogroup', { name: 'Theme' })
    const daytime = themeGroup.getByRole('radio', { name: 'Daytime' })
    const midnight = themeGroup.getByRole('radio', { name: 'Midnight' })

    await expect(daytime).toHaveAttribute('aria-checked', 'true')
    await expect(midnight).toHaveAttribute('aria-checked', 'false')

    await midnight.click()
    await expect(midnight).toHaveAttribute('aria-checked', 'true')
    await expect(daytime).toHaveAttribute('aria-checked', 'false')

    await daytime.click()
    await expect(daytime).toHaveAttribute('aria-checked', 'true')
    await expect(midnight).toHaveAttribute('aria-checked', 'false')
  })
})
