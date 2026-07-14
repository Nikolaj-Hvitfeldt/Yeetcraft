import type { SeasonSummary } from '../../api/types'
import { useDismissiblePopover } from '../../hooks/useDismissiblePopover'
import { formatSeasonLabel } from '../../utils/season'
import { ChevronDownIcon } from '../ui/ChevronDownIcon'
import { LISTBOX_PANEL_SHADOW } from '../ui/listbox-styles'
import { ListboxOption } from '../ui/ListboxOption'

export function SeasonPicker({
  seasons,
  selectedSeasonId,
  onSeasonChange,
  fluid = false,
}: SeasonPickerProps) {
  const { isOpen, setIsOpen, ref } = useDismissiblePopover()
  const selectedSeason = seasons.find((season) => season.id === selectedSeasonId)

  function handleSeasonSelect(seasonId: string) {
    onSeasonChange(seasonId)
    setIsOpen(false)
  }

  return (
    <div ref={ref} className={`relative h-9 ${fluid ? 'w-full' : 'w-[199px]'}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`flex h-9 w-full items-center justify-between rounded-md border border-border-subtle bg-surface-section py-0 pl-[11px] pr-[12px] text-left text-xs font-semibold leading-9 text-text-primary ${LISTBOX_PANEL_SHADOW} outline-none transition-colors hover:border-accent-primary focus:border-accent-primary`}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className="truncate">
          {selectedSeason ? formatSeasonLabel(selectedSeason) : 'Select season'}
        </span>
        <ChevronDownIcon className={`ml-sm size-4 shrink-0 text-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute right-0 top-[44px] z-20 overflow-hidden rounded-md border border-border-subtle bg-surface-section ${LISTBOX_PANEL_SHADOW} ${fluid ? 'w-full' : 'w-[199px]'}`}>
          <ul role="listbox" aria-label="Season" className="max-h-56 overflow-y-auto p-xs">
            {seasons.map((season) => (
              <ListboxOption
                key={season.id}
                isSelected={season.id === selectedSeasonId}
                onSelect={() => handleSeasonSelect(season.id)}
              >
                {formatSeasonLabel(season)}
              </ListboxOption>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

interface SeasonPickerProps {
  seasons: SeasonSummary[]
  selectedSeasonId: string
  onSeasonChange: (seasonId: string) => void
  fluid?: boolean
}
