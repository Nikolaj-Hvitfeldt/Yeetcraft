import { useEffect, useState } from 'react'
import type { DungeonStats, PlayerStatsResponse } from '../api/types'
import { getUserFacingErrorMessage, isRetryableError } from '../utils/api-error'
import { useSetPlayerStats } from './useSetPlayerStats'

type DungeonBreakdownMode = 'browse' | 'edit'

export function usePlayerProfileEdit({
  playerStats,
  playerSlugParam,
  selectedSeasonId,
}: UsePlayerProfileEditOptions) {
  const [isEditing, setIsEditing] = useState(false)
  const [draftDungeons, setDraftDungeons] = useState<DungeonStats[] | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const { mutateAsync: setPlayerStats, isPending: isSaving } = useSetPlayerStats()

  useEffect(() => {
    setIsEditing(false)
    setDraftDungeons(null)
  }, [playerSlugParam, selectedSeasonId])

  useEffect(() => {
    if (!toastMessage) return
    const id = window.setTimeout(() => setToastMessage(null), 4000)
    return () => window.clearTimeout(id)
  }, [toastMessage])

  function handleEnterEdit() {
    if (!playerStats) return
    setDraftDungeons(structuredClone(playerStats.dungeons))
    setIsEditing(true)
    setToastMessage(null)
  }

  function handleCancelEdit() {
    setIsEditing(false)
    setDraftDungeons(null)
    setToastMessage(null)
  }

  function handleAdjustDraft(
    dungeonId: string,
    field: 'deaths' | 'yeets',
    delta: 1 | -1,
  ) {
    if (!draftDungeons) return

    setDraftDungeons((rows) =>
      (rows ?? []).map((row) => {
        if (row.dungeon.id !== dungeonId) return row

        const nextDeaths =
          field === 'deaths' ? Math.max(0, row.deaths + delta) : row.deaths
        const nextYeets =
          field === 'yeets' ? Math.max(0, row.yeets + delta) : row.yeets

        return {
          ...row,
          deaths: nextDeaths,
          yeets: nextYeets,
          totalMistakes: nextDeaths + nextYeets,
        }
      }),
    )
  }

  async function handleDoneEdit() {
    if (!playerStats || !draftDungeons || !selectedSeasonId) return

    const changed = draftDungeons.filter((draftRow) => {
      const original = playerStats.dungeons.find(
        (row) => row.dungeon.id === draftRow.dungeon.id,
      )
      if (!original) return true
      return (
        original.deaths !== draftRow.deaths || original.yeets !== draftRow.yeets
      )
    })

    if (changed.length === 0) {
      setIsEditing(false)
      setDraftDungeons(null)
      return
    }

    setIsEditing(false)
    setDraftDungeons(null)
    setToastMessage(null)

    const draftSnapshot = draftDungeons

    try {
      await setPlayerStats({
        playerId: playerStats.player.id,
        seasonId: selectedSeasonId,
        stats: changed.map((row) => ({
          dungeonId: row.dungeon.id,
          deaths: row.deaths,
          yeets: row.yeets,
        })),
      })
    } catch (error) {
      if (isRetryableError(error)) {
        return
      }

      setIsEditing(true)
      setDraftDungeons(draftSnapshot)
      setToastMessage(getUserFacingErrorMessage(error))
    }
  }

  const breakdownMode: DungeonBreakdownMode = isEditing ? 'edit' : 'browse'
  const dungeonsForBreakdown =
    breakdownMode === 'edit' && draftDungeons
      ? draftDungeons
      : (playerStats?.dungeons ?? [])

  return {
    breakdownMode,
    dungeonsForBreakdown,
    handleAdjustDraft,
    handleCancelEdit,
    handleDoneEdit,
    handleEnterEdit,
    isEditing,
    isSaving,
    toastMessage,
  }
}

interface UsePlayerProfileEditOptions {
  playerStats: PlayerStatsResponse | undefined
  playerSlugParam: string | undefined
  selectedSeasonId: string | undefined
}
