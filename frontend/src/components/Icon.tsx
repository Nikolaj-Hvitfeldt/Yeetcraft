import { icons, type IconKey } from '../assets/icons'
import { cn } from '../utils/cn'

export function Icon({
  icon,
  size = 24,
  alt = '',
  className,
  objectFit = 'contain',
  fluid = false,
}: IconProps) {
  return (
    <img
      src={icons[icon]}
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

interface IconProps {
  icon: IconKey
  size?: number
  alt?: string
  className?: string
  objectFit?: 'contain' | 'cover'
  fluid?: boolean
}
