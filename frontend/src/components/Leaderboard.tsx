import { useMemo } from 'react'
import { type CellContext, type ColumnDef, type Table as ReactTable } from '@tanstack/react-table'
import { PlayerStats, FilterTab, type LeaderboardBy } from '../hooks'
import { FilterTabs } from './FilterTabs'
import { Table } from './Table'
import { SkullIcon } from './SkullIcon'

const RANK_CLASS_BY_PLACE: Record<number, string> = {
  1: 'rank-1',
  2: 'rank-2',
  3: 'rank-3',
}

function getRankColorClass(rank: number): string {
  if (rank === 1) return 'text-rarity-legendary' // Legendary orange (fixed across themes)
  if (rank === 2) return 'text-rarity-epic' // Epic purple
  if (rank === 3) return 'text-rarity-rare' // Rare blue
  if (rank === 4) return 'text-rarity-uncommon' // Uncommon green (fixed across themes)
  if (rank === 5) return 'text-rarity-common' // Common white
  return 'text-rarity-poor' // Poor gray
}

function getRank(table: ReactTable<PlayerStats>, rowId: string): number {
  const sortedRows = table.getSortedRowModel().rows
  return sortedRows.findIndex((r) => r.id === rowId) + 1
}

/**
 * Main leaderboard panel with tabs and player/character rankings.
 */
export function Leaderboard({ leaderboard, leaderboardBy, onLeaderboardByChange, activeTab, onTabChange }: LeaderboardProps) {
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
          const rankClass = RANK_CLASS_BY_PLACE[rank] ?? 'rank-default'

          return (
            <div className="flex justify-center">
              <div className={`rank-number ${rankClass}`}>{rank}</div>
            </div>
          )
        },
      },
      ...(leaderboardBy === 'character'
        ? [
            {
              id: 'characterName',
              accessorKey: 'characterName',
              header: 'Character',
              meta: { align: 'center' as const },
              enableSorting: true,
              cell: ({ getValue }: CellContext<PlayerStats, unknown>) => {
                const value = getValue()
                const name = value ?? (typeof value === 'string' ? value : '')
                return <span className="text-lg font-semibold text-warcraft-text truncate block">{String(name || '—')}</span>
              },
            } as ColumnDef<PlayerStats>,
            {
              accessorKey: 'playerName',
              header: 'Player',
              meta: { align: 'center' as const },
              enableSorting: true,
              cell: ({ getValue }: CellContext<PlayerStats, unknown>) => {
                const value = getValue()
                if (typeof value !== 'string') return null
                return <span className="text-warcraft-text truncate block">{value}</span>
              },
            } as ColumnDef<PlayerStats>,
          ]
        : [
            {
              accessorKey: 'playerName',
              header: 'Player',
              meta: { align: 'center' as const },
              enableSorting: true,
              cell: ({ getValue }: CellContext<PlayerStats, unknown>) => {
                const value = getValue()
                if (typeof value !== 'string') return null
                return <span className="text-lg font-semibold text-warcraft-text truncate block">{value}</span>
              },
            } as ColumnDef<PlayerStats>,
          ]),
    ]

    function countCell({ getValue, row, table }: CellContext<PlayerStats, unknown>) {
      const rank = getRank(table, row.id)

      const value = getValue()
      if (typeof value !== 'number') return null

      const rankColorClass = getRankColorClass(rank)

      return (
        <div className="text-center">
          <span className={`text-2xl font-warcraft font-bold ${rankColorClass}`}>{value}</span>
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
  }, [activeTab, leaderboardBy])

  return (
    <main className="wc-panel-gold animate-slide-up" style={{ animationDelay: '0.2s' }}>
      {/* Leaderboard by: Player | Character */}
      <div className="flex justify-center gap-2 px-4 pt-4 pb-2">
        <button
          type="button"
          onClick={() => onLeaderboardByChange('player')}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${leaderboardBy === 'player' ? 'bg-warcraft-gold text-warcraft-bg' : 'text-warcraft-text-muted hover:text-warcraft-text'}`}
        >
          By player
        </button>
        <button
          type="button"
          onClick={() => onLeaderboardByChange('character')}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${leaderboardBy === 'character' ? 'bg-warcraft-gold text-warcraft-bg' : 'text-warcraft-text-muted hover:text-warcraft-text'}`}
        >
          By character
        </button>
      </div>
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
      <LeaderboardFooter playerCount={leaderboard.length} leaderboardBy={leaderboardBy} />
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

function LeaderboardFooter({ playerCount, leaderboardBy }: LeaderboardFooterProps) {
  const label = leaderboardBy === 'character'
    ? (playerCount === 1 ? 'character' : 'characters')
    : (playerCount === 1 ? 'player' : 'players')
  return (
    <div className="px-6 py-4 border-t border-warcraft-border bg-warcraft-bg/30">
      <p className="text-center text-warcraft-text-dark text-sm">
        Showing all dungeons • {playerCount} {label} ranked
      </p>
    </div>
  )
}

interface LeaderboardProps {
  leaderboard: PlayerStats[]
  leaderboardBy: LeaderboardBy
  onLeaderboardByChange: (by: LeaderboardBy) => void
  activeTab: FilterTab
  onTabChange: (tab: FilterTab) => void
}

interface LeaderboardFooterProps {
  playerCount: number
  leaderboardBy: LeaderboardBy
}
