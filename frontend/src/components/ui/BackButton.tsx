import { useLocation, useNavigate } from 'react-router-dom'
import { resetScrollPosition } from '../../utils/scroll'

export function BackButton({
  fallbackTo = '/',
  label = 'Back',
  className,
}: BackButtonProps) {
  const navigate = useNavigate()
  const location = useLocation()

  function handleBack() {
    if (location.key !== 'default') {
      navigate(-1)
    } else {
      navigate(fallbackTo)
    }

    resetScrollPosition()
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`inline-flex h-11 appearance-none items-center justify-center gap-sm rounded-2xl border border-border-subtle bg-surface-section px-lg text-sm font-semibold leading-none transition-colors hover:border-accent-primary hover:text-accent-primary ${className ?? ''}`}
    >
      <ChevronLeftIcon className="size-4 shrink-0" />
      <span className="leading-none">{label}</span>
    </button>
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
  fallbackTo?: string
  label?: string
  className?: string
}
