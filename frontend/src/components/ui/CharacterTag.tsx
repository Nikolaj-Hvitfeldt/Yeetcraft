import type { WowClassKey } from '../../assets/wow-classes'
import { isWowClassKey } from '../../assets/wow-classes'
import { WowClassIcon } from '../WowClassIcon'

export function CharacterTag({ name, wowClass, classLabel, className }: CharacterTagProps) {
  return (
    <span
      className={`inline-flex h-[26px] items-center gap-sm rounded-pill border border-border-subtle bg-surface-base px-md py-xs ${className ?? ''}`}
    >
      {wowClass && isWowClassKey(wowClass) ? (
        <WowClassIcon wowClass={wowClass} size={18} />
      ) : (
        <span className="size-1.5 shrink-0 rounded-pill bg-accent-primary" aria-hidden="true" />
      )}
      <span className="text-xs leading-4 text-text-link">{name}</span>
      {classLabel ? (
        <span className="text-xs leading-4 text-text-secondary">{classLabel}</span>
      ) : null}
    </span>
  )
}

interface CharacterTagProps {
  name: string
  wowClass?: WowClassKey
  className?: string
  classLabel?: string
}
