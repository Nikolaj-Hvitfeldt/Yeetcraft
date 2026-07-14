import { fetchSetStatsBatch } from '../../../api/api'
import type { SetPlayerStatsWrite } from '../types'

export async function syncSetPlayerStats(write: SetPlayerStatsWrite): Promise<void> {
  await fetchSetStatsBatch(write.payload)
}
