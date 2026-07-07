export function TableHeader({ columns, className }: TableHeaderProps) {
  return (
    <div
      className={`grid h-12 items-center rounded-t-2xl bg-surface-section px-lg text-xs font-bold leading-4 ${className ?? ''}`}
      style={{ gridTemplateColumns: columns.map((column) => column.width ?? '1fr').join(' ') }}
    >
      {columns.map((column) => (
        <span key={column.id} className={column.className}>
          {column.label}
        </span>
      ))}
    </div>
  )
}

interface TableHeaderColumn {
  id: string
  label: string
  className?: string
  width?: string
}

interface TableHeaderProps {
  columns: TableHeaderColumn[]
  className?: string
}
