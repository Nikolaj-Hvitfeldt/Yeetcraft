export type ApiErrorKind =
  | 'network'
  | 'timeout'
  | 'abort'
  | 'server'
  | 'auth'
  | 'forbidden'
  | 'not_found'
  | 'validation'
  | 'unknown'

export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly status?: number

  constructor(
    kind: ApiErrorKind,
    message: string,
    options?: { status?: number; cause?: unknown },
  ) {
    super(message)
    this.name = 'ApiError'
    this.kind = kind
    this.status = options?.status
  }
}

function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

export function getApiErrorKind(error: unknown): ApiErrorKind {
  if (isApiError(error)) return error.kind
  return classifyLegacyApiError(error)
}

function classifyLegacyApiError(error: unknown): ApiErrorKind {
  if (!(error instanceof Error)) return 'unknown'

  const message = error.message

  if (message.includes('Unauthorized') || message.includes('token')) {
    return 'auth'
  }

  if (message.includes('403') || message.toLowerCase().includes('forbidden')) {
    return 'forbidden'
  }

  if (message.includes('404') || message.toLowerCase().includes('not found')) {
    return 'not_found'
  }

  if (message.includes('timed out') || message.includes('waking up')) {
    return 'timeout'
  }

  if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
    return 'network'
  }

  if (message.includes('Invalid response')) {
    return 'validation'
  }

  if (/API error: 5\d{2}/.test(message) || message.includes('500')) {
    return 'server'
  }

  if (message.includes('Missing player') || message.includes('Missing season')) {
    return 'validation'
  }

  return 'unknown'
}

export function isNotFoundApiError(error: unknown): boolean {
  return getApiErrorKind(error) === 'not_found'
}

export function getUserFacingErrorMessage(error: unknown): string {
  switch (getApiErrorKind(error)) {
    case 'auth':
      return 'Your access link may have expired. Check the shared link and try again.'
    case 'forbidden':
      return 'You do not have permission to view this data.'
    case 'not_found':
      return 'We could not find what you were looking for.'
    case 'network':
      return 'We could not reach the server. Check your connection and try again.'
    case 'timeout':
      return 'The server is still waking up. Try again in a moment.'
    case 'server':
      return 'The server had trouble loading data. Try again in a moment.'
    case 'validation':
      return 'The server returned unexpected data. Try refreshing the page.'
    case 'abort':
      return 'The request was cancelled.'
    case 'unknown':
    default:
      return 'Something went wrong. Please try again.'
  }
}

export function isRetryableError(error: unknown): boolean {
  const kind = getApiErrorKind(error)
  return (
    kind === 'network' ||
    kind === 'timeout' ||
    kind === 'server' ||
    (kind === 'unknown' && !(error instanceof ApiError && error.status === 400))
  )
}
