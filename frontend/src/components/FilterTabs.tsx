import type { CSSProperties } from 'react'
import { FilterTab } from '../hooks'

interface FilterTabsProps {
  activeTab: FilterTab
  onTabChange: (tab: FilterTab) => void
}

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
  // Keep tabs evenly sized while still aligning with the table columns:
  // [#] [ALL] [DEATHS] [YEETS]
  const gridTemplateColumns = '60px 1fr 1fr 1fr'

  return (
    <nav
      className="grid border-b border-warcraft-border"
      style={{ gridTemplateColumns }}
    >
      {/* Spacer aligns with the table's # column */}
      <div className="border-b-2 border-transparent" />
      {TABS.map((tab) => (
        <button
          key={tab.key}
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
