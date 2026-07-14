import type { DungeonDetailLocationState } from '../../utils/routes'
import { getDungeonZoneImage } from '../../utils/dungeon-zone'
import type { DungeonSummary, SeasonSummary } from '../../api/types'
import { cn } from '../../utils/cn'
import { getDungeonLore } from '../../utils/dungeon-lore'
import { StatCard } from '../home/StatCard'
import { DungeonPicker } from './DungeonPicker'

export function DungeonHeroSection({
  dungeon,
  season,
  dungeons,
  bannerImageUrl,
  navigationState,
}: DungeonHeroSectionProps) {
  const seasonLabel = season
    ? [season.name, season.expansion].filter(Boolean).join(' · ')
    : null
  const zoneImageUrl = getDungeonZoneImage(dungeon)
  const hasZoneBackdrop = Boolean(zoneImageUrl)

  return (
    <section className="relative isolate overflow-hidden rounded-[32px] border border-accent-secondary bg-surface-section shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)]">
      {zoneImageUrl ? (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${zoneImageUrl})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/15" />
        </div>
      ) : null}

      <div className="relative p-2xl lg:pr-[360px]">
        <div className="max-w-3xl">
          <DungeonPicker
            dungeons={dungeons}
            selectedDungeonId={dungeon.id}
            season={season}
            navigationState={navigationState}
          />

          <p
            className={cn(
              'pt-lg text-xs font-bold uppercase leading-4 tracking-[0.2em] text-accent-primary',
              hasZoneBackdrop && 'dungeon-hero-eyebrow',
            )}
          >
            Dungeon details{seasonLabel ? ` · ${seasonLabel}` : ''}
          </p>

          <h1
            className={cn(
              'pt-sm font-heading text-4xl font-bold leading-tight text-text-primary sm:text-5xl lg:text-6xl',
              hasZoneBackdrop && 'dungeon-hero-title',
            )}
          >
            {dungeon.name}
          </h1>

          <p
            className={cn(
              'max-w-xl pt-md text-sm leading-5 text-text-secondary',
              hasZoneBackdrop && 'dungeon-hero-lore',
            )}
          >
            {getDungeonLore(dungeon)}
          </p>
          <div className="flex max-w-[576px] flex-wrap gap-x-[84px] gap-y-lg pt-2xl">
            <StatCard label="Total" value={dungeon.totalMistakes} kind="total" />
            <StatCard label="Deaths" value={dungeon.totalDeaths} kind="deaths" />
            <StatCard label="Yeets" value={dungeon.totalYeets} kind="yeets" />
          </div>
        </div>

        <div className="mt-xl h-40 w-full shrink-0 overflow-hidden rounded-2xl border border-accent-primary bg-accent-primary lg:absolute lg:right-2xl lg:top-2xl lg:mt-0 lg:w-80">
          {bannerImageUrl ? (
            <img
              src={bannerImageUrl}
              alt={`${dungeon.name} dungeon screenshot`}
              className="size-full object-cover"
            />
          ) : (
            <div
              className="size-full bg-gradient-to-br from-accent-primary/20 via-accent-purple/10 to-surface-base"
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
  navigationState?: DungeonDetailLocationState | null
}
