import { useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import type { DungeonSummary } from '../../api/types'
import { useCurrentSeasonDungeons, useLeaderboard, useSeasons, deriveLeaderboard } from '../../hooks'
import { getAccessToken } from '../../utils/token'
import { AuthRequired } from '../AuthRequired'
import { ErrorMessage } from '../ErrorMessage'
import { LoadingSpinner } from '../LoadingSpinner'
import { BackButton } from '../ui/BackButton'
import { AchievementCard } from './AchievementCard'
import { ReputationCard } from './ReputationCard'

function getDangerScore(dungeon: DungeonSummary, averageMistakes: number): number {
  if (averageMistakes <= 0) return dungeon.totalMistakes > 0 ? 100 : 0
  return Math.min(Math.round((dungeon.totalMistakes / averageMistakes) * 50), 100)
}

export function DungeonDetail() {
  const { dungeonId } = useParams<{ dungeonId: string }>()
  const [searchParams] = useSearchParams()
  const selectedSeasonId = searchParams.get('seasonId') ?? undefined

  const { data: seasons = [], isLoading: isLoadingSeasons } = useSeasons()
  const {
    data: dungeons = [],
    isLoading: isLoadingDungeons,
    error: dungeonsError,
  } = useCurrentSeasonDungeons(selectedSeasonId)
  const {
    data: leaderboardEntries = [],
    isLoading: isLoadingLeaderboard,
    error: leaderboardError,
  } = useLeaderboard(selectedSeasonId)

  const dungeon = dungeons.find((entry) => entry.id === dungeonId)
  const season = seasons.find((entry) => entry.id === selectedSeasonId)
    ?? seasons.find((entry) => entry.isCurrent)
    ?? seasons[0]

  const leaderboard = useMemo(
    () => deriveLeaderboard(leaderboardEntries),
    [leaderboardEntries]
  )

  const topYeeter = leaderboard[0]
  const averageMistakes = useMemo(() => {
    if (dungeons.length === 0) return 0
    const total = dungeons.reduce((sum, entry) => sum + entry.totalMistakes, 0)
    return total / dungeons.length
  }, [dungeons])

  const hasToken = getAccessToken()
  const error = dungeonsError ?? leaderboardError
  const needsAuth = error?.message?.includes('Unauthorized') || error?.message?.includes('token')

  if (isLoadingDungeons || isLoadingSeasons || isLoadingLeaderboard) return <LoadingSpinner />
  if (needsAuth && !hasToken) return <AuthRequired />
  if (error) return <ErrorMessage message={error.message} />
  if (!dungeon) return <ErrorMessage message="Dungeon was not found." />

  const dangerScore = getDangerScore(dungeon, averageMistakes)
  const backTo = selectedSeasonId ? `/?seasonId=${selectedSeasonId}` : '/'

  return (
    <div className="min-h-screen bg-background-app px-2xl py-2xl">
      <div className="mx-auto flex max-w-5xl flex-col gap-2xl">
        <BackButton to={backTo} />

        <header className="rounded-3xl border border-border-subtle bg-surface-section p-2xl">
          <p className="text-xs font-bold uppercase leading-4 tracking-[0.2em] text-accent-primary">
            Dungeon Detail
          </p>
          <h1 className="pt-sm font-heading text-4xl font-bold leading-tight text-text-primary">
            {dungeon.name}
          </h1>
          {season ? (
            <p className="pt-sm text-sm leading-5 text-text-secondary">
              {season.expansion ? `${season.expansion} ` : ''}
              {season.name}
            </p>
          ) : null}
        </header>

        <div className="grid gap-lg lg:grid-cols-2">
          <ReputationCard
            title="Danger Rating"
            description="Total mistakes here compared with the average dungeon this season."
            score={dangerScore}
            progressPercent={dangerScore}
          />
          <AchievementCard
            icon="🚀"
            title="Orbital Launch"
            description={
              topYeeter
                ? `${topYeeter.playerName} owns the yeet narrative here.`
                : 'No yeet champion recorded yet.'
            }
          />
        </div>

        <section className="rounded-3xl border border-border-subtle bg-surface-base p-xl">
          <h2 className="font-heading text-2xl font-bold leading-8 text-text-primary">Season totals</h2>
          <div className="mt-lg grid gap-md sm:grid-cols-3">
            <div className="rounded-2xl border border-border-subtle bg-surface-section p-lg text-center">
              <p className="font-number text-3xl font-bold text-stat-total">{dungeon.totalMistakes}</p>
              <p className="pt-xs text-xs text-text-secondary">Total</p>
            </div>
            <div className="rounded-2xl border border-border-subtle bg-surface-section p-lg text-center">
              <p className="font-number text-3xl font-bold text-stat-deaths">{dungeon.totalDeaths}</p>
              <p className="pt-xs text-xs text-text-secondary">Deaths</p>
            </div>
            <div className="rounded-2xl border border-border-subtle bg-surface-section p-lg text-center">
              <p className="font-number text-3xl font-bold text-stat-yeets">{dungeon.totalYeets}</p>
              <p className="pt-xs text-xs text-text-secondary">Yeets</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
