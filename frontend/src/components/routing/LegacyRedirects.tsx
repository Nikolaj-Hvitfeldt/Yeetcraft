import { Navigate, useParams, useSearchParams } from 'react-router-dom'
import { LoadingSpinner } from '../LoadingSpinner'
import { useSeasons } from '../../hooks'
import { buildDungeonPath, buildPlayerPath, buildSeasonHomePath } from '../../utils/routes'
import { isUuid } from '../../utils/slug'
import { resolveSeasonId } from '../../utils/season'

export function LegacyPlayerRedirect() {
  const { playerId } = useParams<{ playerId: string }>()
  const [searchParams] = useSearchParams()
  const { data: seasons, isPending } = useSeasons()

  if (isPending || !seasons?.length || !playerId) {
    return <LoadingSpinner />
  }

  const seasonId = resolveSeasonId(searchParams.get('seasonId'), seasons)
  const season = seasons.find((entry) => entry.id === seasonId) ?? seasons[0]

  if (isUuid(playerId)) {
    return <Navigate to={`${buildSeasonHomePath(season)}/player/${playerId}`} replace />
  }

  return <Navigate to={buildPlayerPath(season, { displayName: playerId })} replace />
}

export function LegacyDungeonRedirect() {
  const { dungeonId } = useParams<{ dungeonId: string }>()
  const [searchParams] = useSearchParams()
  const { data: seasons, isPending } = useSeasons()

  if (isPending || !seasons?.length || !dungeonId) {
    return <LoadingSpinner />
  }

  const seasonId = resolveSeasonId(searchParams.get('seasonId'), seasons)
  const season = seasons.find((entry) => entry.id === seasonId) ?? seasons[0]

  if (isUuid(dungeonId)) {
    return <Navigate to={`${buildSeasonHomePath(season)}/dungeon/${dungeonId}`} replace />
  }

  return <Navigate to={buildDungeonPath(season, { name: dungeonId })} replace />
}
