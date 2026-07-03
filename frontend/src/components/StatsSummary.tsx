/**
 * Quick stats summary displayed above the leaderboard.
 */
export function StatsSummary({ total, deaths, yeets }: StatsSummaryProps) {
  return (
    <div
      className="flex flex-wrap justify-center gap-4 mb-8 animate-fade-in"
      style={{ animationDelay: '0.1s' }}
    >
      <StatCounter value={total} label="Total" color="total" />
      <StatCounter value={yeets} label="Yeets" color="yeets" />
      <StatCounter value={deaths} label="Deaths" color="deaths" />
    </div>
  )
}

function StatCounter({ value, label, color }: StatCounterProps) {
  const colorClassName =
    color === 'total'
      ? 'text-stat-total'
      : color === 'yeets'
        ? 'text-stat-yeets'
        : 'text-stat-deaths'

  return (
    <div className="flex min-w-[60px] flex-col items-center justify-center rounded-sm border border-border-subtle bg-surface-base px-3 py-1">
      <span className={`text-xl font-bold font-heading ${colorClassName}`}>{value}</span>
      <span className="text-xs uppercase tracking-wide text-text-secondary">{label}</span>
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
  color: 'total' | 'yeets' | 'deaths'
}
