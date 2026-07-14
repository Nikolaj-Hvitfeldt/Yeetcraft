import { useId } from 'react'
import { WowIcon } from '../WowIcon'
import { HoverTooltipPanel } from "./HoverTooltipPanel";

const INFO_ICON_SIZE = 20;

export function InfoTooltip({
  content,
  label = "More information",
}: InfoTooltipProps) {
  const tooltipId = useId();

  return (
    <span className="group/info relative inline-flex shrink-0">
      <button
        type="button"
        className="inline-flex items-center justify-center opacity-80 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-primary"
        style={{ width: INFO_ICON_SIZE, height: INFO_ICON_SIZE }}
        aria-label={label}
        aria-describedby={tooltipId}
      >
        <WowIcon icon="info" size={INFO_ICON_SIZE} className="size-[18px]" />
      </button>

      <HoverTooltipPanel
        id={tooltipId}
        groupName="info"
        placement="end"
        content={content}
      />
    </span>
  );
}

interface InfoTooltipProps {
  content: string;
  label?: string;
}
