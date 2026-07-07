import { Link } from 'react-router-dom'

export function BackButton({ to = '/', label = 'Back to leaderboard', className }: BackButtonProps) {
  return (
    <Link
      to={to}
      className={`inline-flex h-11 items-center gap-sm rounded-2xl border border-border-subtle bg-surface-base px-lg text-sm font-semibold leading-[18px] text-text-link transition-colors hover:border-accent-primary hover:text-accent-primary ${className ?? ''}`}
    >
      <ChevronLeftIcon className="size-4 shrink-0" />
      {label}
    </Link>
  )
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M10 12L6 8L10 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

interface BackButtonProps {
  to?: string
  label?: string
  className?: string
}
