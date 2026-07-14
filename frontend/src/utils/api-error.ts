export function isNotFoundApiError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false
  }

  const message = error.message
  return message.includes('404') || message.toLowerCase().includes('not found')
}

export function getUserFacingErrorMessage(error: unknown): string {
  if (!error) {
    return 'Something went wrong. Please try again.'
  }

  if (!(error instanceof Error)) {
    return 'Something went wrong. Please try again.'
  }

  const message = error.message

  if (message.includes('Unauthorized') || message.includes('token')) {
    return 'Your access link may have expired. Check the shared link and try again.'
  }

  if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
    return 'We could not reach the server. Check your connection and try again.'
  }

  if (message.includes('404') || message.toLowerCase().includes('not found')) {
    return 'We could not find what you were looking for.'
  }

  if (message.includes('500') || /API error: 5\d{2}/.test(message)) {
    return 'The server had trouble loading data. Try again in a moment.'
  }

  if (message.includes('Invalid response')) {
    return 'The server returned unexpected data. Try refreshing the page.'
  }

  if (message.includes('Missing player') || message.includes('Missing season')) {
    return 'This page is missing required information.'
  }

  return 'Something went wrong. Please try again.'
}

export function isRetryableError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return true
  }

  const message = error.message

  if (message.includes('Unauthorized') || message.includes('token')) {
    return false
  }

  if (message.includes('404') || message.toLowerCase().includes('not found')) {
    return false
  }

  if (message.includes('Missing player') || message.includes('Missing season')) {
    return false
  }

  return true
}
