import { useMemo } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { Table } from './Table'
import { MistakeDto } from '../api/types'

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
        cell: ({ getValue }) => {
          const value = getValue()
          if (typeof value !== 'string') return null
          return <span className="text-warcraft-text font-semibold">{value}</span>
        },
      },
      {
        accessorKey: 'type',
        header: 'Type',
        enableSorting: true,
        cell: ({ getValue }) => {
          const type = getValue()
          if (typeof type !== 'string') return null
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
        cell: ({ getValue }) => {
          const value = getValue()
          if (typeof value !== 'string') return null
          return <span className="text-warcraft-text-muted">{value}</span>
        },
      },
      {
        accessorKey: 'timestamp',
        header: 'Date',
        enableSorting: true,
        cell: ({ getValue }) => {
          const timestamp = getValue()
          if (typeof timestamp !== 'number') return null
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

interface PlayerProfileTableProps {
  mistakes: MistakeDto[]
  enablePagination?: boolean
}
