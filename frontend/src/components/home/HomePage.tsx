import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  calculateTotalStats,
  deriveLeaderboard,
  useCurrentSeasonDungeons,
  useLeaderboard,
  useSeasons,
} from '../../hooks'
import { getAccessToken } from '../../utils/token'
import { AuthRequired } from '../AuthRequired'
import { ErrorMessage } from '../ErrorMessage'
import { LoadingSpinner } from '../LoadingSpinner'
import { DungeonNavPanel } from './DungeonNavPanel'
import { HomeHero } from './HomeHero'
import { HomeNavigation } from './HomeNavigation'
import { RankingsPanel } from './RankingsPanel'

function getSelectedSeasonId(seasons: ReturnType<typeof useSeasons>['data'], requestedSeasonId: string | null): string | undefined {
  if (requestedSeasonId && seasons?.some((season) => season.id === requestedSeasonId)) {
    return requestedSeasonId
  }

  return seasons?.find((season) => season.isCurrent)?.id ?? seasons?.[0]?.id
}

export function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedSeasonId = searchParams.get('seasonId')
  const { data: seasons = [], isLoading: isLoadingSeasons } = useSeasons()
  const selectedSeasonId = useMemo(
    () => getSelectedSeasonId(seasons, requestedSeasonId),
    [requestedSeasonId, seasons]
  )

  const {
    data: leaderboardEntries = [],
    isLoading: isLoadingLeaderboard,
    error: leaderboardError,
  } = useLeaderboard(selectedSeasonId)
  const {
    data: dungeons = [],
    isLoading: isLoadingDungeons,
    error: dungeonsError,
  } = useCurrentSeasonDungeons()

  const leaderboard = useMemo(
    () => deriveLeaderboard(leaderboardEntries),
    [leaderboardEntries]
  )
  const totalStats = useMemo(() => calculateTotalStats(leaderboardEntries), [leaderboardEntries])

  const hasToken = getAccessToken()
  const needsAuth = leaderboardError?.message?.includes('Unauthorized') || leaderboardError?.message?.includes('token')

  if (isLoadingLeaderboard || isLoadingSeasons) return <LoadingSpinner />
  if (needsAuth && !hasToken) return <AuthRequired />
  if (leaderboardError && leaderboardEntries.length === 0) {
    return <ErrorMessage message={leaderboardError.message} />
  }

  return (
    <main className="min-h-screen overflow-hidden bg-background-app">
      <div
        className="min-h-screen"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 24%, rgba(245, 139, 22, 0.24) 0%, rgba(123, 70, 11, 0.12) 14%, transparent 28%), radial-gradient(circle at 50% 55%, rgba(245, 177, 54, 0.14) 0%, rgba(123, 89, 27, 0.07) 17%, transparent 34%), linear-gradient(148deg, var(--color-background-app) 0%, var(--color-surface-section) 48%, #070604 100%)',
        }}
      >
        <div className="mx-auto flex min-h-screen max-w-[1280px] flex-col px-2xl py-2xl">
          <HomeNavigation />
          <HomeHero {...totalStats} />
          <div className="grid w-full gap-2xl pt-2xl lg:grid-cols-[minmax(0,1fr)_280px]">
            <RankingsPanel
              leaderboard={leaderboard}
              seasons={seasons}
              selectedSeasonId={selectedSeasonId ?? ''}
              onSeasonChange={(seasonId) => {
                setSearchParams({ seasonId }, { replace: true })
              }}
            />
            <DungeonNavPanel
              dungeons={dungeons}
              isLoading={isLoadingDungeons}
              hasError={!!dungeonsError}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
