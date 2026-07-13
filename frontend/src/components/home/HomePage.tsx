import { useMemo } from 'react'
import {
  calculateTotalStats,
  deriveLeaderboard,
  useCurrentSeasonDungeons,
  useSeasonId,
  useSeasonLeaders,
} from '../../hooks'
import { PageBoundary } from '../layout/PageBoundary'
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
    <PageBoundary isLoading={isPendingSeasons} isRefreshing={isSeasonReady && isRefreshingHome}>
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
    </PageBoundary>
  )
}
