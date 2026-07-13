import { Navigate } from 'react-router-dom'
import { LoadingSpinner } from '../LoadingSpinner'
import { useSeasons } from '../../hooks'
import { buildSeasonHomePath } from '../../utils/routes'

export function RootRedirect() {
  const { data: seasons, isPending } = useSeasons()

  if (isPending || !seasons?.length) {
    return <LoadingSpinner />
  }

  const currentSeason = seasons.find((season) => season.isCurrent) ?? seasons[0]
  return <Navigate to={buildSeasonHomePath(currentSeason)} replace />
}
