import { useEffect, useRef, useState } from 'react'
import { useReportPageConnection } from './connection-status-context'
import { useConnectionPageState } from './connection-status-context'
import { COLD_START_MESSAGE_DELAY_MS } from '../lib/connection-state'

export type PageConnectionInput = {
  hasCachedData: boolean
  isFetching: boolean
  isPending: boolean
  isError: boolean
  onRetry?: () => void
}

export function useConnectionTimingSignals(isOnline: boolean, isFetchActive: boolean) {
  const slowFetch = useSlowFetch(isFetchActive)
  const justReconnected = useJustReconnected(isOnline, isFetchActive)

  return { slowFetch, justReconnected }
}

function useJustReconnected(isOnline: boolean, isFetchActive: boolean): boolean {
  const wasOfflineRef = useRef(false)
  const [justReconnected, setJustReconnected] = useState(false)

  useEffect(() => {
    if (!isOnline) {
      wasOfflineRef.current = true
      setJustReconnected(false)
      return
    }

    if (wasOfflineRef.current) {
      wasOfflineRef.current = false
      setJustReconnected(true)
    }
  }, [isOnline])

  useEffect(() => {
    if (justReconnected && !isFetchActive) {
      setJustReconnected(false)
    }
  }, [justReconnected, isFetchActive])

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
