import type { PlayerStatsResponse, SeasonSummary } from '../../api/types'
import type { PlayerCharacter } from '../../data/player-characters'
import { SeasonPicker } from '../home/SeasonPicker'
import { StatCard } from '../home/StatCard'
import { Avatar } from '../ui/Avatar'
import { CharacterTag } from '../ui/CharacterTag'
import { CrownBadge } from '../ui/CrownBadge'

export function PlayerProfileHeader({
  playerStats,
  seasons,
  selectedSeasonId,
  onSeasonChange,
  isEditing,
  isKingOfYeets,
  isKingOfDeaths,
  flavor,
  characters,
}: PlayerProfileHeaderProps) {
  return (
    <header className="relative flex flex-col gap-2xl overflow-hidden rounded-3xl border border-accent-secondary bg-surface-section p-2xl shadow-2xl sm:flex-row sm:items-start sm:justify-between">      <div className="flex min-w-0 flex-1 items-start gap-lg">
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
            {isKingOfYeets ? <CrownBadge kind="yeets" showLabel /> : null}
            {isKingOfDeaths ? <CrownBadge kind="deaths" showLabel /> : null}
          </div>

          <p className="pt-sm text-sm leading-5 text-stat-yeets">{flavor}</p>

          <p className="pt-sm text-sm leading-5 text-text-secondary">
            {characters.length} characters tracked this season
          </p>
          <div className="flex flex-wrap gap-md pt-sm">
            {characters.map((character) => (
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
        <div className={isEditing ? 'pointer-events-none opacity-60' : ''}>
          <SeasonPicker
            seasons={seasons}
            selectedSeasonId={selectedSeasonId ?? playerStats.season.id}
            onSeasonChange={onSeasonChange}
            fluid
          />
        </div>

        <div className="flex justify-between gap-md">
          <StatCard label="Total" value={playerStats.totalMistakes} kind="total" />
          <StatCard label="Deaths" value={playerStats.totalDeaths} kind="deaths" />
          <StatCard label="Yeets" value={playerStats.totalYeets} kind="yeets" />
        </div>
      </div>
    </header>
  )
}

interface PlayerProfileHeaderProps {
  playerStats: PlayerStatsResponse
  seasons: SeasonSummary[]
  selectedSeasonId: string | undefined
  onSeasonChange: (seasonId: string) => void
  isEditing: boolean
  isKingOfYeets: boolean
  isKingOfDeaths: boolean
  flavor: string
  characters: PlayerCharacter[]
}
