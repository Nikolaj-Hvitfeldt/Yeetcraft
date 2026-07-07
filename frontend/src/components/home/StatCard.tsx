import type { WowIconKey } from "../../assets/wow-icons";
import { wowIcons } from "../../assets/wow-icons";

const COLOR_CLASS_BY_KIND: Record<StatCardKind, string> = {
  total: "text-stat-total",
  deaths: "text-stat-deaths",
  yeets: "text-stat-yeets",
};

const ICON_BY_KIND: Record<StatCardKind, WowIconKey> = {
  total: "total",
  deaths: "deaths",
  yeets: "yeets",
};

export function StatCard({ label, value, kind }: StatCardProps) {
  const colorClassName = COLOR_CLASS_BY_KIND[kind];
  const icon = ICON_BY_KIND[kind];

  return (
    <article className="relative flex h-[100px] w-28 flex-col items-center justify-center overflow-hidden rounded-[8px] border border-border-subtle bg-surface-base px-[10px] py-[10px]">
      <img
        src={wowIcons[icon]}
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="pointer-events-none absolute left-1/2 top-1/2 size-24 -translate-x-1/2 -translate-y-1/2 object-contain opacity-[0.80] saturate-125"
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at center, rgba(23, 33, 61, 0.12) 0%, rgba(23, 33, 61, 0.28) 48%, var(--color-surface-base) 100%)",
        }}
      />
      <p className="relative z-10 font-number text-3xl font-bold leading-9 text-text-primary drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]">
        {value}
      </p>
      <p
        className={`relative z-10 text-xs leading-4 drop-shadow-[0_1px_4px_rgba(0,0,0,0.65)] ${colorClassName}`}
      >
        {label}
      </p>
    </article>
  );
}

export type StatCardKind = "total" | "deaths" | "yeets";

interface StatCardProps {
  label: string;
  value: number;
  kind: StatCardKind;
}
