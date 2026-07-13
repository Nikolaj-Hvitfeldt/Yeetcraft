import { wowClasses, type WowClassKey } from '../assets/wow-classes'
import { cn } from '../utils/cn'

export function WowClassIcon({
  wowClass,
  size = 18,
  className,
}: WowClassIconProps) {
  const iconUrl = wowClasses[wowClass]

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

interface WowClassIconProps {
  wowClass: WowClassKey
  size?: number
  className?: string
}
