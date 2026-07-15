import { useMemo } from 'react'
import {
  calculateTotalStats,
  deriveLeaderboard,
  useCurrentSeasonDungeons,
  useSeasonId,
  useSeasonLeaders,
} from '../../hooks'
import { usePageConnection } from '../../hooks/usePageConnectionState'
import { hasRecoverableQueryError } from '../../lib/query-defaults'
import { PageBoundary } from '../layout/PageBoundary'
import { resolveDungeonBannerSeasonKey } from '../../utils/dungeon-image'
import { DungeonNavPanel } from './DungeonNavPanel'
import { HomeHero } from './HomeHero'
import { HomeNavigation } from './HomeNavigation'
import { RankingsPanel } from './RankingsPanel'

export function HomePage() {
  const { seasons, isPendingSeasons, isSeasonReady, selectedSeasonId, selectedSeason, setSeasonId, homePath } =
    useSeasonId()

  const {
    data: seasonLeaders,
    isPending: isPendingLeaderboard,
    isFetching: isFetchingLeaderboard,
    error: leaderboardError,
    failureCount: leaderboardFailureCount,
    refetch: refetchLeaderboard,
  } = useSeasonLeaders(selectedSeasonId, { enabled: isSeasonReady })

  const {
    data: dungeonsData,
    isPending: isPendingDungeons,
    isFetching: isFetchingDungeons,
    error: dungeonsError,
    failureCount: dungeonsFailureCount,
    refetch: refetchDungeons,
  } = useCurrentSeasonDungeons(selectedSeasonId, { enabled: isSeasonReady })

  const dungeons = dungeonsData ?? []
  const hasCachedData =
    seasonLeaders !== undefined || dungeonsData !== undefined || seasons.length > 0
  const isFetchingHome = isFetchingLeaderboard || isFetchingDungeons
  const isPendingHome = isPendingLeaderboard || isPendingDungeons
  const homeError = leaderboardError ?? dungeonsError
  const hasRecoverableError =
    hasRecoverableQueryError(Boolean(leaderboardError), leaderboardFailureCount) ||
    hasRecoverableQueryError(Boolean(dungeonsError), dungeonsFailureCount)

  function handleRetry() {
    void refetchLeaderboard()
    void refetchDungeons()
  }

  const { loadingMessage, showOfflineNoCache } = usePageConnection({
    hasCachedData,
    isFetching: isFetchingHome,
    isPending: isPendingSeasons || (isSeasonReady && isPendingHome && !hasCachedData),
    isError: Boolean(homeError),
    hasRecoverableError,
    onRetry: handleRetry,
  })

  const leaderboardEntries = useMemo(
    () => seasonLeaders?.leaderboard ?? [],
    [seasonLeaders?.leaderboard],
  )

  const leaderboard = useMemo(
    () => deriveLeaderboard(leaderboardEntries),
    [leaderboardEntries],
  )

  const totalStats = useMemo(
    () => calculateTotalStats(leaderboardEntries),
    [leaderboardEntries],
  )

  const bannerSeasonKey = useMemo(
    () => (selectedSeason ? resolveDungeonBannerSeasonKey(selectedSeason.name) : undefined),
    [selectedSeason],
  )

  const isPageLoading =
    !showOfflineNoCache &&
    ((isPendingSeasons && seasons.length === 0) ||
      (isSeasonReady && !hasCachedData && isPendingHome))

  const isRefreshingHome = isFetchingHome && hasCachedData && !isPageLoading
  const blockingError = homeError && !hasCachedData ? homeError : null

  return (
    <PageBoundary
      isLoading={isPageLoading}
      isRefreshing={isRefreshingHome}
      loadingMessage={loadingMessage}
      showOfflineNoCache={showOfflineNoCache}
      error={blockingError}
      onRetry={handleRetry}
    >
      <HomeNavigation homePath={homePath} />
      <HomeHero {...totalStats} />
      <div className="grid w-full gap-2xl pt-2xl lg:grid-cols-[minmax(0,1fr)_280px]">
        <RankingsPanel
          leaderboard={leaderboard}
          seasons={seasons}
          selectedSeasonId={selectedSeasonId ?? ''}
          isLoading={isPendingLeaderboard && !seasonLeaders}
          error={leaderboardError && !seasonLeaders ? leaderboardError : null}
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
          error={dungeonsError && !dungeonsData ? dungeonsError : null}
          refreshError={dungeonsError && dungeonsData ? dungeonsError : null}
          onRetry={() => {
            void refetchDungeons()
          }}
          season={selectedSeason}
          bannerSeasonKey={bannerSeasonKey}
        />
      </div>
    </PageBoundary>
  )
}
