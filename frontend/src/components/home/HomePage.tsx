import { useMemo } from 'react'
import {
  calculateTotalStats,
  deriveLeaderboard,
  useCurrentSeasonDungeons,
  useLeaderboard,
  useSeasonId,
} from '../../hooks'
import { PageShell } from '../layout/PageShell'
import { DungeonNavPanel } from './DungeonNavPanel'
import { HomeHero } from './HomeHero'
import { HomeNavigation } from './HomeNavigation'
import { RankingsPanel } from './RankingsPanel'

export function HomePage() {
  const { seasons, isLoadingSeasons, selectedSeasonId, setSeasonId } = useSeasonId()

  const {
    data: leaderboardEntries = [],
    isLoading: isLoadingLeaderboard,
    error: leaderboardError,
  } = useLeaderboard(selectedSeasonId)
  const {
    data: dungeons = [],
    isLoading: isLoadingDungeons,
    error: dungeonsError,
  } = useCurrentSeasonDungeons(selectedSeasonId)

  const leaderboard = useMemo(
    () => deriveLeaderboard(leaderboardEntries),
    [leaderboardEntries],
  )
  const totalStats = useMemo(
    () => calculateTotalStats(leaderboardEntries),
    [leaderboardEntries],
  )

  const pageError =
    leaderboardError && leaderboardEntries.length === 0 ? leaderboardError : null

  return (
    <PageShell isLoading={isLoadingSeasons} error={pageError}>
      <main className="min-h-screen overflow-hidden bg-background-app">
        <div className="min-h-screen home-page-backdrop">
          <div className="mx-auto flex min-h-screen max-w-[1280px] flex-col px-2xl py-2xl">
            <HomeNavigation />
            <HomeHero {...totalStats} />
            <div className="grid w-full gap-2xl pt-2xl lg:grid-cols-[minmax(0,1fr)_280px]">
              <RankingsPanel
                leaderboard={leaderboard}
                seasons={seasons}
                selectedSeasonId={selectedSeasonId ?? ''}
                isLoading={isLoadingLeaderboard}
                error={leaderboardError}
                onSeasonChange={setSeasonId}
              />
              <DungeonNavPanel
                dungeons={dungeons}
                isLoading={isLoadingDungeons}
                hasError={!!dungeonsError}
                seasonId={selectedSeasonId}
              />
            </div>
          </div>
        </div>
      </main>
    </PageShell>
  )
}
