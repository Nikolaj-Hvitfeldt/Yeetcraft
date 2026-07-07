export function AchievementCard({ icon, title, description, className }: AchievementCardProps) {
  return (
    <article
      className={`flex h-[74px] items-start gap-md rounded-2xl border border-border-subtle bg-surface-base p-md ${className ?? ''}`}
    >
      <span className="text-2xl leading-8" aria-hidden="true">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-base font-bold leading-[22px] text-text-primary">{title}</p>
        <p className="text-sm leading-5 text-text-secondary">{description}</p>
      </div>
    </article>
  )
}

interface AchievementCardProps {
  icon: string
  title: string
  description: string
  className?: string
}
