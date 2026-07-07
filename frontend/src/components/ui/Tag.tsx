import type { ReactNode } from 'react'

export function Tag({ children, className }: TagProps) {
  return (
    <span
      className={`inline-flex items-center rounded-pill border border-border-subtle bg-surface-base px-md py-xs text-xs font-semibold leading-4 text-text-secondary ${className ?? ''}`}
    >
      {children}
    </span>
  )
}

interface TagProps {
  children: ReactNode
  className?: string
}
