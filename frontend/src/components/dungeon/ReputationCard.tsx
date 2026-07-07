export function ReputationCard({
  title,
  description,
  score,
  progressPercent,
  className,
}: ReputationCardProps) {
  return (
    <article
      className={`rounded-2xl border border-border-subtle bg-surface-base p-lg ${className ?? ''}`}
    >
      <div className="flex items-start justify-between gap-lg">
        <div className="min-w-0">
          <p className="text-base font-bold leading-[22px] text-text-primary">{title}</p>
          <p className="pt-xs text-xs leading-4 text-text-secondary">{description}</p>
        </div>
        <p className="shrink-0 font-number text-2xl font-bold leading-7 text-text-primary">
          {score}
        </p>
      </div>
      <div className="mt-sm h-2.5 overflow-hidden rounded-pill bg-overlay-dark">
        <div
          className="h-full rounded-pill bg-gradient-to-r from-stat-total to-accent-secondary"
          style={{ width: `${Math.min(Math.max(progressPercent, 0), 100)}%` }}
        />
      </div>
    </article>
  )
}

interface ReputationCardProps {
  title: string
  description: string
  score: number
  progressPercent: number
  className?: string
}
