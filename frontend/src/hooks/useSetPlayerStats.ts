import { useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchSetStatsBatch } from '../api/api'
import type { StatRow } from '../api/types'
import {
  applyPlayerStatsUpdatesToCache,
  rollbackPlayerStatsUpdates,
} from '../lib/player-stats-cache'
import { invalidateSetPlayerStatsQueries } from '../lib/write-outbox/reconcile-queries'
import { enqueueSetPlayerStatsWrite } from '../lib/write-outbox/enqueue'
import { removeWriteByDedupeKey } from '../lib/write-outbox/store'
import {
  getSetPlayerStatsDedupeKey,
  type SetPlayerStatsBatchRequest,
} from '../lib/write-outbox/types'
import { isRetryableError } from '../utils/api-error'

export type { SetPlayerStatsBatchRequest }

export function useSetPlayerStats() {
  const queryClient = useQueryClient()

  return useMutation({
    scope: {
      id: 'set-player-stats',
    },
    mutationFn: async (request: SetPlayerStatsBatchRequest): Promise<StatRow[]> => {
      return fetchSetStatsBatch(request)
    },
    onMutate: async (request) => {
      return applyPlayerStatsUpdatesToCache(queryClient, request)
    },
    onSuccess: async (_data, request) => {
      await removeWriteByDedupeKey(getSetPlayerStatsDedupeKey(request))
    },
    onError: async (error, request, context) => {
      if (isRetryableError(error)) {
        await enqueueSetPlayerStatsWrite(queryClient, request)
        return
      }

      if (context) {
        rollbackPlayerStatsUpdates(queryClient, request, context)
      }
    },
    onSettled: async (data, error, request) => {
      if (error && isRetryableError(error)) {
        return
      }

      if (data) {
        await invalidateSetPlayerStatsQueries(queryClient, request)
      }
    },
  })
}
