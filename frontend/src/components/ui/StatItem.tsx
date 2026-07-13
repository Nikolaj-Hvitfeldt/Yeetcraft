import { InfoTooltip } from './InfoTooltip'
import { STAT_COLOR_BY_KIND, type StatKind } from '../../utils/stat-colors'

const COLOR_CLASS_BY_KIND: Record<StatItemKind, string> = {
  ...STAT_COLOR_BY_KIND,
  default: 'text-text-primary',
}

export function StatItem({
  label,
  value,
  kind = 'default',
  variant = 'card',
  className,
  infoTooltip,
}: StatItemProps) {
  const colorClassName = COLOR_CLASS_BY_KIND[kind]

  if (variant === 'inline') {
    return (
      <div className={`min-w-16 px-md py-sm text-center ${className ?? ''}`}>
        <p className={`font-number text-xl font-bold leading-6 ${colorClassName}`}>{value}</p>
        <p className="text-[10px] leading-[14px] text-text-secondary">{label}</p>
      </div>
    )
  }

  return (
    <div
      className={`flex h-[73px] min-w-[12rem] flex-col justify-center overflow-visible rounded-2xl border border-border-subtle bg-surface-base p-md ${className ?? ''}`}
    >
      <p className={`font-number text-2xl font-bold leading-7 ${colorClassName}`}>{value}</p>
      <div className="flex items-center">
        <p className="text-[10px] leading-[14px] text-text-secondary">{label}</p>
        {infoTooltip ? (
          <InfoTooltip content={infoTooltip} label={`About ${label}`} />
        ) : null}
      </div>
    </div>
  )
}

export type StatItemKind = StatKind | 'default'

interface StatItemProps {
  label: string
  value: number | string
  kind?: StatItemKind
  variant?: 'card' | 'inline'
  className?: string
  infoTooltip?: string
}
