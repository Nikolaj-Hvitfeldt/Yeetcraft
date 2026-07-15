/**
 * Write-access token utilities for shared-link editing.
 *
 * Friends open the site via a link like:
 * https://yoursite.com?token=friend-secret-key
 *
 * The token is captured once at startup, stored locally, and sent only on PATCH requests.
 * Public reads do not require or use this token.
 */

const TOKEN_STORAGE_KEY = 'yeetcraft_token'

type WriteAccessListener = (canWrite: boolean) => void

const writeAccessListeners = new Set<WriteAccessListener>()

function notifyWriteAccessChanged(): void {
  const canWrite = hasWriteAccess()
  for (const listener of writeAccessListeners) {
    listener(canWrite)
  }
}

/**
 * Reads ?token= from the URL once at startup and stores it for write access.
 * Call this before React mounts so the first PATCH request can include the header.
 */
export function captureTokenFromUrl(): void {
  const urlParams = new URLSearchParams(window.location.search)
  const urlToken = urlParams.get('token')?.trim()
  if (!urlToken) return

  localStorage.setItem(TOKEN_STORAGE_KEY, urlToken)
  cleanTokenFromUrl()
  notifyWriteAccessChanged()
}

/**
 * Gets the stored write-access token.
 */
export function getAccessToken(): string | null {
  const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY)?.trim()
  return storedToken || null
}

/**
 * Whether the current session has a stored token for write operations.
 */
export function hasWriteAccess(): boolean {
  return getAccessToken() !== null
}

/**
 * Clears the stored write-access token and notifies subscribers.
 */
export function clearAccessToken(): void {
  if (!localStorage.getItem(TOKEN_STORAGE_KEY)) return
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  notifyWriteAccessChanged()
}

/**
 * Subscribes to write-access changes (capture, clear, or storage updates).
 */
export function subscribeWriteAccess(listener: WriteAccessListener): () => void {
  writeAccessListeners.add(listener)
  return () => {
    writeAccessListeners.delete(listener)
  }
}

/**
 * Removes the token query parameter from the URL without reloading the page.
 */
function cleanTokenFromUrl(): void {
  const url = new URL(window.location.href)
  url.searchParams.delete('token')
  window.history.replaceState({}, '', url.toString())
}
