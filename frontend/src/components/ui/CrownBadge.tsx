import { cn } from "../../utils/cn";
import { CrownIcon } from "./CrownIcon";

const CROWN_BY_KIND = {
  yeets: {
    label: "Yeetmeister",
    iconClassName:
      "text-stat-yeets drop-shadow-[0_0_6px_rgba(254,230,133,0.35)]",
    badgeClassName: "border-stat-yeets/40 text-stat-yeets",
  },
  deaths: {
    label: "King of Naps",
    iconClassName:
      "text-stat-deaths drop-shadow-[0_0_6px_rgba(218,178,255,0.35)]",
    badgeClassName: "border-stat-deaths/40 text-stat-deaths",
  },
} as const;

export function CrownBadge({
  kind,
  showLabel = false,
  className,
}: CrownBadgeProps) {
  const crown = CROWN_BY_KIND[kind];

  if (showLabel) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-xs rounded-pill border bg-surface-base px-md py-xs text-xs font-bold uppercase tracking-wide",
          crown.badgeClassName,
          className,
        )}
        title={crown.label}
      >
        <CrownIcon
          className={cn("size-[18px] shrink-0", crown.iconClassName)}
        />
        {crown.label}
      </span>
    );
  }

  return (
    <span className={className} title={crown.label}>
      <CrownIcon className={cn("size-[18px] shrink-0", crown.iconClassName)} />
      <span className="sr-only">{crown.label}</span>
    </span>
  );
}

export type CrownKind = keyof typeof CROWN_BY_KIND;

interface CrownBadgeProps {
  kind: CrownKind;
  showLabel?: boolean;
  className?: string;
}
