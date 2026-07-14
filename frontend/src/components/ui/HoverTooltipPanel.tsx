import { cn } from '../../utils/cn'

const HOVER_TOOLTIP_BASE_CLASS =
  'pointer-events-none absolute z-50 rounded-md border border-border-subtle bg-surface-base px-md py-sm text-left text-xs font-normal leading-4 text-text-primary shadow-[0px_12px_20px_rgba(0,0,0,0.35)] transition-opacity'

const GROUP_VISIBILITY_CLASS = {
  crown: {
    hover: 'opacity-0 group-hover/crown:opacity-100',
    hoverFocus:
      'opacity-0 group-hover/crown:opacity-100 group-focus-within/crown:opacity-100',
  },
  info: {
    hoverFocus:
      'opacity-0 group-hover/info:opacity-100 group-focus-within/info:opacity-100',
  },
  banner: {
    hoverFocus:
      'opacity-0 group-hover/banner:opacity-100 group-focus-within/banner:opacity-100',
  },
} as const

const PLACEMENT_CLASS = {
  above: 'bottom-full left-1/2 mb-2 -translate-x-1/2',
  below: 'top-full left-1/2 mt-2 -translate-x-1/2',
  end: 'bottom-[calc(100%+8px)] right-0',
} as const

const WIDTH_CLASS = {
  default: 'w-[min(240px,calc(100vw-2rem))]',
  wide: 'w-[min(280px,calc(100vw-2rem))]',
} as const

export function HoverTooltipPanel({
  id,
  groupName,
  placement = 'above',
  width = 'default',
  title,
  description,
  detail,
  content,
  showOnFocus = true,
  className,
}: HoverTooltipPanelProps) {
  const groupVisibility =
    groupName === 'crown' && !showOnFocus
      ? GROUP_VISIBILITY_CLASS.crown.hover
      : GROUP_VISIBILITY_CLASS[groupName].hoverFocus

  return (
    <div
      id={id}
      role="tooltip"
      className={cn(
        HOVER_TOOLTIP_BASE_CLASS,
        groupVisibility,
        PLACEMENT_CLASS[placement],
        WIDTH_CLASS[width],
        className,
      )}
    >
      {content ? (
        <p className="whitespace-pre-line">{content}</p>
      ) : (
        <>
          {title ? (
            <p className="font-heading text-sm font-bold leading-5 text-text-primary">{title}</p>
          ) : null}
          {description ? (
            <p className={cn('whitespace-pre-line text-text-primary', title && 'mt-1')}>
              {description}
            </p>
          ) : null}
          {detail ? <p className="mt-2 text-text-secondary">{detail}</p> : null}
        </>
      )}
    </div>
  )
}

export type HoverTooltipGroupName = keyof typeof GROUP_VISIBILITY_CLASS
export type HoverTooltipPlacement = keyof typeof PLACEMENT_CLASS

interface HoverTooltipPanelProps {
  id: string
  groupName: HoverTooltipGroupName
  placement?: HoverTooltipPlacement
  width?: keyof typeof WIDTH_CLASS
  title?: string
  description?: string
  detail?: string
  content?: string
  showOnFocus?: boolean
  className?: string
}
