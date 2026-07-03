import { useMemo } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { Table } from './Table'
import { DungeonStats } from '../api/types'

/**
 * Table component for displaying a player's aggregated dungeon stats.
 */
export function PlayerProfileTable({ dungeons, enablePagination = false }: PlayerProfileTableProps) {
  const columns = useMemo<ColumnDef<DungeonStats>[]>(
    () => [
      {
        accessorFn: (row) => row.dungeon.name,
        id: 'dungeon',
        header: 'Dungeon',
        enableSorting: true,
        cell: ({ getValue }) => {
          const value = getValue()
          if (typeof value !== 'string') return null
          return <span className="font-semibold text-text-primary">{value}</span>
        },
      },
      {
        accessorKey: 'totalMistakes',
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
      data={dungeons}
      columns={columns}
      enableSorting={true}
      enablePagination={enablePagination}
      showSortIndicator={false}
      pageSize={10}
    />
  )
}

interface PlayerProfileTableProps {
  dungeons: DungeonStats[]
  enablePagination?: boolean
}
