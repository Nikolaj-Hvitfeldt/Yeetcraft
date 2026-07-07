import type { DungeonStats } from '../../api/types'
import { StatItem } from '../ui/StatItem'

const BADGE_STYLES = [
  'border-accent-primary bg-[#2e1609] text-[#ff7833]',
  'border-accent-primary bg-[#00241e] text-[#00c7a8]',
  'border-accent-primary bg-[#2e2609] text-[#ffd130]',
] as const

function getDungeonInitials(name: string, shortName: string | null): string {
  if (shortName) return shortName
  return name
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 4)
    .toUpperCase()
}

export function NemesisCard({ dungeon, sharePercent, className }: NemesisCardProps) {
  const badgeClassName = BADGE_STYLES[0]
  const initials = getDungeonInitials(dungeon.dungeon.name, dungeon.dungeon.shortName)

  return (
    <article
      className={`overflow-hidden rounded-3xl border border-accent-secondary bg-surface-section shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] ${className ?? ''}`}
    >
      <div className="grid gap-xl p-xl lg:grid-cols-[280px_1fr]">
        <div className="relative overflow-hidden rounded-2xl border border-accent-primary bg-accent-primary p-lg">
          <span
            className={`inline-flex h-6 items-center justify-center rounded-[6px] border px-[6px] font-number text-xs font-bold leading-none ${badgeClassName}`}
          >
            {initials}
          </span>
          <p className="pt-xl font-heading text-2xl font-bold leading-[30px] text-text-primary">
            {dungeon.dungeon.name}
          </p>
        </div>

        <div className="flex flex-col gap-xl">
          <div>
            <p className="text-xs font-bold leading-4 text-accent-primary">Your Nemesis</p>
            <h2 className="pt-xs font-heading text-4xl font-bold leading-[42px] text-text-primary">
              {dungeon.dungeon.name}
            </h2>
            <p className="pt-sm text-sm leading-5 text-text-secondary">
              This dungeon accounted for {sharePercent}% of their mistakes.
            </p>
          </div>

          <div className="grid gap-md sm:grid-cols-2 xl:grid-cols-4">
            <StatItem label="Total" value={dungeon.totalMistakes} kind="total" />
            <StatItem label="Deaths" value={dungeon.deaths} kind="deaths" />
            <StatItem label="Yeets" value={dungeon.yeets} kind="yeets" />
            <StatItem label="Nemesis share" value={`${sharePercent}%`} kind="default" />
          </div>
        </div>
      </div>
    </article>
  )
}

interface NemesisCardProps {
  dungeon: DungeonStats
  sharePercent: number
  className?: string
}
