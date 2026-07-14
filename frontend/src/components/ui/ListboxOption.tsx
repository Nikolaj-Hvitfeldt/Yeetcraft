import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

export function ListboxOption({
  isSelected,
  onSelect,
  children,
}: ListboxOptionProps) {
  return (
    <li>
      <button
        type="button"
        role="option"
        aria-selected={isSelected}
        className={cn(
          'flex w-full items-center rounded-sm px-sm py-sm text-left text-xs font-semibold transition-colors',
          isSelected
            ? 'bg-accent-secondary text-background-app'
            : 'text-text-primary hover:bg-surface-base',
        )}
        onClick={onSelect}
      >
        {children}
      </button>
    </li>
  )
}

interface ListboxOptionProps {
  isSelected: boolean
  onSelect: () => void
  children: ReactNode
}
