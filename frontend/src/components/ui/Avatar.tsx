function getInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?'
}

const SIZE_CLASS_BY_VARIANT: Record<AvatarSize, string> = {
  sm: 'size-12 rounded-2xl text-lg leading-6',
  lg: 'size-24 rounded-2xl text-4xl leading-[42px]',
}

export function Avatar({ name, imageUrl, size = 'sm', className }: AvatarProps) {
  const sizeClassName = SIZE_CLASS_BY_VARIANT[size]

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt=""
        className={`shrink-0 object-cover ${sizeClassName} ${className ?? ''}`}
      />
    )
  }

  return (
    <div
      aria-hidden={name ? undefined : true}
      className={`flex shrink-0 items-center justify-center bg-gradient-to-br from-accent-purple to-brand-gold font-bold text-avatar-bg ${sizeClassName} ${className ?? ''}`}
    >
      {getInitial(name ?? '')}
    </div>
  )
}

export type AvatarSize = 'sm' | 'lg'

interface AvatarProps {
  name?: string
  imageUrl?: string | null
  size?: AvatarSize
  className?: string
}
