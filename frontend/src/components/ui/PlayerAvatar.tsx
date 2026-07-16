import { resolvePlayerAvatarSrc } from '../../utils/player-avatar'
import { Avatar, type AvatarProps, type AvatarSize } from './Avatar'

export interface PlayerAvatarProps {
  /** Preferred when the caller already has or naturally derives a registry key. */
  playerKey?: string | null
  displayName: string
  avatarUrl?: string | null
  size?: AvatarSize
  className?: string
  loading?: AvatarProps['loading']
  decorative?: boolean
}

export function PlayerAvatar({
  playerKey,
  displayName,
  avatarUrl,
  size = 'sm',
  className,
  loading,
  decorative = false,
}: PlayerAvatarProps) {
  const imageUrl = resolvePlayerAvatarSrc({
    playerKey,
    displayName,
    avatarUrl,
  })

  return (
    <Avatar
      name={displayName}
      imageUrl={imageUrl}
      size={size}
      className={className}
      loading={loading}
      decorative={decorative}
    />
  )
}
