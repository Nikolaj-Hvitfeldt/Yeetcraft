import { useId } from "react";
import type { WowIconKey } from "../../assets/wow-icons";
import { wowIcons } from "../../assets/wow-icons";
import { cn } from "../../utils/cn";
import { WowIcon } from "../WowIcon";

// Inset within the left icon column — clears the frame's metallic border.
const ICON_INSET = "25% 25% 21% 6%";

const FRAME_ICON_FR = 78;
const FRAME_TEXT_FR = 219;

export function AchievementBanner({
  icon,
  title,
  description,
  className,
}: AchievementBannerProps) {
  const titleId = useId();
  const tooltipId = useId();

  return (
    <article
      tabIndex={0}
      aria-labelledby={titleId}
      aria-describedby={tooltipId}
      className={cn(
        "group/banner relative w-full cursor-help outline-none drop-shadow-md focus-visible:ring-1 focus-visible:ring-accent-primary",
        className,
      )}
    >
      <img
        src={wowIcons.achievementFrame}
        alt=""
        aria-hidden
        className="block w-full h-auto"
      />

      <div
        className="absolute inset-0 grid items-center"
        style={{ gridTemplateColumns: `${FRAME_ICON_FR}fr ${FRAME_TEXT_FR}fr` }}
      >
        <div className="relative h-full">
          <div className="absolute" style={{ inset: ICON_INSET }}>
            <WowIcon
              icon={icon}
              fluid
              objectFit="cover"
              className="h-full w-full rounded-[2px] object-cover"
            />
          </div>
        </div>

        <div className="flex h-full min-w-0 items-center justify-center px-[4%]">
          <h3
            id={titleId}
            className="text-center font-heading text-sm font-bold leading-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)] line-clamp-2 sm:text-base"
          >
            {title}
          </h3>
        </div>
      </div>

      <span
        id={tooltipId}
        role="tooltip"
        className="pointer-events-none absolute bottom-[calc(100%+8px)] left-0 z-50 w-[min(260px,calc(100vw-2rem))] whitespace-pre-line rounded-md border border-border-subtle bg-surface-base px-md py-sm text-left text-xs font-normal leading-4 text-text-primary opacity-0 shadow-[0px_12px_20px_rgba(0,0,0,0.35)] transition-opacity group-hover/banner:opacity-100 group-focus-within/banner:opacity-100"
      >
        {description}
      </span>
    </article>
  );
}

interface AchievementBannerProps {
  icon: WowIconKey;
  title: string;
  description: string;
  className?: string;
}
