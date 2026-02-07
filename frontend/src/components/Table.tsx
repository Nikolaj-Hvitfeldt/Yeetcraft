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
 * Reusable table component with Warcraft-themed styling.
 * Built on TanStack Table for sorting, pagination, and filtering.
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
        if ('playerName' in row) return String(row.playerName)
      }
      return String(index)
    },
  })

  return (
    <div className={`wc-table ${className}`}>
      <div className="wc-table-container">
        <table className="wc-table-element" style={{ tableLayout }}>
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
                    className={`wc-table-header ${
                      header.column.getCanSort() ? 'wc-table-header-sortable' : ''
                    } ${header.column.getIsSorted() ? 'wc-table-header-sorted' : ''} ${
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
                        <span className="wc-table-sort-indicator">
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
                <td colSpan={columns.length} className="wc-table-empty">
                  <div className="py-12 text-center text-warcraft-text-muted">
                    <p>No data available</p>
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row, index) => (
                <tr
                  key={row.id}
                  className={`wc-table-row animate-slide-up stagger-${Math.min(index + 1, 10)}`}
                  style={{ animationFillMode: 'both' }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={`wc-table-cell ${getCellClassName(cell.column.columnDef.meta)}`}
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
        <div className="wc-table-pagination">
          <button
            type="button"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="wc-button"
            aria-label="Previous page"
          >
            Previous
          </button>
          <span className="text-warcraft-text-muted">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <button
            type="button"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="wc-button"
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
