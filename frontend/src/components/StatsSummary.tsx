/**
 * Quick stats summary displayed above the leaderboard.
 */
export function StatsSummary({ total, deaths, yeets }: StatsSummaryProps) {
  return (
    <div
      className="flex flex-wrap justify-center gap-4 mb-8 animate-fade-in"
      style={{ animationDelay: '0.1s' }}
    >
      <StatCounter value={total} label="Total" color="legendary" />
      <StatCounter value={yeets} label="Yeets" color="epic" />
      <StatCounter value={deaths} label="Deaths" color="rare" />
    </div>
  )
}

function StatCounter({ value, label, color }: StatCounterProps) {
  const colorClassName =
    color === 'legendary'
      ? 'text-rarity-legendary'
      : color === 'epic'
        ? 'text-rarity-epic'
        : 'text-rarity-rare'

  return (
    <div className="stat-counter">
      <span className={`stat-counter-value ${colorClassName}`}>{value}</span>
      <span className="stat-counter-label">{label}</span>
    </div>
  )
}

interface StatsSummaryProps {
  total: number
  deaths: number
  yeets: number
}

interface StatCounterProps {
  value: number
  label: string
  color: 'legendary' | 'epic' | 'rare'
}
