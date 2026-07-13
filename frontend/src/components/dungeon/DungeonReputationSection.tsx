import {
  getReputationVerdicts,
  type DungeonMeatGrinderSummary,
  type DungeonReputationScores,
} from '../../utils/dungeon-stats'
import {
  DUNGEON_REPUTATION_METRICS,
  getReputationScoreForMetric,
} from '../../utils/dungeon-reputation-metrics'
import { ReputationCard } from './ReputationCard'

export function DungeonReputationSection({
  summary,
  scores,
  dungeonTotalMistakes,
  dungeonTotalYeets,
}: DungeonReputationSectionProps) {
  const verdicts = getReputationVerdicts(scores, {
    totalMistakes: dungeonTotalMistakes,
    totalYeets: dungeonTotalYeets,
  })

  return (
    <section className="rounded-3xl border border-accent-secondary bg-surface-section p-xl">
      <div className="grid gap-xl lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div>
          <p className="text-xs font-bold uppercase leading-4 tracking-[0.2em] text-accent-primary">
            Dungeon reputation
          </p>
          <h2 className="pt-sm font-heading text-4xl font-bold leading-[42px] text-text-primary">
            {summary.title}
          </h2>
          <p className="max-w-xl pt-md text-sm leading-5 text-text-secondary">{summary.narrative}</p>

          <ul className="flex max-w-xl flex-col gap-sm pt-lg">
            {verdicts.map((verdict) => (
              <li
                key={verdict}
                className="flex gap-sm text-sm leading-5 text-text-secondary"
              >
                <span
                  className="mt-[7px] size-1.5 shrink-0 rounded-full bg-accent-primary"
                  aria-hidden="true"
                />
                {verdict}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-lg">
          {DUNGEON_REPUTATION_METRICS.map((metric) => {
            const score = getReputationScoreForMetric(scores, metric.id)

            return (
              <ReputationCard
                key={metric.id}
                title={metric.title}
                description={metric.description}
                score={score}
                progressPercent={score}
                infoTooltip={metric.infoTooltip}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}

interface DungeonReputationSectionProps {
  summary: DungeonMeatGrinderSummary
  scores: DungeonReputationScores
  dungeonTotalMistakes: number
  dungeonTotalYeets: number
}
