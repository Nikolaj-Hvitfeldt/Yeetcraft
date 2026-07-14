import { cn } from '../../utils/cn'

export function DeathsYeetsBar({
  deaths,
  yeets,
  deathsPercent,
  yeetsPercent,
  heightClass = 'h-2',
  className,
  'aria-label': ariaLabel,
}: DeathsYeetsBarProps) {
  const { deathsWidth, yeetsWidth } = getBarWidths(
    deaths,
    yeets,
    deathsPercent,
    yeetsPercent,
  )

  return (
    <div
      className={cn(
        'flex overflow-hidden rounded-pill bg-overlay-dark',
        heightClass,
        className,
      )}
      role="img"
      aria-label={ariaLabel}
    >
      <div className="h-full bg-stat-total" style={{ width: `${deathsWidth}%` }} />
      <div className="h-full bg-accent-purple" style={{ width: `${yeetsWidth}%` }} />
    </div>
  )
}

function getBarWidths(
  deaths: number,
  yeets: number,
  deathsPercent?: number,
  yeetsPercent?: number,
) {
  if (deathsPercent !== undefined && yeetsPercent !== undefined) {
    return { deathsWidth: deathsPercent, yeetsWidth: yeetsPercent }
  }

  const total = deaths + yeets
  if (total <= 0) return { deathsWidth: 0, yeetsWidth: 0 }

  const deathsWidth = Math.round((deaths / total) * 100)
  return { deathsWidth, yeetsWidth: 100 - deathsWidth }
}

interface DeathsYeetsBarProps {
  deaths: number
  yeets: number
  deathsPercent?: number
  yeetsPercent?: number
  heightClass?: string
  className?: string
  'aria-label'?: string
}
