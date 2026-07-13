import { WowIcon } from "../WowIcon";

const INFO_ICON_SIZE = 20;

export function InfoTooltip({
  content,
  label = "More information",
}: InfoTooltipProps) {
  return (
    <span className="group/info relative inline-flex shrink-0">
      <button
        type="button"
        className="inline-flex items-center justify-center opacity-80 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-primary"
        style={{ width: INFO_ICON_SIZE, height: INFO_ICON_SIZE }}
        aria-label={label}
      >
        <WowIcon icon="info" size={INFO_ICON_SIZE} className="size-[18px]" />
      </button>

      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-[calc(100%+8px)] right-0 z-50 w-[min(240px,calc(100vw-2rem))] rounded-md border border-border-subtle bg-surface-base px-md py-sm text-left text-xs font-normal leading-4 text-text-primary opacity-0 shadow-[0px_12px_20px_rgba(0,0,0,0.35)] transition-opacity group-hover/info:opacity-100 group-focus-within/info:opacity-100"
      >
        {content}
      </span>
    </span>
  );
}

interface InfoTooltipProps {
  content: string;
  label?: string;
}
