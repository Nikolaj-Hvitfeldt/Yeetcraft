import { SkullIcon } from './SkullIcon'

export function OfflineNoCacheState() {
  return (
    <main className="flex min-h-[50vh] items-center justify-center px-2xl py-4xl">
      <div className="max-w-md rounded-3xl border border-border-subtle bg-surface-section px-2xl py-4xl text-center">
        <SkullIcon className="mx-auto mb-md size-10 opacity-40 text-text-secondary" />
        <h1 className="font-heading text-2xl font-bold text-text-primary">
          No saved data yet
        </h1>
        <p className="pt-md text-sm leading-5 text-text-secondary">
          YeetCraft needs one successful online visit before it can show saved
          stats offline. Connect to the internet and open the app again.
        </p>
      </div>
    </main>
  )
}
