import { useEffect, useState } from 'react'

function getInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?'
}

export type AvatarSize = 'sm' | 'lg' | 'achievement'

const SIZE_CLASS_BY_VARIANT: Record<AvatarSize, string> = {
  sm: 'size-12 rounded-2xl text-lg leading-6',
  lg: 'size-24 rounded-2xl text-4xl leading-[42px]',
  achievement:
    'size-7 rounded-full text-[10px] leading-none ring-1 ring-black/50 sm:size-8',
}

const SIZE_PX: Record<AvatarSize, number> = {
  sm: 48,
  lg: 96,
  achievement: 32,
}

export interface AvatarProps {
  name?: string
  imageUrl?: string | null
  size?: AvatarSize
  className?: string
  loading?: 'lazy' | 'eager'
  decorative?: boolean
}

export function Avatar({
  name,
  imageUrl,
  size = 'sm',
  className,
  loading,
  decorative = false,
}: AvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)

  useEffect(() => {
    setFailedSrc(null)
  }, [imageUrl])

  const sizeClassName = SIZE_CLASS_BY_VARIANT[size]
  const pixelSize = SIZE_PX[size]
  const shellClassName = `shrink-0 ${sizeClassName} ${className ?? ''}`
  const showImage = Boolean(imageUrl) && failedSrc !== imageUrl
  const altText = decorative ? '' : name ? `${name} avatar` : ''

  if (showImage && imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={altText}
        width={pixelSize}
        height={pixelSize}
        loading={loading}
        onError={() => setFailedSrc(imageUrl)}
        className={`object-cover object-center ${shellClassName}`}
      />
    )
  }

  return (
    <div
      aria-hidden={decorative || !name ? true : undefined}
      className={`flex items-center justify-center bg-gradient-to-br from-accent-purple to-brand-gold font-bold text-avatar-bg ${shellClassName}`}
    >
      {getInitial(name ?? '')}
    </div>
  )
}
