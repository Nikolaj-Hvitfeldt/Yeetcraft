import type { ChangeEvent } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { AuthRequired } from './AuthRequired'
import { ErrorMessage } from './ErrorMessage'
import { LoadingSpinner } from './LoadingSpinner'
import { PlayerProfileTable } from './PlayerProfileTable'
import { StatsSummary } from './StatsSummary'
import { usePlayerStats, useSeasons } from '../hooks'
import { getAccessToken } from '../utils/token'

/**
 * Player profile page with season-specific aggregate stats.
 */
export function PlayerProfile() {
  const { playerId } = useParams<{ playerId: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedSeasonId = searchParams.get('seasonId') ?? undefined

  const { data: playerStats, isLoading: isLoadingPlayerStats, error: playerStatsError } = usePlayerStats(playerId, selectedSeasonId)
  const { data: seasons = [], isLoading: isLoadingSeasons } = useSeasons()

  const error = playerStatsError
  const hasToken = getAccessToken()
  const needsAuth = error?.message?.includes('Unauthorized') || error?.message?.includes('token')

  function handleSeasonChange(event: ChangeEvent<HTMLSelectElement>) {
    const seasonId = event.target.value
    if (!seasonId) {
      setSearchParams({}, { replace: true })
      return
    }
    setSearchParams({ seasonId }, { replace: true })
  }

  if (isLoadingPlayerStats || isLoadingSeasons) return <LoadingSpinner />
  if (needsAuth && !hasToken) return <AuthRequired />
  if (error) return <ErrorMessage message={error.message} />
  if (!playerStats) return <ErrorMessage message="Player stats were not found." />

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/"
          className="mb-6 inline-block text-sm uppercase tracking-wider text-text-secondary transition-colors hover:text-accent-primary font-heading"
        >
          &larr; Back to Leaderboard
        </Link>

        <div className="mb-8 rounded-md border border-border-subtle bg-surface-base p-8 text-center animate-fade-in">
          {playerStats.player.avatarUrl && (
            <img
              src={playerStats.player.avatarUrl}
              alt=""
              className="mx-auto mb-4 h-20 w-20 rounded-full border border-border-subtle"
            />
          )}
          <h1 className="text-4xl mb-2">{playerStats.player.displayName}</h1>
          <p className="text-lg text-text-secondary">
            {playerStats.season.name}
            {playerStats.season.expansion ? ` • ${playerStats.season.expansion}` : ''}
          </p>
        </div>

        <StatsSummary
          total={playerStats.totalMistakes}
          deaths={playerStats.totalDeaths}
          yeets={playerStats.totalYeets}
        />

        <div className="mb-8 rounded-md border border-border-subtle bg-surface-base p-4">
          <label className="mb-2 block text-sm uppercase tracking-wider text-text-secondary" htmlFor="season-select">
            Season
          </label>
          <select
            id="season-select"
            value={playerStats.season.id}
            onChange={handleSeasonChange}
            className="w-full rounded-sm border border-border-subtle bg-background-app px-3 py-2 text-text-primary"
          >
            {seasons.map((season) => (
              <option key={season.id} value={season.id}>
                {season.name}{season.isCurrent ? ' (Current)' : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-md border border-border-subtle bg-surface-base">
          <div className="border-b border-border-subtle px-6 py-4">
            <h2 className="text-2xl">Dungeon Breakdown</h2>
          </div>
          <PlayerProfileTable dungeons={playerStats.dungeons} />
        </div>
      </div>
    </div>
  )
}
