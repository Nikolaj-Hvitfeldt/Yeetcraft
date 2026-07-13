import { cn } from '../../utils/cn'

type StatCounterField = 'deaths' | 'yeets'

const COLOR_CLASS_BY_FIELD: Record<StatCounterField, string> = {
  deaths: 'text-stat-total',
  yeets: 'text-stat-deaths',
}

export function StatCounter({
  value,
  field,
  onDelta,
  disabled = false,
  className,
}: StatCounterProps) {
  const colorClass = COLOR_CLASS_BY_FIELD[field]
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

