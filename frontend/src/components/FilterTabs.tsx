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
  return (
    <nav className="flex border-b border-warcraft-border">
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
          className={`wc-tab flex-1 ${
            activeTab === tab.key ? 'wc-tab-active' : ''
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
