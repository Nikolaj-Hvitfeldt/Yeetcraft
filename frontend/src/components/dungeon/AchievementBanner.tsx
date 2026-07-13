import { useCallback, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { WowIconKey } from "../../assets/wow-icons";
import { wowIcons } from "../../assets/wow-icons";
import { cn } from "../../utils/cn";
import { Avatar } from "../ui/Avatar";
import { WowIcon } from "../WowIcon";

// achievementFrameSimple.webp is 256×64px (4:1) — square wells on left and right.
const FRAME_ASPECT_PERCENT = 25;
const BANNER_SCALE = 0.88;
const FRAME_ICON_FR = 64;
const FRAME_CENTER_FR = 128;
const FRAME_AVATAR_FR = 64;
const ICON_INSET = "23% 20% 22% 18%";
const TEXT_INSET_Y = "16%";
const TOOLTIP_OFFSET_X = 14;
const TOOLTIP_OFFSET_Y = 16;
const TOOLTIP_MAX_WIDTH = 260;
const VIEWPORT_PADDING = 16;

function getTooltipPosition(clientX: number, clientY: number) {
  const maxLeft = window.innerWidth - TOOLTIP_MAX_WIDTH - VIEWPORT_PADDING;
  const left = Math.min(
    Math.max(VIEWPORT_PADDING, clientX + TOOLTIP_OFFSET_X),
    maxLeft,
  );
  const top = Math.max(
    VIEWPORT_PADDING,
    clientY + TOOLTIP_OFFSET_Y,
  );

  return { left, top };
}

export function AchievementBanner({
  icon,
  title,
  holder,
  description,
  className,
}: AchievementBannerProps) {
  const titleId = useId();
  const holderId = useId();
  const tooltipId = useId();
  const articleRef = useRef<HTMLElement>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{
    left: number;
    top: number;
  } | null>(null);

  const showTooltipAt = useCallback((clientX: number, clientY: number) => {
    setTooltipPosition(getTooltipPosition(clientX, clientY));
  }, []);

  const hideTooltip = useCallback(() => {
    setTooltipPosition(null);
  }, []);

  const handleMouseEnter = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      showTooltipAt(event.clientX, event.clientY);
    },
    [showTooltipAt],
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      showTooltipAt(event.clientX, event.clientY);
    },
    [showTooltipAt],
  );

  const handleFocus = useCallback(() => {
    const rect = articleRef.current?.getBoundingClientRect();
    if (!rect) return;

    showTooltipAt(rect.left + rect.width / 2, rect.top + rect.height / 2);
  }, [showTooltipAt]);

  const tooltip =
    tooltipPosition && typeof document !== "undefined"
      ? createPortal(
          <span
            id={tooltipId}
            role="tooltip"
            style={{
              left: tooltipPosition.left,
              top: tooltipPosition.top,
            }}
            className="pointer-events-none fixed z-[9999] w-[min(260px,calc(100vw-2rem))] whitespace-pre-line rounded-md border border-border-subtle bg-surface-base px-md py-sm text-left text-xs font-normal leading-4 text-text-primary shadow-[0px_12px_20px_rgba(0,0,0,0.35)]"
          >
            {description}
          </span>,
          document.body,
        )
      : null;

  return (
    <div
      className={cn("relative w-full max-w-full", className)}
      style={{ paddingBottom: `${FRAME_ASPECT_PERCENT * BANNER_SCALE}%` }}
    >
      <article
        ref={articleRef}
        tabIndex={0}
        aria-labelledby={holder ? `${titleId} ${holderId}` : titleId}
        aria-describedby={tooltipPosition ? tooltipId : undefined}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={hideTooltip}
        onFocus={handleFocus}
        onBlur={hideTooltip}
        className="absolute left-0 top-0 w-full origin-top-left cursor-help outline-none focus-visible:ring-1 focus-visible:ring-accent-primary"
        style={{
          width: `${100 / BANNER_SCALE}%`,
          transform: `scale(${BANNER_SCALE})`,
        }}
      >
        <div className="relative overflow-hidden drop-shadow-md">
          <img
            src={wowIcons.achievementFrameSimple}
            alt=""
            aria-hidden
            className="block h-auto w-full max-w-full"
          />

          <div
            className="absolute inset-0 grid"
            style={{
              gridTemplateColumns: `${FRAME_ICON_FR}fr ${FRAME_CENTER_FR}fr ${FRAME_AVATAR_FR}fr`,
            }}
          >
            <div className="relative min-h-0">
              <div className="absolute" style={{ inset: ICON_INSET }}>
                <WowIcon
                  icon={icon}
                  fluid
                  objectFit="cover"
                  className="h-full w-full rounded-[2px] object-cover"
                />
              </div>
            </div>

            <div
              className="flex min-h-0 items-center justify-center px-[4%]"
              style={{ paddingTop: TEXT_INSET_Y, paddingBottom: TEXT_INSET_Y }}
            >
              <h3
                id={titleId}
                className="achievement-banner-title w-full text-center text-base font-bold leading-tight tracking-normal text-white line-clamp-1 sm:text-lg"
              >
                {title}
              </h3>
            </div>

            <div className="relative flex min-h-0 items-center justify-center">
              {holder ? (
                <>
                  <Avatar
                    name={holder.displayName}
                    imageUrl={holder.avatarUrl}
                    className="!size-7 !rounded-full text-[10px] leading-none ring-1 ring-black/50 sm:!size-8"
                  />
                  <span id={holderId} className="sr-only">
                    {holder.displayName}
                  </span>
                </>
              ) : (
                <WowIcon
                  icon="achievementShield"
                  fluid
                  objectFit="contain"
                  className="size-7 object-contain drop-shadow-sm sm:size-8"
                />
              )}
            </div>
          </div>
        </div>
      </article>

      {tooltip}
    </div>
  );
}

interface AchievementHolder {
  displayName: string;
  avatarUrl: string | null;
}

interface AchievementBannerProps {
  icon: WowIconKey;
  title: string;
  holder?: AchievementHolder;
  description: string;
  className?: string;
}
