import { expect, type Page } from '@playwright/test'

const AUTHORIZATION_ERROR_PATTERN =
  /access link|unauthorized|permission to view|valid token/i

export async function assertNoAuthorizationError(page: Page): Promise<void> {
  await expect(page.getByRole('heading', { name: 'Something Went Wrong' })).toHaveCount(0)
  await expect(page.getByText(AUTHORIZATION_ERROR_PATTERN)).toHaveCount(0)
}

export async function expectAvatarOrPlaceholder(
  page: Page,
  displayName: string,
  scope?: ReturnType<Page['locator']>,
): Promise<void> {
  const container = scope ?? page.locator('header').first()
  const avatarImage = container.getByRole('img', { name: `${displayName} avatar` })

  if ((await avatarImage.count()) > 0) {
    await expect(avatarImage).toBeVisible()
    const isLoaded = await avatarImage.evaluate(
      (element: HTMLImageElement) => element.complete && element.naturalWidth > 0,
    )
    expect(isLoaded).toBeTruthy()
    return
  }

  await expect(container.getByText(displayName.charAt(0), { exact: true })).toBeVisible()
}
