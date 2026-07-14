import { useEffect, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  deriveLeaderboard,
  usePlayerProfileEdit,
  usePlayerStatsBySlug,
  useSeasonId,
  useSeasonLeaders,
} from "../../hooks";
import { PageBoundary } from "../layout/PageBoundary";
import { buildPlayerPath, type PageBackState } from "../../utils/routes";
import { playerSlug } from "../../utils/slug";
import { isNotFoundApiError } from "../../utils/api-error";
import { HomeNavigation } from "../home/HomeNavigation";
import { DungeonBreakdownSection } from "./DungeonBreakdownSection";
import { NemesisCard } from "./NemesisCard";
import { PlayerProfileHeader } from "./PlayerProfileHeader";
import { BackButton } from "../ui/BackButton";
import {
  getDungeonBannerImageFromStats,
  resolveDungeonBannerSeasonKey,
} from "../../utils/dungeon-image";
import { getPlayerFlavorTitle } from "../../utils/player-flavor-title";
import { getNemesisDungeon } from "../../utils/player-stats";
import { getPlayerProfile } from "../../utils/player-characters";

export function PlayerProfile() {
  const { playerSlug: playerSlugParam } = useParams<{ playerSlug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { seasons, isSeasonReady, selectedSeasonId, selectedSeason, setSeasonId, homePath } =
    useSeasonId();
  const profileBackTo =
    (location.state as PageBackState | null)?.backTo ?? homePath;

  const { data: seasonLeaders } = useSeasonLeaders(selectedSeasonId, {
    enabled: isSeasonReady,
  });

  const {
    data: playerStats,
    isPending: isPendingPlayerStats,
    isFetching: isFetchingPlayerStats,
    isFetched: hasFetchedPlayerStats,
    isPlaceholderData: isShowingStalePlayerStats,
    error: playerStatsError,
    refetch: refetchPlayerStats,
  } = usePlayerStatsBySlug(playerSlugParam, selectedSeasonId, { enabled: isSeasonReady });

  const {
    breakdownMode,
    dungeonsForBreakdown,
    handleAdjustDraft,
    handleCancelEdit,
    handleDoneEdit,
    handleEnterEdit,
    isEditing,
    isSaving,
    toastMessage,
  } = usePlayerProfileEdit({
    playerStats,
    playerSlugParam,
    selectedSeasonId,
  });

  const nemesis = useMemo(
    () => (playerStats ? getNemesisDungeon(playerStats.dungeons) : null),
    [playerStats],
  );

  const leaderboardRank = useMemo(() => {
    if (!playerStats) return null;

    const leaderboard = deriveLeaderboard(seasonLeaders?.leaderboard ?? []);
    const rankIndex = leaderboard.findIndex(
      (entry) => entry.playerId === playerStats.player.id,
    );
    return rankIndex === -1 ? null : rankIndex + 1;
  }, [playerStats, seasonLeaders?.leaderboard]);

  const isKingOfYeets =
    playerStats?.player.id === seasonLeaders?.kingOfYeets?.playerId;
  const isKingOfDeaths =
    playerStats?.player.id === seasonLeaders?.kingOfDeaths?.playerId;

  const playerMeta = useMemo(() => {
    const characters = getPlayerProfile(playerStats?.player.displayName).characters;

    const flavor = playerStats
      ? getPlayerFlavorTitle({
          totalDeaths: playerStats.totalDeaths,
          totalYeets: playerStats.totalYeets,
          totalMistakes: playerStats.totalMistakes,
          dungeons: playerStats.dungeons,
          playerId: playerStats.player.id,
          seasonLeaders,
          leaderboardRank,
          nemesis,
        })
      : "Season Adventurer";

    return { characters, flavor };
  }, [leaderboardRank, nemesis, playerStats, seasonLeaders]);

  const isPlayerNotFound = isNotFoundApiError(playerStatsError);

  const isPageLoading =
    !isSeasonReady ||
    (isPendingPlayerStats && !playerStats && !isPlayerNotFound);
  const isRefreshingProfile =
    isFetchingPlayerStats && !!playerStats && !isPendingPlayerStats;
  const notFoundMessage =
    isSeasonReady &&
    playerSlugParam &&
    hasFetchedPlayerStats &&
    !isFetchingPlayerStats &&
    (isPlayerNotFound || (!playerStats && !playerStatsError))
      ? "Player stats were not found."
      : null;
  const profileError = isPlayerNotFound ? null : playerStatsError;

  useEffect(() => {
    if (!playerStats || !selectedSeason || !playerSlugParam) return;

    const canonicalSlug = playerSlug(playerStats.player);
    if (playerSlugParam === canonicalSlug) return;

    navigate(buildPlayerPath(selectedSeason, playerStats.player), {
      replace: true,
      state: location.state,
    });
  }, [location.state, navigate, playerSlugParam, playerStats, selectedSeason]);

  return (
    <PageBoundary
      isLoading={isPageLoading}
      isRefreshing={isRefreshingProfile}
      isShowingStaleData={isShowingStalePlayerStats && isFetchingPlayerStats}
      error={profileError}
      notFoundMessage={notFoundMessage}
      onRetry={() => {
        void refetchPlayerStats();
      }}
    >
      {playerStats ? (
        <div className="flex flex-col gap-2xl">
          {toastMessage ? (
            <div
              role="alert"
              className="fixed bottom-4 right-4 z-50 animate-fade-in rounded-lg border border-red-400/40 bg-red-950/40 px-lg py-md text-sm font-semibold text-red-300 shadow-lg"
            >
              {toastMessage}
            </div>
          ) : null}

          <HomeNavigation homePath={homePath} />
          <BackButton to={profileBackTo} fallbackTo={homePath} className="self-start" />

          <PlayerProfileHeader
            playerStats={playerStats}
            seasons={seasons}
            selectedSeasonId={selectedSeasonId}
            onSeasonChange={setSeasonId}
            isEditing={isEditing}
            isKingOfYeets={isKingOfYeets}
            isKingOfDeaths={isKingOfDeaths}
            flavor={playerMeta.flavor}
            characters={playerMeta.characters}
          />

          {nemesis ? (
            <NemesisCard
              dungeon={nemesis.dungeon}
              sharePercent={nemesis.sharePercent}
              bannerImageUrl={getDungeonBannerImageFromStats(
                resolveDungeonBannerSeasonKey(playerStats.season.name),
                nemesis.dungeon,
              )}
            />
          ) : null}

          <DungeonBreakdownSection
            mode={breakdownMode}
            dungeons={dungeonsForBreakdown}
            onEnterEdit={handleEnterEdit}
            onCancel={handleCancelEdit}
            onDone={() => {
              void handleDoneEdit();
            }}
            isSaving={isSaving}
            onAdjust={handleAdjustDraft}
            season={playerStats.season}
            dungeonBackTo={buildPlayerPath(
              playerStats.season,
              playerStats.player,
            )}
            profileBackTo={profileBackTo}
          />
        </div>
      ) : null}
    </PageBoundary>
  );
}
