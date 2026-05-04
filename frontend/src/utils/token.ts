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
 * Gets the access token from URL or localStorage.
 * 
 * If token is in URL, it's extracted, stored, and URL is cleaned.
 * 
 * @returns The access token, or null if not found
 */
export function getAccessToken(): string | null {
  // Check URL query parameter first (for shared links)
  const urlParams = new URLSearchParams(window.location.search)
  const urlToken = urlParams.get('token')
  
  if (urlToken) {
    // Store token from URL for future requests
    localStorage.setItem(TOKEN_STORAGE_KEY, urlToken)
    // Clean URL by removing token parameter for cleaner URLs
    cleanTokenFromUrl()
    return urlToken
  }
  
  // Fall back to stored token
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

/**
 * Removes the token query parameter from the URL without reloading the page.
 */
function cleanTokenFromUrl(): void {
  const url = new URL(window.location.href)
  url.searchParams.delete('token')
  window.history.replaceState({}, '', url.toString())
}

/**
 * Checks if a valid token exists.
 */
export function hasValidToken(): boolean {
  return getAccessToken() !== null
}

/**
 * Clears the stored token (for logout scenarios).
 */
export function clearToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
}
