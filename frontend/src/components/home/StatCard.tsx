import { WowIcon } from "../WowIcon";
import type { WowIconKey } from "../../assets/wow-icons";

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

  return (
    <article className="flex h-[100px] w-28 flex-col items-center gap-[6px] rounded-md border border-border-subtle bg-surface-base px-md pb-[10px] pt-md">
      <div
        className={`flex size-[26px] items-center justify-center rounded-sm ${colorClassName}`}
      >
        <WowIcon
          icon={ICON_BY_KIND[kind]}
          size={18}
          alt=""
          className="drop-shadow-sm"
        />
      </div>
      <p className="font-number text-3xl font-bold leading-9 text-text-primary">
        {value}
      </p>
      <p className={`text-xs leading-4 ${colorClassName}`}>{label}</p>
    </article>
  );
}

export type StatCardKind = "total" | "deaths" | "yeets";

interface StatCardProps {
  label: string;
  value: number;
  kind: StatCardKind;
}
