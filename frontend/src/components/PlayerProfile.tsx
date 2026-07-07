import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import type { DungeonStats } from '../api/types'
import { usePlayerStats, useSeasonId, useSeasonLeaders } from '../hooks'
import { PageShell } from './layout/PageShell'
import { SeasonPicker } from './home/SeasonPicker'
import { DungeonTableRow, NemesisCard, SpotlightCard } from './profile'
import { Avatar } from './ui/Avatar'
import { BackButton } from './ui/BackButton'
import { CrownBadge } from './ui/CrownBadge'
import { TableHeader } from './ui/TableHeader'

function getNemesisDungeon(
  dungeons: DungeonStats[],
): { dungeon: DungeonStats; sharePercent: number } | null {
  if (dungeons.length === 0) return null

  const totalMistakes = dungeons.reduce(
    (sum, entry) => sum + entry.totalMistakes,
    0,
  )
  if (totalMistakes === 0) return null

  const nemesis = dungeons.reduce((current, candidate) =>
    candidate.totalMistakes > current.totalMistakes ? candidate : current,
  )

  return {
    dungeon: nemesis,
    sharePercent: Math.round((nemesis.totalMistakes / totalMistakes) * 100),
  }
}

const TABLE_COLUMNS = [
  { id: 'dungeon', label: 'Dungeon', className: 'text-text-secondary' },
  {
    id: 'total',
    label: 'Total',
    className: 'text-center text-stat-yeets',
    width: '5rem',
  },
  {
    id: 'deaths',
    label: 'Deaths',
    className: 'text-center text-stat-total',
    width: '5rem',
  },
  {
    id: 'yeets',
    label: 'Yeets',
    className: 'text-center text-stat-deaths',
    width: '5rem',
  },
]

export function PlayerProfile() {
  const { playerId } = useParams<{ playerId: string }>()
  const { seasons, isLoadingSeasons, selectedSeasonId, setSeasonId, homePath } = useSeasonId()

  const {
    data: playerStats,
    isLoading: isLoadingPlayerStats,
    error: playerStatsError,
  } = usePlayerStats(playerId, selectedSeasonId)
  const { data: seasonLeaders } = useSeasonLeaders(selectedSeasonId)

  const nemesis = useMemo(
    () => (playerStats ? getNemesisDungeon(playerStats.dungeons) : null),
    [playerStats],
  )

  const isKingOfYeets = playerStats?.player.id === seasonLeaders?.kingOfYeets?.playerId
  const isKingOfDeaths = playerStats?.player.id === seasonLeaders?.kingOfDeaths?.playerId

  return (
    <PageShell
      isLoading={isLoadingPlayerStats || isLoadingSeasons}
      error={playerStatsError}
      notFoundMessage={
        !isLoadingPlayerStats &&
        !isLoadingSeasons &&
        !playerStatsError &&
        !playerStats
          ? 'Player stats were not found.'
          : null
      }
    >
      {playerStats ? (
        <div className="min-h-screen bg-background-app px-2xl py-2xl">
          <div className="mx-auto flex max-w-6xl flex-col gap-2xl">
            <BackButton to={homePath} />

            <header className="flex flex-col gap-lg rounded-3xl border border-border-subtle bg-surface-section p-2xl sm:flex-row sm:items-center">
              <Avatar
                name={playerStats.player.displayName}
                imageUrl={playerStats.player.avatarUrl}
                size="lg"
              />
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 flex-wrap items-center gap-md">
                  <h1 className="font-heading text-4xl font-bold leading-tight text-text-primary">
                    {playerStats.player.displayName}
                  </h1>
                  {isKingOfYeets ? <CrownBadge kind="yeets" showLabel /> : null}
                  {isKingOfDeaths ? <CrownBadge kind="deaths" showLabel /> : null}
                </div>
                <p className="pt-sm text-sm leading-5 text-text-secondary">
                  {playerStats.season.name}
                  {playerStats.season.expansion ? ` • ${playerStats.season.expansion}` : ''}
                </p>
              </div>
              <SeasonPicker
                seasons={seasons}
                selectedSeasonId={selectedSeasonId ?? playerStats.season.id}
                onSeasonChange={setSeasonId}
              />
            </header>

            <div className="grid gap-lg lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
              <SpotlightCard
                category="Biggest Yeeter"
                title={playerStats.player.displayName}
                subtitle="biggest yeeter"
                value={playerStats.totalYeets}
              />
              {nemesis ? (
                <NemesisCard dungeon={nemesis.dungeon} sharePercent={nemesis.sharePercent} />
              ) : null}
            </div>

            <section className="overflow-hidden rounded-3xl border border-border-subtle bg-surface-base">
              <div className="border-b border-border-subtle px-xl py-lg">
                <h2 className="font-heading text-2xl font-bold leading-8 text-text-primary">
                  Dungeon Breakdown
                </h2>
              </div>
              <TableHeader columns={TABLE_COLUMNS} />
              <div>
                {playerStats.dungeons.map((dungeon, index) => (
                  <DungeonTableRow
                    key={dungeon.dungeon.id}
                    dungeon={dungeon}
                    index={index}
                  />
                ))}
              </div>
            </section>
          </div>
        </div>
      ) : null}
    </PageShell>
  )
}
