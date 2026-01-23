interface StatsSummaryProps {
  total: number
  deaths: number
  yeets: number
}

/**
 * Quick stats summary displayed above the leaderboard.
 */
export function StatsSummary({ total, deaths, yeets }: StatsSummaryProps) {
  return (
    <div
      className="flex justify-center gap-4 mb-8 animate-fade-in"
      style={{ animationDelay: '0.1s' }}
    >
      <StatCounter value={total} label="Total" color="text-warcraft-gold" />
      <StatCounter value={deaths} label="Deaths" color="text-mistake-death" />
      <StatCounter value={yeets} label="Yeets" color="text-mistake-yeet" />
    </div>
  )
}

interface StatCounterProps {
  value: number
  label: string
  color: string
}

function StatCounter({ value, label, color }: StatCounterProps) {
  return (
    <div className="stat-counter">
      <span className={`stat-counter-value ${color}`}>{value}</span>
      <span className="stat-counter-label">{label}</span>
    </div>
  )
}
