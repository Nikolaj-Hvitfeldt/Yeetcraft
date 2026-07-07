import { getAccessToken } from '../utils/token'

function isAuthError(error: Error | null | undefined): boolean {
  if (!error) return false
  const message = error.message
  return message.includes('Unauthorized') || message.includes('token')
}

export function useAuthGuard(error: Error | null | undefined) {
  const hasToken = getAccessToken()
  const needsAuth = isAuthError(error)

  return {
    hasToken,
    needsAuth,
    showAuthRequired: needsAuth && !hasToken,
  }
}
