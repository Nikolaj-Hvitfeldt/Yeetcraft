import type { CSSProperties } from 'react'
import type { FilterTab } from '../../hooks'

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'death', label: 'Deaths' },
  { key: 'yeet', label: 'Yeets' },
]

function getTabColor(tab: FilterTab) {
  if (tab === 'death') return 'var(--color-stat-deaths)'
  if (tab === 'yeet') return 'var(--color-stat-yeets)'
  return 'var(--color-accent-primary)'
}

export function LeaderboardFilter({ activeTab, seasonLabel, onTabChange }: LeaderboardFilterProps) {
  return (
    <div className="flex flex-col items-start gap-sm sm:items-end">
      <p className="rounded-md border border-border-subtle bg-surface-section px-md py-sm text-xs font-semibold text-text-primary shadow-lg">
        {seasonLabel}
      </p>
      <div className="flex rounded-md border border-border-subtle bg-surface-base p-xs shadow-lg">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className="rounded-sm px-md py-sm text-xs font-bold uppercase tracking-wide transition-colors"
              style={{
                backgroundColor: isActive ? getTabColor(tab.key) : 'transparent',
                color: isActive ? 'var(--color-background-app)' : 'var(--color-text-secondary)',
              } as CSSProperties}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

interface LeaderboardFilterProps {
  activeTab: FilterTab
  seasonLabel: string
  onTabChange: (tab: FilterTab) => void
}
