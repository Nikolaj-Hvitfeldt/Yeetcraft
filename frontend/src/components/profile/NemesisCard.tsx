import type { DungeonStats } from '../../api/types'
import { StatItem } from '../ui/StatItem'

export function NemesisCard({
  dungeon,
  sharePercent,
  bannerImageUrl,
  className,
}: NemesisCardProps) {
  return (
    <article
      className={`overflow-visible rounded-3xl border border-accent-secondary bg-surface-section shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] ${className ?? ''}`}
    >
      <div className="grid gap-xl p-xl lg:grid-cols-[280px_1fr]">
        <div className="relative overflow-hidden rounded-2xl border border-accent-primary bg-accent-primary">
          {bannerImageUrl ? (
            <img
              src={bannerImageUrl}
              alt=""
              className="aspect-[4/3] size-full object-cover"
            />
          ) : (
            <div className="aspect-[4/3] w-full bg-accent-primary" aria-hidden="true" />
          )}
        </div>

        <div className="flex flex-col gap-xl">
          <div>
            <p className="text-xs font-bold leading-4 text-accent-primary">
              Nemesis Dungeon
            </p>
            <h2 className="pt-xs font-heading text-4xl font-bold leading-[42px] text-text-primary">
              {dungeon.dungeon.name}
            </h2>
            <p className="pt-sm text-sm leading-5 text-text-secondary">
              This dungeon accounted for {sharePercent}% of their mistakes.
            </p>
          </div>

          <div className="grid gap-md sm:grid-cols-2 xl:grid-cols-4">
            <StatItem
              label="Total"
              value={dungeon.totalMistakes}
              kind="total"
            />
            <StatItem label="Deaths" value={dungeon.deaths} kind="deaths" />
            <StatItem label="Yeets" value={dungeon.yeets} kind="yeets" />
            <StatItem
              label="Nemesis share"
              value={`${sharePercent}%`}
              kind="default"
              infoTooltip="The percentage of this player's total season mistakes that happened in this dungeon."
            />
          </div>
        </div>
      </div>
    </article>
  )
}

interface NemesisCardProps {
  dungeon: DungeonStats
  sharePercent: number
  bannerImageUrl?: string | null
  className?: string
}
