import type { WowIconKey } from '../../assets/wow-icons'
import { cn } from '../../utils/cn'
import { WowIcon } from '../WowIcon'

const RANK_ICON_BY_PLACE: Record<number, WowIconKey> = {
  1: 'gold',
  2: 'silver',
  3: 'bronze',
  4: 'platinum',
}

export function RankBadge({ rank }: RankBadgeProps) {
  const rankIcon = RANK_ICON_BY_PLACE[rank]

  return (
    <div
      className={cn(
        'flex shrink-0 flex-col items-center',
        rankIcon ? 'gap-0.5' : 'size-11 justify-center',
      )}
    >
      {rankIcon ? (
        <WowIcon icon={rankIcon} size={44} objectFit="contain" className="size-11" />
      ) : null}
      <span
        className={cn(
          'font-number font-bold leading-none text-text-secondary',
          rankIcon ? 'text-xs' : 'text-sm',
        )}
      >
        {rank}
      </span>
    </div>
  )
}

interface RankBadgeProps {
  rank: number
}
