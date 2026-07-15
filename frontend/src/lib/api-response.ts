import { z } from 'zod'
import { ApiError } from '../utils/api-error'
import { clearAccessToken } from '../utils/token'

export function toHttpApiError(status: number, message: string): ApiError {
  if (status === 401) {
    return new ApiError('auth', message, { status })
  }

  if (status === 403) {
    return new ApiError('forbidden', message, { status })
  }

  if (status === 404) {
    return new ApiError('not_found', message, { status })
  }

  if (status >= 500) {
    return new ApiError('server', message, { status })
  }

  if (status === 400) {
    return new ApiError('validation', message, { status })
  }

  return new ApiError('unknown', message, { status })
}

export async function throwForFailedResponse(
  response: Response,
  token: string | null,
): Promise<never> {
  if (response.status === 401) {
    if (token) {
      clearAccessToken()
    }
    const error = await response.json().catch(() => ({ message: 'Unauthorized' }))
    throw toHttpApiError(
      401,
      error.message || 'Unauthorized. Please use the shared link with a valid token.',
    )
  }

  const errorText = await response.text().catch(() => response.statusText)
  throw toHttpApiError(response.status, `API error: ${response.status} ${errorText}`)
}

export function parseApiResponse<T>(
  json: unknown,
  schema: z.ZodType<T>,
  endpoint: string,
): T {
  try {
    return schema.parse(json)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ApiError('validation', `Invalid response from ${endpoint}: ${error.message}`)
    }
    throw error
  }
}
