import { expect, test, type APIRequestContext, type Page } from '@playwright/test'

import { assertNoAuthorizationError } from '../../helpers/assertions'
import { resetAndVerifyBaseline, tryResetAndVerifyBaseline } from '../../helpers/baseline'
import { E2E_API_BASE_URL } from '../../helpers/constants'
import { requireE2EEnvironment } from '../../helpers/env'
import {
  DUNGEON_ALPHA,
  INVALID_WRITE_TOKEN,
  PLAYER_SEB,
  SEASON_HOME_PATH,
  SEASON_ID,
  buildTokenUnlockPath,
  playerProfilePath,
} from '../../helpers/fixtures'
import {
  assertPatchUsesHeaderAuth,
  assertResponseBodyExcludesSecrets,
  waitForStatsBatchPatch,
  waitForStatsBatchPatchResponse,
} from '../../helpers/network'

test.describe.configure({ mode: 'serial' })

test.describe('write access', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test.beforeEach(async ({ page }) => {
    resetAndVerifyBaseline()

    await page.goto('/')
    await page.evaluate(() => {
      localStorage.removeItem('yeetcraft_token')
      localStorage.removeItem('yeetcraft-theme')
    })
  })

  test.afterEach(() => {
    tryResetAndVerifyBaseline()
  })

  test('shared write token unlocks editing and persists a stat change', async ({ page, request }) => {
    const { writeToken } = requireE2EEnvironment()
    const expectedDeaths = DUNGEON_ALPHA.baselineDeaths + 1

    await page.goto(buildTokenUnlockPath(playerProfilePath(PLAYER_SEB.slug), writeToken))

    await expect(page).not.toHaveURL(/[?&]token=/)
    await expect(page.getByRole('button', { name: 'Edit Stats' })).toBeVisible()

    await page.getByRole('button', { name: 'Edit Stats' }).click()
    await expect(page.getByText('EDITING', { exact: true })).toBeVisible()

    const alphaRow = dungeonBreakdownRow(page, DUNGEON_ALPHA.name)
    const patchRequestPromise = waitForStatsBatchPatch(page)
    const patchResponsePromise = waitForStatsBatchPatchResponse(page)

    await alphaRow.getByRole('button', { name: 'Increase deaths' }).click()
    await page.getByRole('button', { name: 'Done' }).click()

    const patchRequest = await patchRequestPromise
    const patchResponse = await patchResponsePromise

    assertPatchUsesHeaderAuth(patchRequest)
    expect(patchResponse.status()).toBe(200)

    await expect(page.getByText('EDITING', { exact: true })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Edit Stats' })).toBeVisible()
    await expect(page.getByRole('alert')).toHaveCount(0)

    await expectSebAlphaDeaths(request, expectedDeaths)

    await page.reload()
    await expect(page.getByRole('heading', { name: PLAYER_SEB.name, level: 1 })).toBeVisible()
    await expectSebAlphaDeaths(request, expectedDeaths)
  })

  test('invalid write token rejects save without mutating baseline', async ({ page, request }) => {
    const environment = requireE2EEnvironment()
    const secretValues = [environment.writeToken, INVALID_WRITE_TOKEN]

    await page.goto(buildTokenUnlockPath(SEASON_HOME_PATH, INVALID_WRITE_TOKEN))

    await expect(page).not.toHaveURL(/[?&]token=/)
    await expect(page.getByRole('heading', { name: 'Rankings', level: 2 })).toBeVisible()
    await assertNoAuthorizationError(page)
    await expect(page.getByText(INVALID_WRITE_TOKEN)).toHaveCount(0)

    await page.goto(playerProfilePath(PLAYER_SEB.slug))
    await expect(page.getByRole('heading', { name: PLAYER_SEB.name, level: 1 })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Edit Stats' })).toBeVisible()

    await page.getByRole('button', { name: 'Edit Stats' }).click()
    await expect(page.getByText('EDITING', { exact: true })).toBeVisible()

    const alphaRow = dungeonBreakdownRow(page, DUNGEON_ALPHA.name)
    const patchRequestPromise = waitForStatsBatchPatch(page)
    const patchResponsePromise = waitForStatsBatchPatchResponse(page)

    await alphaRow.getByRole('button', { name: 'Increase deaths' }).click()
    await page.getByRole('button', { name: 'Done' }).click()

    const patchRequest = await patchRequestPromise
    const patchResponse = await patchResponsePromise

    assertPatchUsesHeaderAuth(patchRequest)
    expect(patchResponse.status()).toBe(401)
    await assertResponseBodyExcludesSecrets(patchResponse, secretValues)

    await expect(page.getByRole('button', { name: 'Done' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Edit Stats' })).toHaveCount(0)
    await expect(page.getByRole('alert')).toContainText(/access link/i)
    await expect(page.getByText(INVALID_WRITE_TOKEN)).toHaveCount(0)
    await expect(dungeonBreakdownRow(page, DUNGEON_ALPHA.name)).toContainText(
      String(DUNGEON_ALPHA.baselineDeaths),
    )

    const storedToken = await page.evaluate(() => localStorage.getItem('yeetcraft_token'))
    expect(storedToken).toBeNull()

    await expectSebAlphaDeaths(request, DUNGEON_ALPHA.baselineDeaths)
    resetAndVerifyBaseline()
  })
})

function dungeonBreakdownRow(page: Page, dungeonName: string) {
  const breakdown = page.locator('section').filter({
    has: page.getByRole('heading', { name: 'Dungeon breakdown' }),
  })

  return breakdown
    .getByText(dungeonName, { exact: true })
    .locator('xpath=ancestor::a[1] | ancestor::div[contains(@class,"h-[57px]")][1]')
}

async function expectSebAlphaDeaths(
  request: APIRequestContext,
  expectedDeaths: number,
): Promise<void> {
  const response = await request.get(
    `${E2E_API_BASE_URL}/api/players/by-slug/${PLAYER_SEB.slug}/stats?seasonId=${SEASON_ID}`,
  )

  expect(response.ok()).toBeTruthy()

  const body = await response.json()
  const alphaStats = body.dungeons.find(
    (row: { dungeon: { id: string } }) => row.dungeon.id === DUNGEON_ALPHA.id,
  )

  expect(alphaStats?.deaths).toBe(expectedDeaths)
}
