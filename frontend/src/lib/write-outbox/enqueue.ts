import type { QueryClient } from '@tanstack/react-query'
import type { SetPlayerStatsBatchRequest } from './types'
import { upsertSetPlayerStatsWrite } from './store'
import { syncOutbox } from './sync'

export async function enqueueSetPlayerStatsWrite(
  queryClient: QueryClient,
  request: SetPlayerStatsBatchRequest,
): Promise<void> {
  await upsertSetPlayerStatsWrite(request)
  void syncOutbox(queryClient)
}
