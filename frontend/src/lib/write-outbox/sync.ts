import type { QueryClient } from '@tanstack/react-query'
import { getUserFacingErrorMessage, isRetryableError } from '../../utils/api-error'
import { getAccessToken } from '../../utils/token'
import { writeHandlers } from './handlers'
import { invalidateSetPlayerStatsQueries } from './reconcile-queries'
import {
  findWriteByDedupeKey,
  getOutboxWrites,
  initWriteOutboxStore,
  removeWriteByDedupeKey,
  resetFailedWritesForManualRetry,
  resetWriteForManualRetry,
  updateWrite,
} from './store'
import type { PendingWrite } from './types'

export const MAX_AUTO_SYNC_ATTEMPTS = 5
export const OUTBOX_SYNC_LOCK_NAME = 'yeetcraft-outbox-sync'

const BASE_RETRY_DELAY_MS = 2_000
const MAX_RETRY_DELAY_MS = 30_000

let activeSync: Promise<void> | null = null
let syncGeneration = 0

function getRetryDelayMs(attempts: number): number {
  return Math.min(MAX_RETRY_DELAY_MS, BASE_RETRY_DELAY_MS * 2 ** attempts)
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function getAuthScopeMismatchMessage(): string {
  return 'Saved under a different access link. Restore the original link to sync.'
}

const MISSING_ACCESS_LINK_MESSAGE = 'Missing access link. Use the shared link to sync.'

type WriteAttemptEligibility = {
  attempt: boolean
  reason?: string
  stayPending?: boolean
}

function shouldAttemptWrite(write: PendingWrite): WriteAttemptEligibility {
  const currentToken = getAccessToken()

  if (!currentToken) {
    return {
      attempt: false,
      reason: MISSING_ACCESS_LINK_MESSAGE,
      stayPending: true,
    }
  }

  if (write.authScope === null) {
    return {
      attempt: false,
      reason: MISSING_ACCESS_LINK_MESSAGE,
      stayPending: true,
    }
  }

  if (write.authScope !== currentToken) {
    return { attempt: false, reason: getAuthScopeMismatchMessage() }
  }

  if (write.status === 'failed') {
    return { attempt: false }
  }

  if (write.status === 'syncing') {
    return { attempt: false }
  }

  if (write.attempts >= MAX_AUTO_SYNC_ATTEMPTS) {
    return { attempt: false, reason: 'Automatic sync attempts exhausted. Retry manually.' }
  }

  return { attempt: true }
}

async function runWithOptionalLock(task: () => Promise<void>): Promise<void> {
  if (typeof navigator !== 'undefined' && 'locks' in navigator && navigator.locks?.request) {
    await navigator.locks.request(OUTBOX_SYNC_LOCK_NAME, task)
    return
  }

  await task()
}

async function releaseStaleSyncingWrite(
  write: PendingWrite,
  syncedUpdatedAt: string,
): Promise<void> {
  const current = findWriteByDedupeKey(write.dedupeKey)
  if (!current || current.id !== write.id || current.status !== 'syncing') return
  if (current.updatedAt !== syncedUpdatedAt) {
    await updateWrite(current.id, { status: 'pending' })
  }
}

async function processWrite(
  queryClient: QueryClient,
  write: PendingWrite,
  generation: number,
): Promise<void> {
  const eligibility = shouldAttemptWrite(write)
  if (!eligibility.attempt) {
    if (eligibility.reason && write.status === 'pending' && !eligibility.stayPending) {
      await updateWrite(write.id, {
        status: 'failed',
        lastError: eligibility.reason,
      })
    }
    return
  }

  const syncedUpdatedAt = write.updatedAt
  await updateWrite(write.id, { status: 'syncing', updatedAt: syncedUpdatedAt })

  try {
    const handler = writeHandlers[write.type]
    await handler(write)

    if (generation !== syncGeneration) {
      await releaseStaleSyncingWrite(write, syncedUpdatedAt)
      return
    }

    const current = findWriteByDedupeKey(write.dedupeKey)
    if (!current) return

    if (current.updatedAt !== syncedUpdatedAt) {
      if (current.status !== 'failed') {
        await updateWrite(current.id, { status: 'pending' })
      }
      return
    }

    await removeWriteByDedupeKey(write.dedupeKey)
    if (write.type === 'set-player-stats') {
      await invalidateSetPlayerStatsQueries(queryClient, write.payload)
    }
  } catch (error) {
    if (generation !== syncGeneration) {
      await releaseStaleSyncingWrite(write, syncedUpdatedAt)
      return
    }

    const current = findWriteByDedupeKey(write.dedupeKey)
    if (!current || current.updatedAt !== syncedUpdatedAt) {
      if (current?.status === 'syncing') {
        await updateWrite(current.id, { status: 'pending' })
      }
      return
    }

    const message = getUserFacingErrorMessage(error)
    const nextAttempts = write.attempts + 1

    if (!isRetryableError(error)) {
      await updateWrite(write.id, {
        status: 'failed',
        attempts: nextAttempts,
        lastError: message,
      })
      return
    }

    if (nextAttempts >= MAX_AUTO_SYNC_ATTEMPTS) {
      await updateWrite(write.id, {
        status: 'failed',
        attempts: nextAttempts,
        lastError: message,
      })
      return
    }

    await updateWrite(write.id, {
      status: 'pending',
      attempts: nextAttempts,
      lastError: message,
    })

    await sleep(getRetryDelayMs(nextAttempts))
  }
}

async function runSyncLoop(queryClient: QueryClient, generation: number): Promise<void> {
  await initWriteOutboxStore()

  const pendingWrites = getOutboxWrites().filter((write) => write.status === 'pending')

  for (const write of pendingWrites) {
    if (generation !== syncGeneration) return
    await processWrite(queryClient, write, generation)
  }
}

export async function syncOutbox(queryClient: QueryClient): Promise<void> {
  if (activeSync) {
    return activeSync
  }

  const generation = ++syncGeneration

  activeSync = runWithOptionalLock(async () => {
    await runSyncLoop(queryClient, generation)
  }).finally(() => {
    activeSync = null
  })

  return activeSync
}

export async function retryOutboxSync(
  queryClient: QueryClient,
  writeId?: string,
): Promise<void> {
  if (writeId) {
    await resetWriteForManualRetry(writeId)
  } else {
    await resetFailedWritesForManualRetry()
  }
  await syncOutbox(queryClient)
}

export function __resetOutboxSyncForTests(): void {
  activeSync = null
  syncGeneration = 0
}

export async function __processWriteForTests(
  queryClient: QueryClient,
  write: PendingWrite,
  generation: number,
): Promise<void> {
  await processWrite(queryClient, write, generation)
}
