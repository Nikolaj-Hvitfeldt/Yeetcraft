import { Link } from "react-router-dom";
import type { WowIconKey } from "../../assets/wow-icons";
import { wowIcons } from "../../assets/wow-icons";
import type { PlayerStats } from "../../hooks";
const RANK_ICON_BY_PLACE: Record<number, WowIconKey> = {
  1: "gold",
  2: "silver",
  3: "bronze",
  4: "platinum",
};

function getInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}

export function LeaderboardRow({ player, rank }: LeaderboardRowProps) {
  const rankIcon = RANK_ICON_BY_PLACE[rank];

  return (
    <Link
      to={`/player/${player.playerId}`}
      className="group grid min-h-[85px] grid-cols-[52px_1fr] items-center gap-lg rounded-md border border-border-subtle bg-surface-base px-md py-md transition-colors hover:border-accent-primary sm:grid-cols-[56px_minmax(220px,1fr)_minmax(230px,auto)]"
    >
      <div
        className={`flex shrink-0 flex-col items-center ${rankIcon ? "gap-0.5" : "size-11 justify-center"}`}
      >
        {rankIcon ? (
          <img
            src={wowIcons[rankIcon]}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="size-11 object-contain"
          />
        ) : null}
        <span
          className={`font-number font-bold leading-none text-text-secondary ${rankIcon ? "text-xs" : "text-sm"}`}
        >
          {rank}
        </span>
      </div>
      <div className="flex min-w-0 items-center gap-lg">
        {player.avatarUrl ? (
          <img
            src={player.avatarUrl}
            alt=""
            className="size-12 shrink-0 rounded-md object-cover"
          />
        ) : (
          <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-accent-purple to-brand-gold font-bold text-avatar-bg">
            {getInitial(player.playerName)}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-base font-bold leading-[22px] text-text-primary transition-colors group-hover:text-accent-primary">
            {player.playerName}
          </p>
          <p className="text-sm font-semibold leading-[18px] text-text-secondary">
            Tracked player
          </p>
        </div>
      </div>

      <div className="col-span-2 flex justify-end gap-lg sm:col-span-1">
        <Metric
          label="Total"
          value={player.total}
          className="text-stat-total"
        />
        <Metric
          label="Deaths"
          value={player.deaths}
          className="text-stat-deaths"
        />
        <Metric
          label="Yeets"
          value={player.yeets}
          className="text-stat-yeets"
        />
      </div>
    </Link>
  );
}

function Metric({ label, value, className }: MetricProps) {
  return (
    <div className="min-w-14 rounded-md px-sm py-sm text-center sm:min-w-16 sm:px-md">
      <p className={`font-number text-xl font-bold leading-6 ${className}`}>
        {value}
      </p>
      <p className="text-[10px] leading-[14px] text-text-secondary">{label}</p>
    </div>
  );
}

interface LeaderboardRowProps {
  player: PlayerStats;
  rank: number;
}

interface MetricProps {
  label: string;
  value: number;
  className: string;
}
