import { Link } from 'react-router-dom'
import type { DungeonSummary } from '../../api/types'
import type { DungeonBannerSeasonKey } from '../../assets/dungeon-images'
import { cn } from '../../utils/cn'
import { getDungeonBannerImage } from '../../utils/dungeon-image'
import { seasonPath } from '../../utils/season'

export function DungeonCard({ dungeon, seasonId, bannerSeasonKey }: DungeonCardProps) {
  const to = seasonPath(`/dungeon/${dungeon.id}`, seasonId)
  const bannerImageUrl = bannerSeasonKey
    ? getDungeonBannerImage(bannerSeasonKey, dungeon)
    : null

  return (
    <Link
      to={to}
      className={cn(
        'group relative flex h-14 w-full items-center justify-between overflow-hidden rounded-2xl border px-md text-left transition-colors',
        bannerImageUrl
          ? 'border-border-subtle hover:border-accent-primary'
          : 'border-border-subtle bg-surface-base hover:border-accent-primary',
      )}
    >
      {bannerImageUrl ? (
        <>
          <img
            src={bannerImageUrl}
            alt=""
            loading="lazy"
            className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/35"
            aria-hidden="true"
          />
        </>
      ) : null}

      <span
        className={cn(
          'relative z-10 min-w-0 flex-1 truncate text-sm font-semibold leading-5',
          bannerImageUrl ? 'text-white drop-shadow-sm' : 'text-text-primary',
        )}
      >
        {dungeon.name}
      </span>
      <span
        className={cn(
          'relative z-10 pl-sm text-base font-semibold leading-5',
          bannerImageUrl ? 'text-white/85' : 'text-text-secondary',
        )}
        aria-hidden="true"
      >
        &rsaquo;
      </span>
    </Link>
  )
}

interface DungeonCardProps {
  dungeon: DungeonSummary
  seasonId?: string
  bannerSeasonKey?: DungeonBannerSeasonKey
}
