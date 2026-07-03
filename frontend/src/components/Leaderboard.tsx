import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { type CellContext, type ColumnDef, type Table as ReactTable } from '@tanstack/react-table'
import { PlayerStats, FilterTab } from '../hooks'
import { FilterTabs } from './FilterTabs'
import { Table } from './Table'
import { SkullIcon } from './SkullIcon'

const RANK_CLASS_BY_PLACE: Record<number, string> = {
  1: 'border-accent-primary text-accent-primary',
  2: 'border-stat-yeets text-stat-yeets',
  3: 'border-stat-deaths text-stat-deaths',
}

function getRankColorClass(rank: number): string {
  if (rank === 1) return 'text-accent-primary'
  if (rank === 2) return 'text-stat-yeets'
  if (rank === 3) return 'text-stat-deaths'
  return 'text-text-primary'
}

function getRank(table: ReactTable<PlayerStats>, rowId: string): number {
  const sortedRows = table.getSortedRowModel().rows
  return sortedRows.findIndex((r) => r.id === rowId) + 1
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
        meta: {
          align: 'center',
          headerClassName: 'w-10 sm:w-[60px] px-2',
          cellClassName: 'w-10 sm:w-[60px] px-2',
        },
        enableSorting: false,
        cell: ({ row, table }) => {
          const rank = getRank(table, row.id)
          const rankClass = RANK_CLASS_BY_PLACE[rank] ?? 'border-border-subtle text-text-secondary'

          return (
            <div className="flex justify-center">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-heading text-lg font-bold ${rankClass}`}>{rank}</div>
            </div>
          )
        },
      },
      {
        accessorKey: 'playerName',
        header: 'Player',
        meta: { align: 'center' },
        enableSorting: true,
        cell: ({ getValue, row }) => {
          const value = getValue()
          if (typeof value !== 'string') return null
          return (
            <Link
              to={`/player/${row.original.playerId}`}
              className="block truncate text-lg font-semibold text-text-primary transition-colors hover:text-accent-primary"
            >
              {value}
            </Link>
          )
        },
      },
    ]

    function countCell({ getValue, row, table }: CellContext<PlayerStats, unknown>) {
      const rank = getRank(table, row.id)

      const value = getValue()
      if (typeof value !== 'number') return null

      const rankColorClass = getRankColorClass(rank)

      return (
        <div className="text-center">
          <span className={`text-2xl font-heading font-bold ${rankColorClass}`}>{value}</span>
        </div>
      )
    }

    if (activeTab === 'all') {
      baseColumns.push({
        accessorKey: 'total',
        header: 'Total',
        meta: { align: 'center' },
        enableSorting: true,
        cell: countCell,
      })
      baseColumns.push({
        id: 'breakdown',
        header: 'Breakdown',
        meta: { align: 'center' },
        enableSorting: false,
        cell: ({ row }) => (
          <div className="hidden sm:flex justify-center gap-2">
            {row.original.deaths > 0 && (
              <span className="rounded-sm border border-stat-deaths px-3 py-1 text-xs font-bold uppercase tracking-wider text-stat-deaths" title="Deaths">
                {row.original.deaths}
              </span>
            )}
            {row.original.yeets > 0 && (
              <span className="rounded-sm border border-stat-yeets px-3 py-1 text-xs font-bold uppercase tracking-wider text-stat-yeets" title="Yeets">
                {row.original.yeets}
              </span>
            )}
          </div>
        ),
      })
    } else if (activeTab === 'death') {
      // Keep a 3-column layout aligned with the 3 tabs: [ALL] [DEATHS] [YEETS]
      // For the Deaths tab, leave the middle column blank and place the metric under YEETS.
      baseColumns.push({
        id: 'spacer',
        header: '',
        meta: { align: 'center' },
        enableSorting: false,
        cell: () => null,
      })
      baseColumns.push({
        accessorKey: 'deaths',
        header: 'Deaths',
        meta: { align: 'center' },
        enableSorting: true,
        cell: countCell,
      })
    } else {
      baseColumns.push({
        id: 'spacer',
        header: '',
        meta: { align: 'center' },
        enableSorting: false,
        cell: () => null,
      })
      baseColumns.push({
        accessorKey: 'yeets',
        header: 'Yeets',
        meta: { align: 'center' },
        enableSorting: true,
        cell: countCell,
      })
    }

    return baseColumns
  }, [activeTab])

  return (
    <main className="overflow-hidden rounded-md border border-border-subtle bg-surface-base animate-slide-up" style={{ animationDelay: '0.2s' }}>
      {/* Tab Navigation */}
      <FilterTabs activeTab={activeTab} onTabChange={onTabChange} />

      {/* Leaderboard Table */}
      {leaderboard.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-x-auto" style={{ minHeight: 0 }}>
          <Table
            data={leaderboard}
            columns={columns}
            enableSorting={true}
            enablePagination={false}
            showSortIndicator={false}
            tableLayout="fixed"
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
    <div className="py-12 text-center text-text-secondary">
      <SkullIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
      <p>No deaths recorded yet. Impressive!</p>
    </div>
  )
}

function LeaderboardFooter({ playerCount }: LeaderboardFooterProps) {
  return (
    <div className="border-t border-border-subtle bg-background-app px-6 py-4">
      <p className="text-center text-text-secondary text-sm">
        {/* TODO: Dungeon filter dropdown will go here */}
        Showing all dungeons • {playerCount} {playerCount === 1 ? 'player' : 'players'} ranked
      </p>
    </div>
  )
}

interface LeaderboardProps {
  leaderboard: PlayerStats[]
  activeTab: FilterTab
  onTabChange: (tab: FilterTab) => void
}

interface LeaderboardFooterProps {
  playerCount: number
}
