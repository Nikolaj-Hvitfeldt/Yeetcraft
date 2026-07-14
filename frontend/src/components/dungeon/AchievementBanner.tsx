import { useId } from "react";
import {
  achievementLogos,
  isAchievementLogoKey,
} from "../../assets/achievement-logos";
import type {
  AchievementIcon,
  DungeonAchievementHolderView,
} from "../../utils/dungeon-achievements";
import { wowIcons } from "../../assets/wow-icons";
import { cn } from "../../utils/cn";
import { Avatar } from "../ui/Avatar";
import { HoverTooltipPanel } from "../ui/HoverTooltipPanel";
import { WowIcon } from "../WowIcon";

// achievementFrameSimple.webp is 256×64px (4:1) — square wells on left and right.
const FRAME_ASPECT_PERCENT = 25;
const BANNER_SCALE = 0.88;
const FRAME_ICON_FR = 64;
const FRAME_CENTER_FR = 128;
const FRAME_AVATAR_FR = 64;
const ICON_INSET = "23% 20% 22% 18%";
const CENTER_TEXT_INSET_X = "1%";

const ICON_EDGE_BLEND =
  "linear-gradient(to left, rgba(128,128,128,0.16) 0%, transparent 4%)," +
  "linear-gradient(to bottom, rgba(128,128,128,0.16) 0%, transparent 4%)," +
  "linear-gradient(to top, rgba(128,128,128,0.16) 0%, transparent 4%)";

const ICON_RIGHT_SOFT_MASK =
  "linear-gradient(to right, #000 0%, #000 76%, rgba(0,0,0,0.6) 88%, transparent 100%)";

const ICON_RIGHT_PARCHMENT_BLEND =
  "linear-gradient(to right, transparent 68%, rgba(196, 156, 98, 0.12) 82%, rgba(126, 78, 44, 0.28) 100%)";

function AchievementIconWell({ icon }: { icon: AchievementIcon }) {
  const isCustomLogo = isAchievementLogoKey(icon);

  return (
    <div className="absolute overflow-hidden" style={{ inset: ICON_INSET }}>
      <div
        className="relative size-full overflow-hidden"
        style={
          isCustomLogo
            ? {
                WebkitMaskImage: ICON_RIGHT_SOFT_MASK,
                maskImage: ICON_RIGHT_SOFT_MASK,
              }
            : undefined
        }
      >
        {isCustomLogo ? (
          <img
            src={achievementLogos[icon]}
            alt=""
            aria-hidden
            className="size-full scale-[1.14] object-cover"
          />
        ) : (
          <WowIcon
            icon={icon}
            fluid
            objectFit="cover"
            className="size-full object-cover"
          />
        )}
        {isCustomLogo ? (
          <>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ background: ICON_EDGE_BLEND }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ background: ICON_RIGHT_PARCHMENT_BLEND }}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}

export function AchievementBanner({
  icon,
  title,
  holder,
  description,
  tooltip,
  className,
}: AchievementBannerProps) {
  const titleId = useId();
  const descriptionId = useId();
  const tooltipId = useId();
  const holderId = useId();

  return (
    <div
      className={cn("group/banner relative w-full max-w-full", className)}
      style={{ paddingBottom: `${FRAME_ASPECT_PERCENT * BANNER_SCALE}%` }}
    >
      <article
        tabIndex={0}
        aria-labelledby={holder ? `${titleId} ${holderId}` : titleId}
        aria-describedby={`${descriptionId} ${tooltipId}`}
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
            className="absolute inset-0 grid min-h-0 items-stretch"
            style={{
              gridTemplateColumns: `${FRAME_ICON_FR}fr ${FRAME_CENTER_FR}fr ${FRAME_AVATAR_FR}fr`,
            }}
          >
            <div className="relative min-h-0">
              <AchievementIconWell icon={icon} />
            </div>

            <div
              className="relative h-full min-h-0"
              style={{ padding: `0 ${CENTER_TEXT_INSET_X}` }}
            >
              <h3
                id={titleId}
                className="achievement-banner-title absolute inset-x-[1%] top-[36%] -translate-y-1/2 text-center text-[15px] font-bold leading-tight tracking-normal line-clamp-1"
              >
                {title}
              </h3>
              <p
                id={descriptionId}
                className="achievement-banner-description absolute inset-x-[1%] top-[64%] -translate-y-1/2 text-center text-xs font-medium leading-none line-clamp-1"
              >
                {description}
              </p>
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

      <HoverTooltipPanel
        id={tooltipId}
        groupName="banner"
        width="wide"
        title={title}
        description={description}
        detail={tooltip}
      />
    </div>
  );
}

interface AchievementBannerProps {
  icon: AchievementIcon;
  title: string;
  holder?: DungeonAchievementHolderView;
  description: string;
  tooltip: string;
  className?: string;
}
