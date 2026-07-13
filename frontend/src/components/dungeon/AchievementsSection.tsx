import type { DungeonAchievement } from '../../utils/dungeon-stats'
import { cn } from '../../utils/cn'
import { AchievementBanner } from './AchievementBanner'

export function AchievementsSection({ achievements, className }: AchievementsSectionProps) {
  return (
    <section
      className={cn(
        'rounded-3xl border border-accent-secondary bg-surface-section p-xl',
        className,
      )}
    >
      <h2 className="font-heading text-2xl font-bold leading-8 text-text-primary">Achievements</h2>

      <div className="flex min-w-0 flex-col gap-md pt-lg">
        {achievements.map((achievement) => (
          <AchievementBanner
            key={achievement.title}
            icon={achievement.icon}
            title={achievement.title}
            holder={achievement.holder}
            description={achievement.description}
          />
        ))}
      </div>
    </section>
  )
}

interface AchievementsSectionProps {
  achievements: DungeonAchievement[]
  className?: string
}
