import { useMemo } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { PlayerStats, FilterTab } from '../hooks'
import { FilterTabs } from './FilterTabs'
import { Table } from './Table'
import { SkullIcon } from './SkullIcon'

interface LeaderboardProps {
  leaderboard: PlayerStats[]
  activeTab: FilterTab
  onTabChange: (tab: FilterTab) => void
}

/**
 * Main leaderboard panel with tabs and player rankings.
 * Uses TanStack Table for sorting and future pagination.
 */
export function Leaderboard({ leaderboard, activeTab, onTabChange }: LeaderboardProps) {
  const columns = useMemo<ColumnDef<PlayerStats>[]>(() => {
    const baseColumns: ColumnDef<PlayerStats>[] = [
      {
        id: 'rank',
        header: '#',
        size: 60,
        meta: { align: 'center' },
        enableSorting: false,
        cell: ({ row, table }) => {
          const sortedRows = table.getSortedRowModel().rows
          const rank = sortedRows.findIndex((r) => r.id === row.id) + 1
          const rankClass =
            rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : 'rank-default'
          return (
            <div className="flex justify-center">
              <div className={`rank-number ${rankClass}`}>{rank}</div>
            </div>
          )
        },
      },
      {
        accessorKey: 'playerName',
        header: 'Player',
        enableSorting: true,
        cell: ({ getValue }) => (
          <span className="text-lg font-semibold text-warcraft-text truncate block">
            {getValue() as string}
          </span>
        ),
      },
    ]

    // Count column — shows relevant total based on active tab
    // Note: data fields are plural (deaths/yeets) while tabs are singular (death/yeet)
    const countAccessor =
      activeTab === 'all' ? 'total' : activeTab === 'death' ? 'deaths' : 'yeets'
    const countLabel =
      activeTab === 'all'
        ? 'Total'
        : activeTab.charAt(0).toUpperCase() + activeTab.slice(1) + 's'

    baseColumns.push({
      accessorKey: countAccessor,
      header: countLabel,
      size: 100,
      meta: { align: 'center' },
      enableSorting: true,
      cell: ({ getValue, row, table }) => {
        const sortedRows = table.getSortedRowModel().rows
        const rank = sortedRows.findIndex((r) => r.id === row.id) + 1

        const rankColorClass =
          rank === 1
            ? 'text-warcraft-gold' // Legendary (orange)
            : rank === 2
              ? 'text-mistake-yeet' // Epic (purple)
              : rank === 3
                ? 'text-mistake-death' // Rare (blue)
                : 'text-warcraft-text-muted' // Everyone else

        return (
          <div className="text-center">
            <span className={`text-2xl font-warcraft font-bold ${rankColorClass}`}>
              {getValue() as number}
            </span>
          </div>
        )
      },
    })

    if (activeTab === 'all') {
      baseColumns.push({
        id: 'breakdown',
        header: 'Breakdown',
        size: 150,
        meta: { align: 'center' },
        enableSorting: false,
        cell: ({ row }) => (
          <div className="hidden sm:flex justify-center gap-2">
            {row.original.deaths > 0 && (
              <span className="mistake-badge mistake-badge-death" title="Deaths">
                {row.original.deaths}
              </span>
            )}
            {row.original.yeets > 0 && (
              <span className="mistake-badge mistake-badge-yeet" title="Yeets">
                {row.original.yeets}
              </span>
            )}
          </div>
        ),
      })
    }

    return baseColumns
  }, [activeTab])

  return (
    <main className="wc-panel-gold animate-slide-up" style={{ animationDelay: '0.2s' }}>
      {/* Tab Navigation */}
      <FilterTabs activeTab={activeTab} onTabChange={onTabChange} />

      {/* Leaderboard Table */}
      {leaderboard.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-hidden" style={{ minHeight: 0 }}>
          <Table
            data={leaderboard}
            columns={columns}
            enableSorting={true}
            enablePagination={false}
            showSortIndicator={false}
          />
        </div>
      )}

      {/* Footer */}
      <LeaderboardFooter playerCount={leaderboard.length} />
    </main>
  )
}

function EmptyState() {
  return (
    <div className="py-12 text-center text-warcraft-text-muted">
      <SkullIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
      <p>No deaths recorded yet. Impressive!</p>
    </div>
  )
}

interface LeaderboardFooterProps {
  playerCount: number
}

function LeaderboardFooter({ playerCount }: LeaderboardFooterProps) {
  return (
    <div className="px-6 py-4 border-t border-warcraft-border bg-warcraft-bg/30">
      <p className="text-center text-warcraft-text-dark text-sm">
        {/* TODO: Dungeon filter dropdown will go here */}
        Showing all dungeons • {playerCount} {playerCount === 1 ? 'player' : 'players'} ranked
      </p>
    </div>
  )
}
