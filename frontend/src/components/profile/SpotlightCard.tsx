import { SkullIcon } from '../SkullIcon'

export function SpotlightCard({
  category,
  title,
  subtitle,
  value,
  className,
}: SpotlightCardProps) {
  return (
    <article
      className={`flex h-[140px] flex-col rounded-3xl border border-border-subtle bg-surface-section p-xl ${className ?? ''}`}
    >
      <div className="flex items-center justify-between">
        <div className="rounded-2xl bg-accent-purple p-sm">
          <SkullIcon className="size-[18px] text-background-app" />
        </div>
        <p className="text-xs leading-4 text-text-secondary">{category}</p>
      </div>
      <div className="mt-lg flex items-end justify-between">
        <div>
          <p className="text-xl font-bold leading-[26px] text-text-primary">{title}</p>
          <p className="text-sm leading-5 text-text-secondary">{subtitle}</p>
        </div>
        <p className="font-number text-4xl font-bold leading-10 text-text-primary">{value}</p>
      </div>
    </article>
  )
}

interface SpotlightCardProps {
  category: string
  title: string
  subtitle: string
  value: number | string
  className?: string
}
