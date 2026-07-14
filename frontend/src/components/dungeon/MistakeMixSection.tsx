import type { DungeonMistakeMix } from '../../utils/dungeon-stats'

export function MistakeMixSection({ mix }: MistakeMixSectionProps) {
  return (
    <section className="rounded-3xl border border-accent-secondary bg-surface-section p-xl">
      <h2 className="font-heading text-2xl font-bold leading-8 text-text-primary">Mistake mix</h2>

      <div
        className="mt-lg flex h-5 overflow-hidden rounded-pill bg-overlay-dark"
        role="img"
        aria-label={`Deaths ${mix.deathsPercent}%, Yeets ${mix.yeetsPercent}%`}
      >
        <div className="h-full bg-stat-total" style={{ width: `${mix.deathsPercent}%` }} />
        <div className="h-full bg-accent-purple" style={{ width: `${mix.yeetsPercent}%` }} />
      </div>

      <div className="flex items-center justify-between pt-md text-sm leading-5 text-text-secondary">
        <span>Deaths {mix.deathsPercent}%</span>
        <span>Yeets {mix.yeetsPercent}%</span>
      </div>
    </section>
  )
}

interface MistakeMixSectionProps {
  mix: DungeonMistakeMix
}
