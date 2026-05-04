import type { CSSProperties } from 'react'
import { FilterTab } from '../hooks'

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'death', label: 'Deaths' },
  { key: 'yeet', label: 'Yeets' },
]

function getTabColor(tab: FilterTab) {
  if (tab === 'all') return 'var(--theme-accent)'
  if (tab === 'death') return '#0070dd'
  return '#a335ee'
}

/**
 * Filter tabs for switching between death types.
 */
export function FilterTabs({ activeTab, onTabChange }: FilterTabsProps) {
  return (
    <nav
      role="tablist"
      aria-label="Leaderboard tabs"
      className="grid border-b border-warcraft-border grid-cols-[40px_1fr_1fr_1fr] sm:grid-cols-[60px_1fr_1fr_1fr]"
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
              '--wc-tab-hover-color': getTabColor(tab.key),
              '--wc-tab-active-color': getTabColor(tab.key),
            } as CSSProperties
          }
          className={`wc-tab w-full ${
            activeTab === tab.key ? 'wc-tab-active' : ''
          }`}
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
