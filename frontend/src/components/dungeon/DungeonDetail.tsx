import { useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCurrentSeasonDungeons, useDungeonLeaderboard, useSeasonId } from '../../hooks'
import { PageBoundary } from '../layout/PageBoundary'
import { HomeNavigation } from '../home/HomeNavigation'
import { SpotlightCard } from '../profile/SpotlightCard'
import { buildDungeonPath } from '../../utils/routes'
import { dungeonSlug, findDungeonBySlug } from '../../utils/slug'
import {
  getDungeonAchievements,
  getDungeonHighlights,
  getDungeonReputationScores,
  getMeatGrinderSummary,
  getMistakeMix,
  sortDungeonLeaderboard,
} from '../../utils/dungeon-stats'
import {
  getDungeonBannerImage,
  resolveDungeonBannerSeasonKey,
} from '../../utils/dungeon-image'
import { BackButton } from '../ui/BackButton'
import { AchievementsSection } from './AchievementsSection'
import { DungeonHeroSection } from './DungeonHeroSection'
import { DungeonLeaderboardSection } from './DungeonLeaderboardSection'
import { DungeonReputationSection } from './DungeonReputationSection'
import { MistakeMixSection } from './MistakeMixSection'

export function DungeonDetail() {
  const { dungeonSlug: dungeonSlugParam } = useParams<{ dungeonSlug: string }>()
  const navigate = useNavigate()
  const { isSeasonReady, selectedSeasonId, selectedSeason, homePath } = useSeasonId()
  const {
    data: dungeonsData,
    isPending: isPendingDungeons,
    isFetching: isFetchingDungeons,
    isFetched: hasFetchedDungeons,
    isPlaceholderData: isShowingStaleDungeons,
    error: dungeonsError,
    refetch: refetchDungeons,
  } = useCurrentSeasonDungeons(selectedSeasonId, { enabled: isSeasonReady })

  const dungeons = dungeonsData ?? []
  const dungeon = findDungeonBySlug(dungeons, dungeonSlugParam)

  const {
    data: dungeonLeaderboardData,
    isPending: isPendingLeaderboard,
    isFetching: isFetchingLeaderboard,
    error: leaderboardError,
    refetch: refetchLeaderboard,
  } = useDungeonLeaderboard(selectedSeasonId, dungeon?.id, {
    enabled: isSeasonReady && !!dungeon,
  })

  const bannerSeasonKey = selectedSeason
    ? resolveDungeonBannerSeasonKey(selectedSeason.name)
    : 'season1'
  const bannerImageUrl = dungeon ? getDungeonBannerImage(bannerSeasonKey, dungeon) : null

  const sortedLeaderboard = useMemo(
    () => sortDungeonLeaderboard(dungeonLeaderboardData?.leaderboard ?? []),
    [dungeonLeaderboardData?.leaderboard],
  )

  const highlights = useMemo(
    () => getDungeonHighlights(sortedLeaderboard),
    [sortedLeaderboard],
  )

  const mistakeMix = useMemo(
    () => (dungeon ? getMistakeMix(dungeon) : { deathsPercent: 0, yeetsPercent: 0 }),
    [dungeon],
  )

  const achievements = useMemo(
    () => getDungeonAchievements(highlights),
    [highlights],
  )

  const reputationScores = useMemo(
    () =>
      dungeon
        ? getDungeonReputationScores(dungeon, dungeons, sortedLeaderboard)
        : { dangerRating: 0, yeetFactor: 0, blameShare: 0 },
    [dungeon, dungeons, sortedLeaderboard],
  )

  const meatGrinderSummary = useMemo(
    () =>
      dungeon
        ? getMeatGrinderSummary(dungeon, sortedLeaderboard, dungeons)
        : {
            title: 'The Meat Grinder',
            narrative: '',
          },
    [dungeon, sortedLeaderboard, dungeons],
  )

  const error = dungeonsError ?? leaderboardError
  const hasInitialData = dungeonsData !== undefined && (!dungeon || dungeonLeaderboardData !== undefined)
  const isPageLoading =
    !isSeasonReady || ((isPendingDungeons || isPendingLeaderboard) && !hasInitialData)
  const isRefreshingDetail =
    (isFetchingDungeons || isFetchingLeaderboard) && hasInitialData && !isPageLoading
  const notFoundMessage =
    isSeasonReady &&
    hasFetchedDungeons &&
    !isFetchingDungeons &&
    !error &&
    dungeonSlugParam &&
    !dungeon
      ? 'Dungeon was not found.'
      : null

  useEffect(() => {
    if (!dungeon || !selectedSeason || !dungeonSlugParam) return

    const canonicalSlug = dungeonSlug(dungeon)
    if (dungeonSlugParam === canonicalSlug) return

    navigate(buildDungeonPath(selectedSeason, dungeon), { replace: true })
  }, [dungeon, dungeonSlugParam, navigate, selectedSeason])

  function handleRetry() {
    void refetchDungeons()
    void refetchLeaderboard()
  }

  return (
    <PageBoundary
      isLoading={isPageLoading}
      isRefreshing={isRefreshingDetail}
      isShowingStaleData={
        (isShowingStaleDungeons && isFetchingDungeons) ||
        (isFetchingLeaderboard && !!dungeonLeaderboardData)
      }
      error={error}
      notFoundMessage={notFoundMessage}
      onRetry={handleRetry}
    >
      {dungeon ? (
        <div className="flex flex-col gap-2xl">
          <HomeNavigation homePath={homePath} />
          <BackButton fallbackTo={homePath} className="self-start" />

          <DungeonHeroSection
            dungeon={dungeon}
            season={selectedSeason}
            dungeons={dungeons}
            bannerImageUrl={bannerImageUrl}
          />

          <div className="grid gap-lg md:grid-cols-3">
            <SpotlightCard
              category="Biggest Yeeter"
              categoryKind="yeets"
              title={highlights.biggestYeeter?.displayName ?? 'No yeets yet'}
              subtitle={highlights.biggestYeeter?.subtitle ?? 'biggest yeeter'}
              value={highlights.biggestYeeter?.value ?? 0}
            />
            <SpotlightCard
              category="Most Deaths"
              categoryKind="deaths"
              title={highlights.mostDeaths?.displayName ?? 'No deaths yet'}
              subtitle={highlights.mostDeaths?.subtitle ?? 'most deaths'}
              value={highlights.mostDeaths?.value ?? 0}
            />
            <SpotlightCard
              category="Safest Player"
              categoryKind="default"
              title={highlights.safestPlayer?.displayName ?? 'Everyone stayed clean'}
              subtitle={highlights.safestPlayer?.subtitle ?? 'mistakes'}
              value={highlights.safestPlayer?.value ?? 0}
            />
          </div>

          <div className="grid gap-2xl lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)]">
            <DungeonLeaderboardSection
              leaderboard={sortedLeaderboard}
              season={selectedSeason}
              isLoading={isPendingLeaderboard && !dungeonLeaderboardData}
              error={leaderboardError}
              onRetry={handleRetry}
            />

            <aside className="flex flex-col gap-lg">
              <MistakeMixSection mix={mistakeMix} />
              <AchievementsSection achievements={achievements} />
            </aside>
          </div>

          <DungeonReputationSection
            summary={meatGrinderSummary}
            scores={reputationScores}
            dungeonTotalMistakes={dungeon.totalMistakes}
            dungeonTotalYeets={dungeon.totalYeets}
          />
        </div>
      ) : null}
    </PageBoundary>
  )
}
