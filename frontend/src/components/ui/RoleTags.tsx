import type { PlayerRole } from '../../data/player-characters'
import { Tag } from './Tag'

export function RoleTags({ roles, className }: RoleTagsProps) {
  if (roles.length === 0) return null

  return (
    <div className={`flex flex-wrap gap-xs ${className ?? ''}`}>
      {roles.map((role) => (
        <Tag key={role}>{role}</Tag>
      ))}
    </div>
  )
}

interface RoleTagsProps {
  roles: PlayerRole[]
  className?: string
}
