import { useMemo } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { Table } from './Table'

/**
 * Table component for displaying player stats within a specific dungeon.
 * Can be used in dungeon stats pages.
 * 
 * Example usage:
 * ```tsx
 * <DungeonStatsTable 
 *   stats={dungeonPlayerStats} 
 *   enablePagination={true}
 * />
 * ```
 */
export function DungeonStatsTable({ stats, enablePagination = false }: DungeonStatsTableProps) {
  const columns = useMemo<ColumnDef<DungeonMistakeStats>[]>(
    () => [
      {
        accessorKey: 'playerName',
        header: 'Player',
        enableSorting: true,
        cell: ({ getValue }) => {
          const value = getValue()
          if (typeof value !== 'string') return null
          return <span className="text-lg font-semibold text-text-primary">{value}</span>
        },
      },
      {
        accessorKey: 'total',
        header: 'Total',
        enableSorting: true,
        cell: ({ getValue }) => {
          const value = getValue()
          if (typeof value !== 'number') return null
          return (
            <div className="text-center">
              <span className="text-2xl font-heading font-bold text-accent-primary">{value}</span>
            </div>
          )
        },
      },
      {
        accessorKey: 'deaths',
        header: 'Deaths',
        enableSorting: true,
        cell: ({ getValue }) => {
          const value = getValue()
          if (typeof value !== 'number') return null
          return (
            <div className="text-center">
              <span className="rounded-sm border border-stat-deaths px-3 py-1 text-xs font-bold uppercase tracking-wider text-stat-deaths">{value}</span>
            </div>
          )
        },
      },
      {
        accessorKey: 'yeets',
        header: 'Yeets',
        enableSorting: true,
        cell: ({ getValue }) => {
          const value = getValue()
          if (typeof value !== 'number') return null
          return (
            <div className="text-center">
              <span className="rounded-sm border border-stat-yeets px-3 py-1 text-xs font-bold uppercase tracking-wider text-stat-yeets">{value}</span>
            </div>
          )
        },
      },
    ],
    []
  )

  return (
    <Table
      data={stats}
      columns={columns}
      enableSorting={true}
      enablePagination={enablePagination}
      showSortIndicator={false}
      pageSize={10}
    />
  )
}

interface DungeonMistakeStats {
  playerName: string
  total: number
  deaths: number
  yeets: number
}

interface DungeonStatsTableProps {
  stats: DungeonMistakeStats[]
  enablePagination?: boolean
}
