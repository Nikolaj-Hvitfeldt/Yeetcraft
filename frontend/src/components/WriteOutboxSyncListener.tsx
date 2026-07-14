import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useQueryRestorePending } from '../hooks/query-restore-context'
import { useOnlineStatus } from '../hooks/usePageConnectionState'
import { initWriteOutboxStore } from '../lib/write-outbox/store'
import { syncOutbox } from '../lib/write-outbox/sync'

export function WriteOutboxSyncListener() {
  const queryClient = useQueryClient()
  const isRestorePending = useQueryRestorePending()
  const isOnline = useOnlineStatus()

  useEffect(() => {
    void initWriteOutboxStore()
  }, [])

  useEffect(() => {
    if (isRestorePending || !isOnline) return
    void syncOutbox(queryClient)
  }, [isRestorePending, isOnline, queryClient])

  return null
}
