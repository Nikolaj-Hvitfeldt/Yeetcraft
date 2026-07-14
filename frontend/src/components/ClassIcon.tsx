import { classes, type ClassKey } from '../assets/classes'
import { cn } from '../utils/cn'

export function ClassIcon({
  classKey,
  size = 18,
  className,
}: ClassIconProps) {
  const iconUrl = classes[classKey]

  if (!iconUrl) {
    return null
  }

  return (
    <img
      src={iconUrl}
      alt=""
      width={size}
      height={size}
      loading="eager"
      decoding="async"
      aria-hidden
      className={cn('shrink-0 rounded-sm object-cover', className)}
      style={{ width: size, height: size }}
    />
  )
}

interface ClassIconProps {
  classKey: ClassKey
  size?: number
  className?: string
}
