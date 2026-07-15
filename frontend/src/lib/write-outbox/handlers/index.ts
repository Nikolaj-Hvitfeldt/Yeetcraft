import type { PendingWrite } from '../types'
import { syncSetPlayerStats } from './set-player-stats'

export const writeHandlers = {
  'set-player-stats': syncSetPlayerStats,
} satisfies Record<PendingWrite['type'], (write: PendingWrite) => Promise<void>>
