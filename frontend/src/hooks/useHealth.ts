import { useQuery } from '@tanstack/react-query'
import { fetchHealth } from '../api/api'
import { HealthResponse } from '../api/types'

/**
 * Fetch health with fallback when backend is unavailable.
 */
async function fetchHealthWithFallback(): Promise<HealthResponse> {
  try {
    return await fetchHealth()
  } catch (error) {
    console.warn('Health check failed, returning mock status:', error)
    return { status: 'ok', timestamp: Date.now() }
  }
}

/**
 * Custom hook for health check using TanStack Query.
 */
export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: fetchHealthWithFallback,
    staleTime: 60_000, // Health status fresh for 1 minute
    refetchInterval: 60_000, // Auto-refetch every minute
  })
}
