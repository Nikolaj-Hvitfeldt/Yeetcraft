import { ApiError } from '../utils/api-error'

/**
 * API request timeout for Render Free cold starts.
 *
 * 45 seconds balances:
 * - enough time for a sleeping Render instance to accept the first request
 * - avoiding indefinite hangs when the backend never responds
 */
export const API_REQUEST_TIMEOUT_MS = 45_000

function mergeAbortSignals(
  primary: AbortSignal,
  secondary: AbortSignal,
): { signal: AbortSignal; isPrimaryAborted: () => boolean; isSecondaryAborted: () => boolean } {
  if (primary.aborted) {
    return {
      signal: primary,
      isPrimaryAborted: () => true,
      isSecondaryAborted: () => false,
    }
  }

  if (secondary.aborted) {
    return {
      signal: secondary,
      isPrimaryAborted: () => false,
      isSecondaryAborted: () => true,
    }
  }

  const controller = new AbortController()
  let primaryAborted = false
  let secondaryAborted = false

  const abortFrom = (source: 'primary' | 'secondary', signal: AbortSignal) => {
    if (source === 'primary') primaryAborted = true
    if (source === 'secondary') secondaryAborted = true
    controller.abort(signal.reason)
  }

  primary.addEventListener('abort', () => abortFrom('primary', primary), { once: true })
  secondary.addEventListener('abort', () => abortFrom('secondary', secondary), { once: true })

  return {
    signal: controller.signal,
    isPrimaryAborted: () => primaryAborted,
    isSecondaryAborted: () => secondaryAborted,
  }
}

function toFetchApiError(
  error: unknown,
  options: { isTimeout: boolean; isCallerAbort: boolean },
): ApiError {
  if (error instanceof ApiError) return error

  if (options.isCallerAbort) {
    return new ApiError('abort', 'Request was aborted.', { cause: error })
  }

  if (options.isTimeout) {
    return new ApiError(
      'timeout',
      'Request timed out. The server may still be waking up.',
      { cause: error },
    )
  }

  if (
    error instanceof TypeError ||
    (error instanceof Error &&
      (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')))
  ) {
    return new ApiError('network', 'Failed to reach the server.', { cause: error })
  }

  return new ApiError('unknown', 'Something went wrong while fetching data.', { cause: error })
}

export async function fetchWithTimeout(
  url: string,
  init?: RequestInit,
): Promise<Response> {
  const timeoutSignal = AbortSignal.timeout(API_REQUEST_TIMEOUT_MS)
  const callerSignal = init?.signal

  const merged = callerSignal
    ? mergeAbortSignals(callerSignal, timeoutSignal)
    : {
        signal: timeoutSignal,
        isPrimaryAborted: () => false,
        isSecondaryAborted: () => timeoutSignal.aborted,
      }

  try {
    return await fetch(url, { ...init, signal: merged.signal })
  } catch (error) {
    const isCallerAbort = callerSignal ? merged.isPrimaryAborted() : false
    const isTimeout =
      !isCallerAbort &&
      (merged.isSecondaryAborted() ||
        (error instanceof DOMException &&
          (error.name === 'TimeoutError' || error.name === 'AbortError')))

    throw toFetchApiError(error, { isTimeout, isCallerAbort })
  }
}
