import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  calculateTotalStats,
  deriveLeaderboard,
  useCurrentSeasonDungeons,
  useLeaderboard,
  useSeasons,
  type FilterTab,
} from '../../hooks'
import { getAccessToken } from '../../utils/token'
import { AuthRequired } from '../AuthRequired'
import { ErrorMessage } from '../ErrorMessage'
import { LoadingSpinner } from '../LoadingSpinner'
import { DungeonNavPanel } from './DungeonNavPanel'
import { HomeHero } from './HomeHero'
import { HomeNavigation } from './HomeNavigation'
import { RankingsPanel } from './RankingsPanel'

function isValidTab(value: string | null): value is FilterTab {
  if (!value) return false
  return value === 'all' || value === 'death' || value === 'yeet'
}

function getSeasonLabel(seasons: ReturnType<typeof useSeasons>['data']): string {
  const currentSeason = seasons?.find((season) => season.isCurrent)
  if (!currentSeason) return 'Current Season'
  return currentSeason.name
}

export function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const activeTab: FilterTab = isValidTab(tabParam) ? tabParam : 'all'

  const handleTabChange = useCallback((tab: FilterTab) => {
    if (tab === 'all') {
      setSearchParams({}, { replace: true })
      return
    }
    setSearchParams({ tab }, { replace: true })
  }, [setSearchParams])

  const {
    data: leaderboardEntries = [],
    isLoading: isLoadingLeaderboard,
    error: leaderboardError,
  } = useLeaderboard()
  const { data: seasons, isLoading: isLoadingSeasons } = useSeasons()
  const {
    data: dungeons = [],
    isLoading: isLoadingDungeons,
    error: dungeonsError,
  } = useCurrentSeasonDungeons()

  const leaderboard = useMemo(
    () => deriveLeaderboard(leaderboardEntries, activeTab),
    [leaderboardEntries, activeTab]
  )
  const totalStats = useMemo(() => calculateTotalStats(leaderboardEntries), [leaderboardEntries])
  const seasonLabel = useMemo(() => getSeasonLabel(seasons), [seasons])

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
              activeTab={activeTab}
              leaderboard={leaderboard}
              seasonLabel={seasonLabel}
              onTabChange={handleTabChange}
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
