import { wowIcons, type WowIconKey } from '../assets/wow-icons'
import { cn } from '../utils/cn'

export function WowIcon({
  icon,
  size = 24,
  alt = '',
  className,
  objectFit = 'contain',
  fluid = false,
}: WowIconProps) {
  return (
    <img
      src={wowIcons[icon]}
      alt={alt}
      width={fluid ? undefined : size}
      height={fluid ? undefined : size}
      loading="lazy"
      aria-hidden={alt ? undefined : true}
      className={cn(
        objectFit === 'cover' ? 'object-cover' : 'object-contain',
        className,
      )}
      style={fluid ? undefined : { width: size, height: size }}
    />
  )
}

interface WowIconProps {
  icon: WowIconKey
  size?: number
  alt?: string
  className?: string
  objectFit?: 'contain' | 'cover'
  fluid?: boolean
}
