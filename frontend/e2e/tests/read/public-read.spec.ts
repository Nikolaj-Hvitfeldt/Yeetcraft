import { expect, test } from '@playwright/test'

import { assertNoAuthorizationError, expectAvatarOrPlaceholder } from '../../helpers/assertions'
import { E2E_API_BASE_URL } from '../../helpers/constants'
import { requireE2EEnvironment } from '../../helpers/env'
import {
  DUNGEON_ALPHA,
  PLAYER_SEB,
  SEASON_HOME_PATH,
  SEASON_ID,
  dungeonDetailPath,
  playerProfilePath,
} from '../../helpers/fixtures'
import { runTestdb } from '../../helpers/testdb'

test.describe('public read smoke', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test.beforeEach(async ({ context }) => {
    await context.addInitScript(() => {
      localStorage.removeItem('yeetcraft_token')
      localStorage.removeItem('yeetcraft-theme')
    })
  })

  test('home is readable without a stored write token', async ({ page }) => {
    await page.goto(SEASON_HOME_PATH)

    await expect(page.getByRole('heading', { name: 'YeetCraft', level: 1 })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Rankings', level: 2 })).toBeVisible()
    await expect(page.getByRole('link', { name: PLAYER_SEB.name })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Dungeons', level: 2 })).toBeVisible()
    await expect(page.getByRole('link', { name: DUNGEON_ALPHA.name })).toBeVisible()

    await expect(page.getByRole('button', { name: 'Edit Stats' })).toHaveCount(0)
    await expect(page.getByText(/shared link|enter.*token|access link/i)).toHaveCount(0)

    await assertNoAuthorizationError(page)

    const storedToken = await page.evaluate(() => localStorage.getItem('yeetcraft_token'))
    expect(storedToken).toBeNull()
  })

  test('player and dungeon pages are readable from public navigation', async ({ page }) => {
    await page.goto(SEASON_HOME_PATH)
    await expect(page.getByRole('heading', { name: 'Rankings', level: 2 })).toBeVisible()

    await page.getByRole('link', { name: PLAYER_SEB.name }).click()
    await expect(page).toHaveURL(new RegExp(`${playerProfilePath(PLAYER_SEB.slug)}$`))

    await expect(page.getByText('Player profile')).toBeVisible()
    await expect(page.getByRole('heading', { name: PLAYER_SEB.name, level: 1 })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Dungeon breakdown', level: 2 })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Edit Stats' })).toHaveCount(0)

    const profileHeader = page.locator('header').filter({
      has: page.getByRole('heading', { name: PLAYER_SEB.name, level: 1 }),
    })
    await expectAvatarOrPlaceholder(page, PLAYER_SEB.name, profileHeader)

    await assertNoAuthorizationError(page)

    await page.getByRole('link', { name: DUNGEON_ALPHA.name }).first().click()
    await expect(page).toHaveURL(new RegExp(`${dungeonDetailPath(DUNGEON_ALPHA.slug)}$`))

    await expect(page.getByRole('heading', { name: DUNGEON_ALPHA.name, level: 1 })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Dungeon leaderboard', level: 2 })).toBeVisible()
    await expect(page.getByRole('link', { name: PLAYER_SEB.name })).toBeVisible()

    await assertNoAuthorizationError(page)

    await page.getByRole('button', { name: 'Back' }).click()
    await expect(page).toHaveURL(new RegExp(`${playerProfilePath(PLAYER_SEB.slug)}$`))
    await expect(page.getByRole('heading', { name: PLAYER_SEB.name, level: 1 })).toBeVisible()
  })

  test('PATCH /api/stats/batch without credentials is rejected and baseline stays intact', async ({
    request,
  }) => {
    const environment = requireE2EEnvironment()
    const mutationPayload = {
      playerId: PLAYER_SEB.id,
      seasonId: SEASON_ID,
      stats: [
        {
          dungeonId: DUNGEON_ALPHA.id,
          deaths: 99,
          yeets: 99,
        },
      ],
    }

    const patchResponse = await request.patch(`${E2E_API_BASE_URL}/api/stats/batch`, {
      data: mutationPayload,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    expect(patchResponse.status()).toBe(401)

    runTestdb('verify', [
      environment.apiKey,
      environment.writeToken,
      environment.testDatabaseURL,
    ])
  })
})
