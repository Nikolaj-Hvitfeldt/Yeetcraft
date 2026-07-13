import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import type { DungeonSummary } from '../../api/types'
import { useCurrentSeasonDungeons, useSeasonId, useSeasonLeaders } from '../../hooks'
import { findSelectedSeason } from '../../utils/season'
import { PageShell } from '../layout/PageShell'
import { BackButton } from '../ui/BackButton'
import { AchievementCard } from './AchievementCard'
import { ReputationCard } from './ReputationCard'

function getDangerScore(dungeon: DungeonSummary, averageMistakes: number): number {
  if (averageMistakes <= 0) return dungeon.totalMistakes > 0 ? 100 : 0
  return Math.min(Math.round((dungeon.totalMistakes / averageMistakes) * 50), 100)
}

export function DungeonDetail() {
  const { dungeonId } = useParams<{ dungeonId: string }>()
  const { seasons, isSeasonReady, selectedSeasonId, homePath } = useSeasonId()
  const {
    data: dungeonsData,
    isPending: isPendingDungeons,
    isFetching: isFetchingDungeons,
    isFetched: hasFetchedDungeons,
    isPlaceholderData: isShowingStaleDungeons,
    error: dungeonsError,
    refetch: refetchDungeons,
  } = useCurrentSeasonDungeons(selectedSeasonId, { enabled: isSeasonReady })
  const {
    data: seasonLeaders,
    isPending: isPendingLeaders,
    isFetching: isFetchingLeaders,
    error: leadersError,
    refetch: refetchLeaders,
  } = useSeasonLeaders(selectedSeasonId, { enabled: isSeasonReady })

  const dungeons = dungeonsData ?? []
  const dungeon = dungeons.find((entry) => entry.id === dungeonId)
  const season = findSelectedSeason(seasons, selectedSeasonId)

  const topPlayer = seasonLeaders?.topPlayer
  const averageMistakes = useMemo(() => {
    if (dungeons.length === 0) return 0
    const total = dungeons.reduce((sum, entry) => sum + entry.totalMistakes, 0)
    return total / dungeons.length
  }, [dungeons])

  const error = dungeonsError ?? leadersError
  const hasInitialData = dungeonsData !== undefined && seasonLeaders !== undefined
  const isPageLoading =
    !isSeasonReady || ((isPendingDungeons || isPendingLeaders) && !hasInitialData)
  const isRefreshingDetail =
    (isFetchingDungeons || isFetchingLeaders) && hasInitialData && !isPageLoading
  const notFoundMessage =
    isSeasonReady &&
    hasFetchedDungeons &&
    !isFetchingDungeons &&
    !error &&
    !dungeon
      ? 'Dungeon was not found.'
      : null

  function handleRetry() {
    void refetchDungeons()
    void refetchLeaders()
  }

  return (
    <PageShell
      isLoading={isPageLoading}
      isRefreshing={isRefreshingDetail}
      isShowingStaleData={(isShowingStaleDungeons && isFetchingDungeons) || (isFetchingLeaders && !!seasonLeaders)}
      error={error}
      notFoundMessage={notFoundMessage}
      onRetry={handleRetry}
    >
      {dungeon ? (
        <div className="min-h-screen bg-background-app px-2xl py-2xl">
          <div className="mx-auto flex max-w-5xl flex-col gap-2xl">
            <BackButton to={homePath} />

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
                score={getDangerScore(dungeon, averageMistakes)}
                progressPercent={getDangerScore(dungeon, averageMistakes)}
              />
              <AchievementCard
                icon="🚀"
                title="Orbital Launch"
                description={
                  topPlayer
                    ? `${topPlayer.displayName} owns the yeet narrative here.`
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
      ) : null}
    </PageShell>
  )
}
