export const DUNGEON_BADGE_STYLES = [
  'border-accent-primary bg-[#2e1609] text-[#ff7833]',
  'border-accent-primary bg-[#00241e] text-[#00c7a8]',
  'border-accent-primary bg-[#2e2609] text-[#ffd130]',
  'border-accent-primary bg-[#0e242e] text-[#4dc7ff]',
  'border-accent-primary bg-[#162416] text-[#7ac77d]',
  'border-accent-primary bg-[#1e132e] text-[#a86bff]',
  'border-accent-primary bg-[#2e0f0f] text-[#ff5454]',
  'border-accent-primary bg-[#111827] text-text-secondary',
] as const

export function getDungeonInitials(name: string, shortName: string | null): string {
  if (shortName) return shortName
  return name
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 4)
    .toUpperCase()
}

export function getDungeonBadgeClassName(index: number): string {
  return DUNGEON_BADGE_STYLES[index % DUNGEON_BADGE_STYLES.length]
}
