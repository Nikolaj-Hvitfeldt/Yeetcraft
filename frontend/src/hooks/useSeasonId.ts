import { useEffect, useMemo } from 'react'
import { useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom'
import { findSelectedSeason, resolveSeasonId } from '../utils/season'
import { buildSeasonHomePath, replaceSeasonSlugInPath } from '../utils/routes'
import { findSeasonBySlug } from '../utils/slug'
import { useSeasons } from './useStats'

export function useSeasonId() {
  const { seasonSlug } = useParams<{ seasonSlug?: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { data: seasons, isPending: isPendingSeasons } = useSeasons()

  const seasonList = seasons ?? []
  const legacySeasonId = searchParams.get('seasonId')

  const selectedSeason = useMemo(
    () => findSeasonBySlug(seasonList, seasonSlug) ?? findSelectedSeason(seasonList, null),
    [seasonList, seasonSlug],
  )

  const selectedSeasonId = useMemo(
    () => resolveSeasonId(seasonSlug ?? legacySeasonId, seasonList),
    [legacySeasonId, seasonList, seasonSlug],
  )

  const isSeasonReady = !isPendingSeasons && selectedSeasonId !== undefined

  useEffect(() => {
    if (isPendingSeasons || !legacySeasonId || seasonSlug) return

    const legacySeason = seasonList.find((season) => season.id === legacySeasonId)
    if (!legacySeason) return

    navigate(buildSeasonHomePath(legacySeason), { replace: true })
  }, [isPendingSeasons, legacySeasonId, navigate, seasonList, seasonSlug])

  useEffect(() => {
    if (isPendingSeasons || !seasonSlug || !selectedSeason) return
    if (findSeasonBySlug(seasonList, seasonSlug)) return

    const fallbackSeason = findSelectedSeason(seasonList, null)
    if (!fallbackSeason) return

    navigate(replaceSeasonSlugInPath(location.pathname, seasonList, fallbackSeason), {
      replace: true,
    })
  }, [isPendingSeasons, location.pathname, navigate, seasonList, seasonSlug, selectedSeason])

  function setSeasonId(seasonId: string) {
    const nextSeason = seasonList.find((season) => season.id === seasonId)
    if (!nextSeason) return

    if (!seasonSlug) {
      navigate(buildSeasonHomePath(nextSeason), { replace: true })
      return
    }

    navigate(replaceSeasonSlugInPath(location.pathname, seasonList, nextSeason), {
      replace: true,
    })
  }

  return {
    seasons: seasonList,
    isPendingSeasons,
    isSeasonReady,
    selectedSeasonId,
    selectedSeason,
    setSeasonId,
    homePath: selectedSeason ? buildSeasonHomePath(selectedSeason) : '/',
  }
}
