import type { QueryClient } from '@tanstack/react-query'
import { getUserFacingErrorMessage, isRetryableError } from '../../utils/api-error'
import { getAccessToken } from '../../utils/token'
import { writeHandlers } from './handlers'
import { invalidateSetPlayerStatsQueries } from './reconcile-queries'
import {
  getOutboxWrites,
  initWriteOutboxStore,
  removeWriteByDedupeKey,
  resetFailedWritesForManualRetry,
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

function shouldAttemptWrite(write: PendingWrite): { attempt: boolean; reason?: string } {
  const currentToken = getAccessToken()

  if (!currentToken) {
    return { attempt: false, reason: 'Missing access link. Use the shared link to sync.' }
  }

  if (write.authScope !== null && write.authScope !== currentToken) {
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

async function processWrite(
  queryClient: QueryClient,
  write: PendingWrite,
  generation: number,
): Promise<void> {
  const eligibility = shouldAttemptWrite(write)
  if (!eligibility.attempt) {
    if (eligibility.reason && write.status === 'pending') {
      await updateWrite(write.id, {
        status: 'failed',
        lastError: eligibility.reason,
      })
    }
    return
  }

  await updateWrite(write.id, { status: 'syncing' })

  try {
    const handler = writeHandlers[write.type]
    await handler(write)

    if (generation !== syncGeneration) return

    await removeWriteByDedupeKey(write.dedupeKey)
    if (write.type === 'set-player-stats') {
      await invalidateSetPlayerStatsQueries(queryClient, write.payload)
    }
  } catch (error) {
    if (generation !== syncGeneration) return

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

  const pendingWrites = getOutboxWrites().filter(
    (write) => write.status === 'pending' || write.status === 'syncing',
  )

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

export async function retryOutboxSync(queryClient: QueryClient): Promise<void> {
  await resetFailedWritesForManualRetry()
  await syncOutbox(queryClient)
}

export function hasFailedOutboxWrites(): boolean {
  return getOutboxWrites().some((write) => write.status === 'failed')
}

export function getFailedOutboxWrites(): readonly PendingWrite[] {
  return getOutboxWrites().filter((write) => write.status === 'failed')
}

export function __resetOutboxSyncForTests(): void {
  activeSync = null
  syncGeneration = 0
}
