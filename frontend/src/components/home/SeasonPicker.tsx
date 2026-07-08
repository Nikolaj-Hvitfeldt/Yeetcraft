import { useEffect, useRef, useState } from 'react'
import type { SeasonSummary } from '../../api/types'

function getSeasonLabel(season: SeasonSummary): string {
  return season.expansion ? `${season.expansion} ${season.name}` : season.name
}

export function SeasonPicker({
  seasons,
  selectedSeasonId,
  onSeasonChange,
  fluid = false,
}: SeasonPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)
  const selectedSeason = seasons.find((season) => season.id === selectedSeasonId)

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!pickerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  function handleSeasonSelect(seasonId: string) {
    onSeasonChange(seasonId)
    setIsOpen(false)
  }

  return (
    <div ref={pickerRef} className={`relative h-9 ${fluid ? 'w-full' : 'w-[199px]'}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="flex h-9 w-full items-center justify-between rounded-md border border-border-subtle bg-surface-section py-0 pl-[11px] pr-[12px] text-left text-xs font-semibold leading-9 text-text-primary shadow-[0px_20px_12.5px_0px_rgba(0,0,0,0.2),0px_8px_5px_0px_rgba(0,0,0,0.2)] outline-none transition-colors hover:border-accent-primary focus:border-accent-primary"
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className="truncate">
          {selectedSeason ? getSeasonLabel(selectedSeason) : 'Select season'}
        </span>
        <ChevronIcon className={`ml-sm size-4 shrink-0 text-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute right-0 top-[44px] z-20 overflow-hidden rounded-md border border-border-subtle bg-surface-section shadow-[0px_20px_12.5px_0px_rgba(0,0,0,0.2),0px_8px_5px_0px_rgba(0,0,0,0.2)] ${fluid ? 'w-full' : 'w-[199px]'}`}>
          <ul role="listbox" aria-label="Season" className="max-h-56 overflow-y-auto p-xs">
            {seasons.map((season) => {
              const isSelected = season.id === selectedSeasonId

              return (
                <li key={season.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={`flex w-full items-center rounded-sm px-sm py-sm text-left text-xs font-semibold transition-colors ${
                      isSelected
                        ? 'bg-accent-secondary text-background-app'
                        : 'text-text-primary hover:bg-surface-base'
                    }`}
                    onClick={() => handleSeasonSelect(season.id)}
                  >
                    {getSeasonLabel(season)}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 16 16"
    >
      <path
        d="M4 6L8 10L12 6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  )
}

interface SeasonPickerProps {
  seasons: SeasonSummary[]
  selectedSeasonId: string
  onSeasonChange: (seasonId: string) => void
  fluid?: boolean
}
