import { useEffect, useRef, useState } from 'react'
import { useReportPageConnection } from './connection-status-context'
import { useConnectionPageState } from './connection-status-context'
import { COLD_START_MESSAGE_DELAY_MS } from '../lib/connection-state'

export type LocalOutboxScope = {
  playerId: string
  seasonId: string
}

export type PageConnectionInput = {
  hasCachedData: boolean
  isFetching: boolean
  isPending: boolean
  isError: boolean
  hasRecoverableError?: boolean
  localOutboxScope?: LocalOutboxScope
  onRetry?: () => void
}

const RECONNECT_BANNER_MAX_MS = 10_000

export function useConnectionTimingSignals(isOnline: boolean, isFetchActive: boolean) {
  const slowFetch = useSlowFetch(isFetchActive)
  const justReconnected = useJustReconnected(isOnline, isFetchActive)

  return { slowFetch, justReconnected }
}

function useJustReconnected(isOnline: boolean, isFetchActive: boolean): boolean {
  const wasOfflineRef = useRef(false)
  const reconnectFetchStartedRef = useRef(false)
  const [justReconnected, setJustReconnected] = useState(false)

  useEffect(() => {
    if (!isOnline) {
      wasOfflineRef.current = true
      reconnectFetchStartedRef.current = false
      setJustReconnected(false)
      return
    }

    if (wasOfflineRef.current) {
      wasOfflineRef.current = false
      reconnectFetchStartedRef.current = false
      setJustReconnected(true)
    }
  }, [isOnline])

  useEffect(() => {
    if (!justReconnected) return

    if (isFetchActive) {
      reconnectFetchStartedRef.current = true
    }

    if (reconnectFetchStartedRef.current && !isFetchActive) {
      setJustReconnected(false)
      reconnectFetchStartedRef.current = false
    }
  }, [justReconnected, isFetchActive])

  useEffect(() => {
    if (!justReconnected) return

    const timeout = window.setTimeout(() => {
      setJustReconnected(false)
      reconnectFetchStartedRef.current = false
    }, RECONNECT_BANNER_MAX_MS)

    return () => window.clearTimeout(timeout)
  }, [justReconnected])

  return justReconnected
}

function useSlowFetch(
  isActive: boolean,
  thresholdMs = COLD_START_MESSAGE_DELAY_MS,
): boolean {
  const [isSlow, setIsSlow] = useState(false)

  useEffect(() => {
    if (!isActive) {
      setIsSlow(false)
      return
    }

    const timer = window.setTimeout(() => setIsSlow(true), thresholdMs)
    return () => window.clearTimeout(timer)
  }, [isActive, thresholdMs])

  return isSlow
}

export function usePageConnection(input: PageConnectionInput) {
  useReportPageConnection(input)
  return useConnectionPageState()
}
