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

interface TableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  enableSorting?: boolean
  enablePagination?: boolean
  pageSize?: number
  className?: string
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
        <table className="wc-table-element">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`wc-table-header ${
                      header.column.getCanSort() ? 'wc-table-header-sortable' : ''
                    } ${header.column.getIsSorted() ? 'wc-table-header-sorted' : ''}`}
                    style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-2">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <span className="wc-table-sort-indicator">
                          {{
                            asc: '↑',
                            desc: '↓',
                          }[header.column.getIsSorted() as string] ?? '⇅'}
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
                    <td key={cell.id} className="wc-table-cell">
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
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="wc-button"
          >
            Previous
          </button>
          <span className="text-warcraft-text-muted">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="wc-button"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
