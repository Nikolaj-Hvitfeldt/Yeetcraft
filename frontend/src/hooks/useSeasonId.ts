import { useMemo } from 'react'
import { z } from 'zod'
import { useSearchParams } from 'react-router-dom'
import { resolveSeasonId, seasonPath } from '../utils/season'
import { useSeasons } from './useStats'

const seasonIdSchema = z.string().uuid()

export function useSeasonId() {
  const [searchParams, setSearchParams] = useSearchParams()
  const urlSeasonId = searchParams.get('seasonId')
  const { data: seasons, isPending: isPendingSeasons } = useSeasons()

  const validatedUrlSeasonId = useMemo(() => {
    if (!urlSeasonId) return null
    const result = seasonIdSchema.safeParse(urlSeasonId)
    return result.success ? result.data : null
  }, [urlSeasonId])

  const selectedSeasonId = useMemo(
    () => resolveSeasonId(validatedUrlSeasonId, seasons),
    [validatedUrlSeasonId, seasons],
  )

  const isSeasonReady = !isPendingSeasons && selectedSeasonId !== undefined

  function setSeasonId(seasonId: string) {
    setSearchParams({ seasonId }, { replace: true })
  }

  return {
    seasons: seasons ?? [],
    isPendingSeasons,
    isSeasonReady,
    selectedSeasonId,
    setSeasonId,
    homePath: seasonPath('/', selectedSeasonId),
  }
}
