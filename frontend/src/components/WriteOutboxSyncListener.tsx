import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useOnlineStatus } from '../hooks/online-status-context'
import { useQueryRestorePending } from '../hooks/query-restore-context'
import { applyPendingStatsWritesToQueryCache } from '../lib/write-outbox/apply-pending-to-cache'
import { initWriteOutboxStore } from '../lib/write-outbox/store'
import { syncOutbox } from '../lib/write-outbox/sync'

export function WriteOutboxSyncListener() {
  const queryClient = useQueryClient()
  const isRestorePending = useQueryRestorePending()
  const isOnline = useOnlineStatus()

  useEffect(() => {
    if (isRestorePending) return

    void (async () => {
      await initWriteOutboxStore()
      applyPendingStatsWritesToQueryCache(queryClient)

      if (isOnline) {
        await syncOutbox(queryClient)
      }
    })()
  }, [isRestorePending, isOnline, queryClient])

  return null
}
