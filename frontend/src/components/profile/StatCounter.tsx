import { cn } from '../../utils/cn'
import { STAT_COLOR_BY_KIND, type StatKind } from '../../utils/stat-colors'

type StatCounterField = Exclude<StatKind, 'total'>

export function StatCounter({
  value,
  field,
  onDelta,
  disabled = false,
  className,
}: StatCounterProps) {
  const colorClass = STAT_COLOR_BY_KIND[field]
  const isMinusDisabled = disabled || value <= 0

  return (
    <div
      className={cn(
        'flex h-[34px] w-[88px] items-center justify-between gap-xs rounded-sm border border-border-subtle px-xs',
        className,
      )}
    >
      <button
        type="button"
        aria-label={`Decrease ${field}`}
        disabled={isMinusDisabled}
        onClick={() => onDelta(-1)}
        className={cn(
          'flex h-full w-7 items-center justify-center text-text-secondary transition-opacity disabled:cursor-not-allowed',
          isMinusDisabled ? 'opacity-40' : 'opacity-100',
        )}
      >
        &minus;
      </button>

      <p className={cn('w-[32px] text-center font-number text-sm leading-[18px]', colorClass)}>
        {value}
      </p>

      <button
        type="button"
        aria-label={`Increase ${field}`}
        disabled={disabled}
        onClick={() => onDelta(1)}
        className={cn(
          'flex h-full w-7 items-center justify-center text-text-secondary transition-opacity disabled:cursor-not-allowed',
          disabled ? 'opacity-40' : 'opacity-100',
        )}
      >
        +
      </button>
    </div>
  )
}

interface StatCounterProps {
  value: number
  field: StatCounterField
  onDelta: (delta: 1 | -1) => void
  disabled?: boolean
  className?: string
}

