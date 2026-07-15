import { useEffect, useState } from 'react'
import { initWriteOutboxStore, subscribeOutbox } from '../lib/write-outbox/store'
import type { PendingWrite } from '../lib/write-outbox/types'

export function useWriteOutboxWrites(): readonly PendingWrite[] {
  const [writes, setWrites] = useState<readonly PendingWrite[]>([])

  useEffect(() => {
    void initWriteOutboxStore()
    return subscribeOutbox(setWrites)
  }, [])

  return writes
}

export function useSetPlayerStatsOutboxStatus(playerId?: string, seasonId?: string) {
  const writes = useWriteOutboxWrites()

  if (!playerId || !seasonId) {
    return null
  }

  const write = writes.find(
    (entry) =>
      entry.type === 'set-player-stats' &&
      entry.payload.playerId === playerId &&
      entry.payload.seasonId === seasonId,
  )

  if (!write) return null

  return {
    id: write.id,
    status: write.status,
    lastError: write.lastError,
  }
}

export function useFailedOutboxWrites(): readonly PendingWrite[] {
  const writes = useWriteOutboxWrites()
  return writes.filter((write) => write.status === 'failed')
}
