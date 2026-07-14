export const API_REQUEST_TIMEOUT_MS = 45_000

export async function fetchWithTimeout(
  url: string,
  init?: RequestInit,
): Promise<Response> {
  const signal = AbortSignal.timeout(API_REQUEST_TIMEOUT_MS)

  try {
    return await fetch(url, { ...init, signal })
  } catch (error) {
    if (
      error instanceof DOMException &&
      (error.name === 'TimeoutError' || error.name === 'AbortError')
    ) {
      throw new Error('Request timed out. The server may still be waking up.')
    }

    throw error
  }
}
