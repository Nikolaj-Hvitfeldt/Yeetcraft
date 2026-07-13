import type { DungeonSummary, SeasonSummary } from '../../api/types'
import { StatCard } from '../home/StatCard'
import { DungeonPicker } from './DungeonPicker'

export function DungeonHeroSection({
  dungeon,
  season,
  dungeons,
  bannerImageUrl,
}: DungeonHeroSectionProps) {
  const seasonLabel = season
    ? [season.name, season.expansion].filter(Boolean).join(' · ')
    : null

  return (
    <section className="relative overflow-hidden rounded-[32px] border border-accent-secondary bg-surface-section shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)]">
      <div className="relative p-2xl lg:pr-[360px]">
        <div className="max-w-3xl">
          <DungeonPicker
            dungeons={dungeons}
            selectedDungeonId={dungeon.id}
            season={season}
          />

          <p className="pt-lg text-xs font-bold uppercase leading-4 tracking-[0.2em] text-accent-primary">
            Dungeon details{seasonLabel ? ` · ${seasonLabel}` : ''}
          </p>

          <h1 className="pt-sm font-heading text-4xl font-bold leading-tight text-text-primary sm:text-5xl lg:text-6xl">
            {dungeon.name}
          </h1>

          <p className="max-w-xl pt-md text-sm leading-5 text-text-secondary">
            A focused shame archive for this key: who fell over, who got launched, and who
            somehow escaped the dungeon with dignity intact.
          </p>

          <div className="flex max-w-[576px] flex-wrap gap-x-[84px] gap-y-lg pt-2xl">
            <StatCard label="Total" value={dungeon.totalMistakes} kind="total" />
            <StatCard label="Deaths" value={dungeon.totalDeaths} kind="deaths" />
            <StatCard label="Yeets" value={dungeon.totalYeets} kind="yeets" />
          </div>
        </div>

        <div className="mt-xl overflow-hidden rounded-2xl border border-accent-primary bg-accent-primary lg:absolute lg:right-2xl lg:top-2xl lg:mt-0 lg:h-40 lg:w-80">
          {bannerImageUrl ? (
            <img
              src={bannerImageUrl}
              alt={`${dungeon.name} dungeon screenshot`}
              className="aspect-[2/1] size-full object-cover lg:aspect-auto"
            />
          ) : (
            <div
              className="aspect-[2/1] size-full bg-gradient-to-br from-accent-primary/20 via-accent-purple/10 to-surface-base lg:aspect-auto"
              aria-hidden="true"
            />
          )}
        </div>
      </div>
    </section>
  )
}

interface DungeonHeroSectionProps {
  dungeon: DungeonSummary
  season?: SeasonSummary
  dungeons: DungeonSummary[]
  bannerImageUrl?: string | null
}
