import { expect, type Page, type Request, type Response } from '@playwright/test'

const STATS_BATCH_PATH = '/api/stats/batch'

export function isStatsBatchPatch(request: Request): boolean {
  return request.method() === 'PATCH' && request.url().includes(STATS_BATCH_PATH)
}

export function isStatsBatchPatchResponse(response: Response): boolean {
  return response.request().method() === 'PATCH' && response.url().includes(STATS_BATCH_PATH)
}

export function assertPatchUsesHeaderAuth(request: Request): void {
  const url = new URL(request.url())

  expect(url.searchParams.has('token')).toBe(false)
  expect(request.headers()['x-api-key']).toBeTruthy()
}

export function waitForStatsBatchPatch(page: Page): Promise<Request> {
  return page.waitForRequest(isStatsBatchPatch)
}

export function waitForStatsBatchPatchResponse(page: Page): Promise<Response> {
  return page.waitForResponse(isStatsBatchPatchResponse)
}

export async function assertResponseBodyExcludesSecrets(
  response: Response,
  secrets: string[],
): Promise<void> {
  const body = await response.text()

  for (const secret of secrets) {
    if (!secret) continue
    expect(body.includes(secret)).toBe(false)
  }
}
