import type { DungeonMistakeMix } from '../../utils/dungeon-stats'
import { DeathsYeetsBar } from '../ui/DeathsYeetsBar'

export function MistakeMixSection({ mix }: MistakeMixSectionProps) {
  return (
    <section className="rounded-3xl border border-accent-secondary bg-surface-section p-xl">
      <h2 className="font-heading text-2xl font-bold leading-8 text-text-primary">Mistake mix</h2>

      <DeathsYeetsBar
        deaths={mix.deathsPercent}
        yeets={mix.yeetsPercent}
        deathsPercent={mix.deathsPercent}
        yeetsPercent={mix.yeetsPercent}
        heightClass="h-5"
        className="mt-lg"
        aria-label={`Deaths ${mix.deathsPercent}%, Yeets ${mix.yeetsPercent}%`}
      />

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
