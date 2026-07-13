import type { DungeonMeatGrinderSummary, DungeonReputationScores } from '../../utils/dungeon-stats'
import { Tag } from '../ui/Tag'
import { ReputationCard } from './ReputationCard'

const DANGER_TOOLTIP =
  "Uses this dungeon's total mistakes, deaths plus yeets, compared against the average mistakes per dungeon this season. A high score means this dungeon is above your group's normal pain level; a low score means it has been relatively safe."

const YEET_FACTOR_TOOLTIP =
  "This dungeon's yeet share compared with the season-wide yeet share."

const BLAME_SHARE_TOOLTIP =
  "How much of this dungeon's chaos comes from the top offender."

export function DungeonReputationSection({
  summary,
  scores,
}: DungeonReputationSectionProps) {
  const cleanPlayerLabel = summary.cleanPlayers === 1 ? 'clean player' : 'clean players'

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

          <div className="flex flex-wrap gap-sm pt-lg">
            <Tag>
              {summary.cleanPlayers} {cleanPlayerLabel}
            </Tag>
            <Tag>{summary.yeetSharePercent}% yeet share</Tag>
            <Tag>{summary.averageMistakesPerDungeon} avg mistakes / dungeon</Tag>
          </div>
        </div>

        <div className="flex flex-col gap-lg">
          <ReputationCard
            title="Danger Rating"
            description="Total mistakes here compared with the average dungeon this season."
            score={scores.dangerRating}
            progressPercent={scores.dangerRating}
            infoTooltip={DANGER_TOOLTIP}
          />
          <ReputationCard
            title="Yeet Factor"
            description="This dungeon's yeet share compared with the season-wide yeet share."
            score={scores.yeetFactor}
            progressPercent={scores.yeetFactor}
            infoTooltip={YEET_FACTOR_TOOLTIP}
          />
          <ReputationCard
            title="Blame Share"
            description="How much of this dungeon's chaos comes from the top offender."
            score={scores.blameShare}
            progressPercent={scores.blameShare}
            infoTooltip={BLAME_SHARE_TOOLTIP}
          />
        </div>
      </div>
    </section>
  )
}

interface DungeonReputationSectionProps {
  summary: DungeonMeatGrinderSummary
  scores: DungeonReputationScores
}
