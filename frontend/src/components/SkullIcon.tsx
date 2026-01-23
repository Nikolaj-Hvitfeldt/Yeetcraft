interface SkullIconProps {
  className?: string
}

/**
 * Skull icon SVG component for error/death displays.
 */
export function SkullIcon({ className = '' }: SkullIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12c0 3.69 2.47 6.86 6 8.25V22h8v-1.75c3.53-1.39 6-4.56 6-8.25 0-5.52-4.48-10-10-10zm-2 15h-1v-2h1v2zm0-4h-1V9h1v4zm5 4h-1v-2h1v2zm0-4h-1V9h1v4z" />
    </svg>
  )
}
