export function TableHeader({ columns, className, gridTemplateColumns }: TableHeaderProps) {
  const resolvedGrid =
    gridTemplateColumns ?? columns.map((column) => column.width ?? '1fr').join(' ')

  return (
    <div
      className={`grid h-[49px] w-full items-center bg-surface-section px-lg text-xs font-bold leading-4 ${className ?? ''}`}
      style={{ gridTemplateColumns: resolvedGrid }}
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
  gridTemplateColumns?: string
}
