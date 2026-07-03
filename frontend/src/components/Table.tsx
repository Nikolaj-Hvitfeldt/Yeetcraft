import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { useState } from 'react'

const SORT_ICONS = {
  asc: '↑',
  desc: '↓',
} as const

function isColumnMeta(meta: unknown): meta is ColumnMeta {
  return !!meta && typeof meta === 'object'
}

function getAlign(meta: unknown): ColumnMeta['align'] | undefined {
  if (!isColumnMeta(meta)) return undefined
  const align = meta.align
  return align === 'left' || align === 'center' ? align : undefined
}

function getHeaderClassName(meta: unknown): string {
  if (!isColumnMeta(meta)) return ''
  const value = meta.headerClassName
  return typeof value === 'string' ? value : ''
}

function getCellClassName(meta: unknown): string {
  if (!isColumnMeta(meta)) return ''
  const value = meta.cellClassName
  return typeof value === 'string' ? value : ''
}

function getSortIcon(sort: false | 'asc' | 'desc'): string {
  if (!sort) return '⇅'
  return SORT_ICONS[sort]
}

function getAriaSort(sort: false | 'asc' | 'desc'): 'ascending' | 'descending' | 'none' {
  if (sort === 'asc') return 'ascending'
  if (sort === 'desc') return 'descending'
  return 'none'
}

/**
 * Reusable table component built on TanStack Table for sorting,
 * pagination, and filtering.
 */
export function Table<T>({
  data,
  columns,
  enableSorting = true,
  enablePagination = false,
  showSortIndicator = true,
  tableLayout = 'auto',
  pageSize = 10,
  className = '',
}: TableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
    getRowId: (row, index) => {
      // Use a unique identifier if available, otherwise fall back to index
      if (typeof row === 'object' && row !== null) {
        if ('id' in row) return String(row.id)
        if ('playerId' in row) return String(row.playerId)
        if ('playerName' in row) return String(row.playerName)
      }
      return String(index)
    },
  })

  return (
    <div className={`w-full ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ tableLayout }}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    data-align={getAlign(header.column.columnDef.meta)}
                    aria-sort={
                      header.column.getCanSort()
                        ? getAriaSort(header.column.getIsSorted())
                        : undefined
                    }
                    className={`px-3 py-3 text-left text-xs uppercase tracking-wider text-text-tertiary border-b border-border-subtle font-heading ${
                      header.column.getCanSort() ? 'cursor-pointer select-none transition-colors hover:bg-surface-section' : ''
                    } ${header.column.getIsSorted() ? 'text-accent-primary' : ''} ${
                      getAlign(header.column.columnDef.meta) === 'center' ? 'text-center' : ''
                    } ${getHeaderClassName(header.column.columnDef.meta)}`}
                    style={{
                      width:
                        typeof header.column.columnDef.size === 'number' &&
                        header.column.columnDef.size !== 150 // skip TanStack default
                          ? header.column.columnDef.size
                          : undefined,
                    }}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div
                      className={`flex items-center gap-2 ${
                        getAlign(header.column.columnDef.meta) === 'center' ? 'justify-center' : ''
                      }`}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {showSortIndicator && header.column.getCanSort() && (
                        <span className="text-sm text-accent-primary">
                          {getSortIcon(header.column.getIsSorted())}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center">
                  <div className="py-12 text-center text-text-secondary">
                    <p>No data available</p>
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-border-subtle transition-colors last:border-b-0 hover:bg-surface-section animate-slide-up"
                  style={{ animationFillMode: 'both' }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={`px-3 py-4 sm:px-6 ${getCellClassName(cell.column.columnDef.meta)}`}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {enablePagination && table.getPageCount() > 1 && (
        <div className="flex items-center justify-between border-t border-border-subtle bg-surface-section px-6 py-4">
          <button
            type="button"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="rounded-sm border border-accent-primary px-6 py-2 font-heading text-sm uppercase tracking-wider text-accent-primary transition-colors disabled:opacity-50"
            aria-label="Previous page"
          >
            Previous
          </button>
          <span className="text-text-secondary">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <button
            type="button"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="rounded-sm border border-accent-primary px-6 py-2 font-heading text-sm uppercase tracking-wider text-accent-primary transition-colors disabled:opacity-50"
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

interface ColumnMeta {
  align?: 'left' | 'center'
  headerClassName?: string
  cellClassName?: string
}

interface TableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  enableSorting?: boolean
  enablePagination?: boolean
  showSortIndicator?: boolean
  tableLayout?: 'auto' | 'fixed'
  pageSize?: number
  className?: string
}
