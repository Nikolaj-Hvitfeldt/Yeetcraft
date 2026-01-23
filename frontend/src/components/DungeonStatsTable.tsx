import { useMemo } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { Table } from './Table'
import { MistakeDto } from '../api/types'

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
        cell: ({ getValue }) => (
          <span className="text-lg font-semibold text-warcraft-text">
            {getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: 'total',
        header: 'Total',
        enableSorting: true,
        cell: ({ getValue }) => (
          <div className="text-center">
            <span className="text-2xl font-warcraft font-bold text-warcraft-gold">
              {getValue() as number}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'deaths',
        header: 'Deaths',
        enableSorting: true,
        cell: ({ getValue }) => (
          <div className="text-center">
            <span className="mistake-badge mistake-badge-death">
              {getValue() as number}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'yeets',
        header: 'Yeets',
        enableSorting: true,
        cell: ({ getValue }) => (
          <div className="text-center">
            <span className="mistake-badge mistake-badge-yeet">
              {getValue() as number}
            </span>
          </div>
        ),
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
      pageSize={10}
    />
  )
}
