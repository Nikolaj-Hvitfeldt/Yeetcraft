import { useMemo } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { Table } from './Table'
import { MistakeDto } from '../api/types'

interface PlayerProfileTableProps {
  mistakes: MistakeDto[]
  enablePagination?: boolean
}

/**
 * Table component for displaying a player's mistakes.
 * Can be used in player profile pages.
 * 
 * Example usage:
 * ```tsx
 * <PlayerProfileTable 
 *   mistakes={playerMistakes} 
 *   enablePagination={true}
 * />
 * ```
 */
export function PlayerProfileTable({ mistakes, enablePagination = false }: PlayerProfileTableProps) {
  const columns = useMemo<ColumnDef<MistakeDto>[]>(
    () => [
      {
        accessorKey: 'dungeon',
        header: 'Dungeon',
        enableSorting: true,
        cell: ({ getValue }) => (
          <span className="text-warcraft-text font-semibold">{getValue() as string}</span>
        ),
      },
      {
        accessorKey: 'type',
        header: 'Type',
        enableSorting: true,
        cell: ({ getValue }) => {
          const type = getValue() as string
          const badgeClass = type === 'death' ? 'mistake-badge-death' : 'mistake-badge-yeet'
          return (
            <span className={`mistake-badge ${badgeClass}`}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </span>
          )
        },
      },
      {
        accessorKey: 'description',
        header: 'Description',
        enableSorting: false,
        cell: ({ getValue }) => (
          <span className="text-warcraft-text-muted">{getValue() as string}</span>
        ),
      },
      {
        accessorKey: 'timestamp',
        header: 'Date',
        enableSorting: true,
        cell: ({ getValue }) => {
          const timestamp = getValue() as number
          const date = new Date(timestamp)
          return (
            <span className="text-warcraft-text-muted text-sm">
              {date.toLocaleDateString()} {date.toLocaleTimeString()}
            </span>
          )
        },
      },
    ],
    []
  )

  return (
    <Table
      data={mistakes}
      columns={columns}
      enableSorting={true}
      enablePagination={enablePagination}
      pageSize={10}
    />
  )
}
