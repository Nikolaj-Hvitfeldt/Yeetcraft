import type { DungeonAchievement } from '../../utils/dungeon-stats'
import { AchievementCard } from './AchievementCard'

export function AchievementsSection({ achievements }: AchievementsSectionProps) {
  return (
    <section className="rounded-3xl border border-accent-secondary bg-surface-section p-xl">
      <h2 className="font-heading text-2xl font-bold leading-8 text-text-primary">Achievements</h2>

      <div className="flex flex-col gap-md pt-lg">
        {achievements.map((achievement) => (
          <AchievementCard
            key={achievement.title}
            icon={achievement.icon}
            title={achievement.title}
            description={achievement.description}
          />
        ))}
      </div>
    </section>
  )
}

interface AchievementsSectionProps {
  achievements: DungeonAchievement[]
}
