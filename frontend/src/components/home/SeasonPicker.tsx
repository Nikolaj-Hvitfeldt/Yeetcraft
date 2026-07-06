import type { SeasonSummary } from '../../api/types'

export function SeasonPicker({ seasons, selectedSeasonId, onSeasonChange }: SeasonPickerProps) {
  return (
    <label className="relative block">
      <span className="sr-only">Season</span>
      <select
        value={selectedSeasonId}
        onChange={(event) => onSeasonChange(event.target.value)}
        className="h-9 min-w-[199px] appearance-none rounded-md border border-border-subtle bg-surface-section px-md py-sm pr-3xl text-xs font-semibold text-text-primary shadow-lg outline-none transition-colors hover:border-accent-primary focus:border-accent-primary"
      >
        {seasons.map((season) => (
          <option key={season.id} value={season.id}>
            {season.name}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-md top-1/2 -translate-y-1/2 text-base leading-none text-text-secondary">
        &rsaquo;
      </span>
    </label>
  )
}

interface SeasonPickerProps {
  seasons: SeasonSummary[]
  selectedSeasonId: string
  onSeasonChange: (seasonId: string) => void
}
