import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import type { DungeonStats } from "../api/types";
import {
  deriveLeaderboard,
  useLeaderboard,
  usePlayerStats,
  useSeasonId,
  useSeasonLeaders,
  useSetPlayerStats,
} from "../hooks";
import { PageShell } from "./layout/PageShell";
import { SeasonPicker } from "./home/SeasonPicker";
import { HomeNavigation } from "./home/HomeNavigation";
import { StatCard } from "./home/StatCard";
import { NemesisCard } from "./profile";
import { Avatar } from "./ui/Avatar";
import { BackButton } from "./ui/BackButton";
import { CharacterTag } from "./ui/CharacterTag";
import { CrownBadge } from "./ui/CrownBadge";
import { DungeonBreakdownSection } from "./profile/DungeonBreakdownSection";
import { getDungeonBannerImageFromStats } from "../utils/dungeon-image";
import { getPlayerFlavorTitle } from "../utils/player-flavor-title";
import { getNemesisDungeon } from "../utils/player-stats";
import { getCharactersForPlayer } from "../utils/player-characters";
import {
  type PlayerCharacter,
} from "../data/player-characters";

export function PlayerProfile() {
  const { playerId } = useParams<{ playerId: string }>();
  const { seasons, isSeasonReady, selectedSeasonId, setSeasonId, homePath } =
    useSeasonId();

  const {
    data: playerStats,
    isPending: isPendingPlayerStats,
    isFetching: isFetchingPlayerStats,
    isFetched: hasFetchedPlayerStats,
    error: playerStatsError,
  } = usePlayerStats(playerId, selectedSeasonId, { enabled: isSeasonReady });
  const { data: seasonLeaders } = useSeasonLeaders(selectedSeasonId, {
    enabled: isSeasonReady,
  });
  const { data: leaderboardEntries = [] } = useLeaderboard(selectedSeasonId, {
    enabled: isSeasonReady,
  });

  const leaderboardRank = useMemo(() => {
    if (!playerStats) return null;

    const leaderboard = deriveLeaderboard(leaderboardEntries);
    const rankIndex = leaderboard.findIndex(
      (entry) => entry.playerId === playerStats.player.id,
    );
    return rankIndex === -1 ? null : rankIndex + 1;
  }, [leaderboardEntries, playerStats]);

  const nemesis = useMemo(
    () => (playerStats ? getNemesisDungeon(playerStats.dungeons) : null),
    [playerStats],
  );

  const isKingOfYeets =
    playerStats?.player.id === seasonLeaders?.kingOfYeets?.playerId;
  const isKingOfDeaths =
    playerStats?.player.id === seasonLeaders?.kingOfDeaths?.playerId;

  const [isEditing, setIsEditing] = useState(false);
  const [draftDungeons, setDraftDungeons] = useState<DungeonStats[] | null>(
    null,
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { mutateAsync: setPlayerStats, isPending: isSaving } =
    useSetPlayerStats();

  useEffect(() => {
    // Keep edit mode in sync with navigation/context.
    setIsEditing(false);
    setDraftDungeons(null);
  }, [playerId, selectedSeasonId]);

  useEffect(() => {
    if (!toastMessage) return;
    const id = window.setTimeout(() => setToastMessage(null), 4000);
    return () => window.clearTimeout(id);
  }, [toastMessage]);

  const playerMeta = useMemo(() => {
    const characters: PlayerCharacter[] = getCharactersForPlayer(
      playerStats?.player.displayName,
    );

    const flavor = playerStats
      ? getPlayerFlavorTitle({
          totalDeaths: playerStats.totalDeaths,
          totalYeets: playerStats.totalYeets,
          totalMistakes: playerStats.totalMistakes,
          dungeons: playerStats.dungeons,
          playerId: playerStats.player.id,
          seasonLeaders,
          leaderboardRank,
        })
      : "Season Adventurer";

    return { characters, flavor };
  }, [leaderboardRank, playerStats, seasonLeaders]);

  function handleEnterEdit() {
    if (!playerStats) return;
    setDraftDungeons(structuredClone(playerStats.dungeons));
    setIsEditing(true);
    setToastMessage(null);
  }

  function handleCancelEdit() {
    setIsEditing(false);
    setDraftDungeons(null);
    setToastMessage(null);
  }

  function handleAdjustDraft(
    dungeonId: string,
    field: "deaths" | "yeets",
    delta: 1 | -1,
  ) {
    if (!draftDungeons) return;

    setDraftDungeons((rows) =>
      (rows ?? []).map((row) => {
        if (row.dungeon.id !== dungeonId) return row;

        const nextDeaths =
          field === "deaths" ? Math.max(0, row.deaths + delta) : row.deaths;
        const nextYeets =
          field === "yeets" ? Math.max(0, row.yeets + delta) : row.yeets;

        return {
          ...row,
          deaths: nextDeaths,
          yeets: nextYeets,
          totalMistakes: nextDeaths + nextYeets,
        };
      }),
    );
  }

  async function handleDoneEdit() {
    if (!playerStats || !draftDungeons || !selectedSeasonId) return;

    const changed = draftDungeons.filter((draftRow) => {
      const original = playerStats.dungeons.find(
        (row) => row.dungeon.id === draftRow.dungeon.id,
      );
      if (!original) return true;
      return (
        original.deaths !== draftRow.deaths || original.yeets !== draftRow.yeets
      );
    });

    if (changed.length === 0) {
      setIsEditing(false);
      setDraftDungeons(null);
      return;
    }

    setIsEditing(false);
    setDraftDungeons(null);
    setToastMessage(null);

    const draftSnapshot = draftDungeons;

    try {
      await setPlayerStats({
        playerId: playerStats.player.id,
        seasonId: selectedSeasonId,
        stats: changed.map((row) => ({
          dungeonId: row.dungeon.id,
          deaths: row.deaths,
          yeets: row.yeets,
        })),
      });
    } catch {
      setIsEditing(true);
      setDraftDungeons(draftSnapshot);
      setToastMessage("Could not save stats. Try again.");
    }
  }

  const breakdownMode = isEditing ? "edit" : "browse";
  const dungeonsForBreakdown =
    breakdownMode === "edit" && draftDungeons
      ? draftDungeons
      : (playerStats?.dungeons ?? []);

  const isPageLoading =
    !isSeasonReady ||
    isPendingPlayerStats ||
    (isFetchingPlayerStats && !playerStats);
  const notFoundMessage =
    isSeasonReady &&
    hasFetchedPlayerStats &&
    !isFetchingPlayerStats &&
    !playerStatsError &&
    !playerStats
      ? "Player stats were not found."
      : null;

  return (
    <PageShell
      isLoading={isPageLoading}
      error={playerStatsError}
      notFoundMessage={notFoundMessage}
    >
      {playerStats ? (
        <div className="relative min-h-screen bg-background-app px-2xl py-2xl">
          {toastMessage ? (
            <div className="fixed bottom-4 right-4 z-50 animate-fade-in rounded-lg border border-red-400/40 bg-red-950/40 px-lg py-md text-sm font-semibold text-red-300 shadow-lg">
              {toastMessage}
            </div>
          ) : null}

          <div className="mx-auto flex max-w-6xl flex-col gap-2xl">
            <HomeNavigation />
            <BackButton to={homePath} className="self-start" />

            <header className="relative flex flex-col gap-2xl overflow-hidden rounded-3xl border border-accent-secondary bg-surface-section p-2xl shadow-2xl sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 flex-1 items-start gap-lg">
                <Avatar
                  name={playerStats.player.displayName}
                  imageUrl={playerStats.player.avatarUrl}
                  size="lg"
                  className="drop-shadow-[0_12px_25px_rgba(0,0,0,0.35)]"
                />

                <div className="min-w-0 flex-1 pt-xs">
                  <p className="text-xs font-bold leading-4 text-accent-primary">
                    Player profile
                  </p>
                  <div className="flex min-w-0 flex-wrap items-center gap-md pt-xs">
                    <h1 className="font-heading text-4xl font-bold leading-tight text-text-primary">
                      {playerStats.player.displayName}
                    </h1>
                    {isKingOfYeets ? (
                      <CrownBadge kind="yeets" showLabel />
                    ) : null}
                    {isKingOfDeaths ? (
                      <CrownBadge kind="deaths" showLabel />
                    ) : null}
                  </div>

                  <p className="pt-sm text-sm leading-5 text-stat-yeets">
                    {playerMeta.flavor}
                  </p>

                  <p className="pt-sm text-sm leading-5 text-text-secondary">
                    {playerMeta.characters.length} characters tracked this
                    season
                  </p>

                  <div className="flex flex-wrap gap-md pt-sm">
                    {playerMeta.characters.map((character) => (
                      <CharacterTag
                        key={character.name}
                        name={character.name}
                        wowClass={character.wowClass}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex w-full shrink-0 flex-col gap-md sm:w-[360px]">
                <div
                  className={isEditing ? "pointer-events-none opacity-60" : ""}
                >
                  <SeasonPicker
                    seasons={seasons}
                    selectedSeasonId={selectedSeasonId ?? playerStats.season.id}
                    onSeasonChange={setSeasonId}
                    fluid
                  />
                </div>

                <div className="flex justify-between gap-md">
                  <StatCard
                    label="Total"
                    value={playerStats.totalMistakes}
                    kind="total"
                  />
                  <StatCard
                    label="Deaths"
                    value={playerStats.totalDeaths}
                    kind="deaths"
                  />
                  <StatCard
                    label="Yeets"
                    value={playerStats.totalYeets}
                    kind="yeets"
                  />
                </div>
              </div>
            </header>

            {nemesis ? (
              <NemesisCard
                dungeon={nemesis.dungeon}
                sharePercent={nemesis.sharePercent}
                bannerImageUrl={(() => {
                  const seasonKey = /Season\s*2/i.test(playerStats.season.name)
                    ? "season2"
                    : "season1";
                  return getDungeonBannerImageFromStats(
                    seasonKey,
                    nemesis.dungeon,
                  );
                })()}
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
              seasonId={selectedSeasonId ?? playerStats.season.id}
            />
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}
