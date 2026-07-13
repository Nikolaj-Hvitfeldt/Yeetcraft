import { useMemo } from 'react'
import {
  calculateTotalStats,
  deriveLeaderboard,
  useCurrentSeasonDungeons,
  useSeasonId,
  useSeasonLeaders,
} from '../../hooks'
import { PageShell } from '../layout/PageShell'
import { resolveDungeonBannerSeasonKey } from '../../utils/dungeon-image'
import { findSelectedSeason } from '../../utils/season'
import { DungeonNavPanel } from './DungeonNavPanel'
import { HomeHero } from './HomeHero'
import { HomeNavigation } from './HomeNavigation'
import { RankingsPanel } from './RankingsPanel'

export function HomePage() {
  const { seasons, isPendingSeasons, isSeasonReady, selectedSeasonId, setSeasonId, homePath } =
    useSeasonId()

  const {
    data: seasonLeaders,
    isPending: isPendingLeaderboard,
    isFetching: isFetchingLeaderboard,
    error: leaderboardError,
    refetch: refetchLeaderboard,
  } = useSeasonLeaders(selectedSeasonId, { enabled: isSeasonReady })

  const {
    data: dungeonsData,
    isPending: isPendingDungeons,
    isFetching: isFetchingDungeons,
    error: dungeonsError,
    refetch: refetchDungeons,
  } = useCurrentSeasonDungeons(selectedSeasonId, { enabled: isSeasonReady })

  const dungeons = dungeonsData ?? []
  const leaderboardEntries = seasonLeaders?.leaderboard ?? []

  const leaderboard = useMemo(
    () => deriveLeaderboard(leaderboardEntries),
    [leaderboardEntries],
  )

  const totalStats = useMemo(
    () => calculateTotalStats(leaderboardEntries),
    [leaderboardEntries],
  )

  const bannerSeasonKey = useMemo(() => {
    const selectedSeason = findSelectedSeason(seasons, selectedSeasonId)
    return selectedSeason
      ? resolveDungeonBannerSeasonKey(selectedSeason.name)
      : undefined
  }, [seasons, selectedSeasonId])

  const isRefreshingHome = isFetchingLeaderboard || isFetchingDungeons

  return (
    <PageShell isLoading={isPendingSeasons} isRefreshing={isSeasonReady && isRefreshingHome}>
      <main className="min-h-screen overflow-hidden bg-background-app">
        <div className="min-h-screen home-page-backdrop">
          <div className="mx-auto flex min-h-screen max-w-[1280px] flex-col px-2xl py-2xl">
            <HomeNavigation homePath={homePath} />
            <HomeHero {...totalStats} />
            <div className="grid w-full gap-2xl pt-2xl lg:grid-cols-[minmax(0,1fr)_280px]">
              <RankingsPanel
                leaderboard={leaderboard}
                seasons={seasons}
                selectedSeasonId={selectedSeasonId ?? ''}
                isLoading={isPendingLeaderboard && !seasonLeaders}
                error={leaderboardError}
                refreshError={leaderboardError && seasonLeaders ? leaderboardError : null}
                onRetry={() => {
                  void refetchLeaderboard()
                }}
                onSeasonChange={setSeasonId}
                kingOfYeetsId={seasonLeaders?.kingOfYeets?.playerId ?? null}
                kingOfDeathsId={seasonLeaders?.kingOfDeaths?.playerId ?? null}
              />
              <DungeonNavPanel
                dungeons={dungeons}
                isLoading={isPendingDungeons && dungeonsData === undefined}
                error={dungeonsError}
                refreshError={dungeonsError && dungeonsData ? dungeonsError : null}
                onRetry={() => {
                  void refetchDungeons()
                }}
                seasonId={selectedSeasonId}
                bannerSeasonKey={bannerSeasonKey}
              />
            </div>
          </div>
        </div>
      </main>
    </PageShell>
  )
}
