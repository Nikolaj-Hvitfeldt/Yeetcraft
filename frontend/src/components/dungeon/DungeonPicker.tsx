import { useNavigate } from 'react-router-dom'
import type { DungeonSummary, SeasonSummary } from '../../api/types'
import type { DungeonDetailLocationState } from '../../utils/routes'
import { buildDungeonPath } from '../../utils/routes'
import { useDismissiblePopover } from '../../hooks/useDismissiblePopover'
import { ChevronDownIcon } from '../ui/ChevronDownIcon'

export function DungeonPicker({
  dungeons,
  selectedDungeonId,
  season,
  navigationState,
}: DungeonPickerProps) {
  const { isOpen, setIsOpen, ref } = useDismissiblePopover()
  const navigate = useNavigate()
  const selectedDungeon = dungeons.find((dungeon) => dungeon.id === selectedDungeonId)

  function handleDungeonSelect(dungeon: DungeonSummary) {
    if (!season) return
    navigate(buildDungeonPath(season, dungeon), {
      replace: true,
      state: navigationState,
    })
    setIsOpen(false)
  }

  return (
    <div ref={ref} className="relative h-9 min-w-[183px] max-w-[240px]">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="flex h-9 w-full items-center justify-between rounded-md border border-border-subtle bg-surface-section py-0 pl-[11px] pr-[12px] text-left text-[13px] font-semibold text-text-primary shadow-[0px_20px_12.5px_0px_rgba(0,0,0,0.2),0px_8px_5px_0px_rgba(0,0,0,0.2)] outline-none transition-colors hover:border-accent-primary focus:border-accent-primary"
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className="truncate">{selectedDungeon?.name ?? 'Select dungeon'}</span>
        <ChevronDownIcon className={`ml-sm size-4 shrink-0 text-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen ? (
        <div className="absolute left-0 top-[44px] z-20 w-full min-w-[220px] rounded-md border border-border-subtle bg-surface-section shadow-[0px_20px_12.5px_0px_rgba(0,0,0,0.2),0px_8px_5px_0px_rgba(0,0,0,0.2)]">
          <ul
            role="listbox"
            aria-label="Dungeon"
            className="max-h-56 overflow-y-auto overscroll-contain rounded-[calc(0.375rem-1px)] p-xs pr-1"
          >
            {dungeons.map((dungeon) => {
              const isSelected = dungeon.id === selectedDungeonId

              return (
                <li key={dungeon.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={`flex w-full items-center rounded-sm px-sm py-sm text-left text-xs font-semibold transition-colors ${
                      isSelected
                        ? 'bg-accent-secondary text-background-app'
                        : 'text-text-primary hover:bg-surface-base'
                    }`}
                    onClick={() => handleDungeonSelect(dungeon)}
                  >
                    {dungeon.name}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

interface DungeonPickerProps {
  dungeons: DungeonSummary[]
  selectedDungeonId: string
  season?: SeasonSummary
  navigationState?: DungeonDetailLocationState | null
}
