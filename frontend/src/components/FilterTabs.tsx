import type { CSSProperties } from 'react'
import { FilterTab } from '../hooks'

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'death', label: 'Deaths' },
  { key: 'yeet', label: 'Yeets' },
]

function getTabColor(tab: FilterTab) {
  if (tab === 'all') return 'var(--color-accent-primary)'
  if (tab === 'death') return 'var(--color-stat-deaths)'
  return 'var(--color-stat-yeets)'
}

/**
 * Filter tabs for switching between death types.
 */
export function FilterTabs({ activeTab, onTabChange }: FilterTabsProps) {
  return (
    <nav
      role="tablist"
      aria-label="Leaderboard tabs"
      className="grid border-b border-border-subtle grid-cols-[40px_1fr_1fr_1fr] sm:grid-cols-[60px_1fr_1fr_1fr]"
    >
      {/* Spacer aligns with the table's # column */}
      <div aria-hidden="true" className="border-b-2 border-transparent" />
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.key}
          onClick={() => onTabChange(tab.key)}
          style={
            {
              color: activeTab === tab.key ? getTabColor(tab.key) : 'var(--color-text-secondary)',
              borderColor: activeTab === tab.key ? getTabColor(tab.key) : 'transparent',
            } as CSSProperties
          }
          className="w-full border-b-2 px-3 py-3 text-xs uppercase tracking-wider transition-colors sm:px-6 sm:text-sm font-heading hover:bg-surface-section"
        >
          {tab.label}
        </button>
      ))}
    </nav>
  )
}

interface FilterTabsProps {
  activeTab: FilterTab
  onTabChange: (tab: FilterTab) => void
}
