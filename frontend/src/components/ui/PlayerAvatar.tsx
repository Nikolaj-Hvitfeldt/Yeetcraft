import { resolvePlayerAvatarSrc } from '../../utils/player-avatar'
import { Avatar, type AvatarProps, type AvatarSize } from './Avatar'

export interface PlayerAvatarProps {
  playerId?: string | null
  displayName: string
  avatarUrl?: string | null
  size?: AvatarSize
  className?: string
  loading?: AvatarProps['loading']
  decorative?: boolean
}

export function PlayerAvatar({
  playerId,
  displayName,
  avatarUrl,
  size = 'sm',
  className,
  loading,
  decorative = false,
}: PlayerAvatarProps) {
  const imageUrl = resolvePlayerAvatarSrc({
    playerId,
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
