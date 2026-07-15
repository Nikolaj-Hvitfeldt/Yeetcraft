/**
 * Token management utilities for URL-based authentication.
 *
 * This allows friends to access the site via a shared link like:
 * https://yoursite.com?token=friend-secret-key
 *
 * The token is automatically extracted from the URL and stored for future requests.
 */

const TOKEN_STORAGE_KEY = 'yeetcraft_token'

/**
 * Reads ?token= from the URL once at startup and stores it.
 * Call this before React mounts so the first API request has the header.
 */
export function captureTokenFromUrl(): void {
  const urlParams = new URLSearchParams(window.location.search)
  const urlToken = urlParams.get('token')?.trim()
  if (!urlToken) return

  localStorage.setItem(TOKEN_STORAGE_KEY, urlToken)
  cleanTokenFromUrl()
}

/**
 * Gets the stored access token.
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
 * Removes the token query parameter from the URL without reloading the page.
 */
function cleanTokenFromUrl(): void {
  const url = new URL(window.location.href)
  url.searchParams.delete('token')
  window.history.replaceState({}, '', url.toString())
}
