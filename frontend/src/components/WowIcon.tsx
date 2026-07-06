import { wowIcons, type WowIconKey } from '../assets/wow-icons'

export function WowIcon({ icon, size = 24, alt = '', className }: WowIconProps) {
  return (
    <img
      src={wowIcons[icon]}
      alt={alt}
      width={size}
      height={size}
      loading="lazy"
      className={className}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
      }}
    />
  )
}

interface WowIconProps {
  icon: WowIconKey
  size?: number
  alt?: string
  className?: string
}
