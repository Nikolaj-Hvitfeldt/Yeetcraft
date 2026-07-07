export function CrownIcon({ className }: CrownIconProps) {
  return (
    <svg
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M3 13.5H15M4.1 11.25L3.25 5.25L6.75 8.1L9 3.75L11.25 8.1L14.75 5.25L13.9 11.25H4.1Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.25 14.75H12.75"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

interface CrownIconProps {
  className?: string
}
