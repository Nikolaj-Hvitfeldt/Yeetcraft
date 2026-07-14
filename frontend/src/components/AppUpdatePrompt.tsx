import { useEffect, useRef, useState } from 'react'
import { registerSW } from 'virtual:pwa-register'

export function AppUpdatePrompt() {
  const [needsRefresh, setNeedsRefresh] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const applyUpdateRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!import.meta.env.PROD) return

    const applyUpdate = registerSW({
      immediate: true,
      onNeedRefresh() {
        setIsDismissed(false)
        setNeedsRefresh(true)
      },
    })

    applyUpdateRef.current = () => {
      void applyUpdate(true)
    }
  }, [])

  if (!import.meta.env.PROD || !needsRefresh || isDismissed) {
    return null
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-1/2 z-50 w-[min(92vw,28rem)] -translate-x-1/2 rounded-2xl border border-border-subtle bg-surface-secondary/95 px-md py-sm shadow-lg backdrop-blur-sm"
    >
      <p className="text-sm font-semibold text-text-primary">Update available</p>
      <p className="pt-xs text-xs leading-5 text-text-secondary">
        A new version of YeetCraft is ready. Refresh when you are done editing.
      </p>
      <div className="flex gap-sm pt-sm">
        <button
          type="button"
          onClick={() => applyUpdateRef.current?.()}
          className="rounded-[20px] border border-accent-primary px-md py-xs text-xs font-semibold text-accent-primary transition-colors hover:bg-overlay-dark"
        >
          Refresh now
        </button>
        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="rounded-[20px] border border-border-subtle px-md py-xs text-xs font-semibold text-text-secondary transition-colors hover:bg-overlay-dark"
        >
          Later
        </button>
      </div>
    </div>
  )
}
