import { FilterTab } from '../hooks'

interface FilterTabsProps {
  activeTab: FilterTab
  onTabChange: (tab: FilterTab) => void
}

const TABS: { key: FilterTab; label: string; color: string }[] = [
  { key: 'all', label: 'All', color: 'text-warcraft-gold' },
  { key: 'yeet', label: 'Yeets', color: 'text-mistake-yeet' },
  { key: 'death', label: 'Deaths', color: 'text-mistake-death' },
]

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
          className={`wc-tab flex-1 ${
            activeTab === tab.key ? `wc-tab-active ${tab.color}` : ''
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
