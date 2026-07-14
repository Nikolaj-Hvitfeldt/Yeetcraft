import type { DungeonStats, SeasonSummary } from "../../api/types";
import { DungeonTableRow } from "./DungeonTableRow";
import { TableHeader } from "../ui/TableHeader";
import { STAT_COLOR_BY_KIND } from "../../utils/stat-colors";

const FOCUS_ACCENT_BORDER =
  "outline-none transition-colors focus:border-accent-primary focus-visible:border-accent-primary";

const DUNGEON_TABLE_GRID =
  "minmax(0, 3.5fr) minmax(5.5rem, 1fr) minmax(5.5rem, 1fr) minmax(5.5rem, 1fr)";

const TABLE_COLUMNS = [
  { id: "dungeon", label: "Dungeon", className: "text-text-secondary" },
  {
    id: "total",
    label: "Total",
    className: `justify-self-center text-center ${STAT_COLOR_BY_KIND.total}`,
    width: "5.5rem",
  },
  {
    id: "deaths",
    label: "Deaths",
    className: `justify-self-center text-center ${STAT_COLOR_BY_KIND.deaths}`,
    width: "5.5rem",
  },
  {
    id: "yeets",
    label: "Yeets",
    className: `justify-self-center text-center ${STAT_COLOR_BY_KIND.yeets}`,
    width: "5.5rem",
  },
];

export function DungeonBreakdownSection({
  mode,
  dungeons,
  onEnterEdit,
  onCancel,
  onDone,
  isSaving,
  onAdjust,
  season,
  dungeonBackTo,
  profileBackTo,
}: DungeonBreakdownSectionProps) {
  return (
    <section className="overflow-hidden rounded-3xl border border-accent-secondary bg-surface-section p-2xl">
      <div
        className={
          mode === "edit"
            ? "grid grid-cols-[1fr_auto_1fr] items-center gap-md"
            : "flex items-center justify-between"
        }
      >
        <h2 className="font-heading text-2xl font-bold leading-[30px] text-text-accent">
          Dungeon breakdown
        </h2>

        {mode === "browse" ? (
          <button
            type="button"
            disabled={isSaving}
            onClick={onEnterEdit}
            className={`rounded-[20px] border border-border-subtle bg-overlay-dark px-[14px] py-[7px] text-[13px] font-semibold text-accent-primary hover:border-accent-primary disabled:opacity-40 ${FOCUS_ACCENT_BORDER}`}
          >
            Edit Stats
          </button>
        ) : (
          <>
            <span className="inline-flex items-center justify-self-center rounded-[12px] border border-border-subtle bg-overlay-dark px-[10px] py-xs text-[11px] font-semibold text-accent-primary">
              EDITING
            </span>

            <div className="flex items-center justify-end gap-md">
              <button
                type="button"
                disabled={isSaving}
                onClick={onDone}
                className="inline-flex items-center gap-[6px] rounded-[20px] border border-transparent bg-accent-primary px-lg py-[7px] text-[13px] font-semibold text-background-default outline-none transition-colors focus-visible:border-background-default disabled:opacity-40"
              >
                <span aria-hidden="true">✓</span>
                Done
              </button>

              <button
                type="button"
                disabled={isSaving}
                onClick={onCancel}
                className={`inline-flex items-center rounded-[20px] border border-red-400/40 bg-red-950/30 px-xl py-sm text-xs font-bold text-red-300 hover:border-accent-primary disabled:opacity-40 ${FOCUS_ACCENT_BORDER}`}
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>

      <div className="pt-lg">
        <div
          className={`overflow-hidden rounded-2xl border border-accent-secondary ${
            mode === "edit" ? "border-t-2 border-t-accent-primary/40" : ""
          }`}
        >
          <TableHeader
            columns={TABLE_COLUMNS}
            gridTemplateColumns={DUNGEON_TABLE_GRID}
            className="border-b border-accent-secondary"
          />

          <div className="divide-y divide-accent-secondary">
          {dungeons.map((dungeon) => (
            <DungeonTableRow
              key={dungeon.dungeon.id}
              dungeon={dungeon}
                mode={mode}
                gridTemplateColumns={DUNGEON_TABLE_GRID}
                onAdjust={onAdjust}
                disabled={isSaving}
                season={season}
                backTo={dungeonBackTo}
                profileBackTo={profileBackTo}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

interface DungeonBreakdownSectionProps {
  mode: DungeonBreakdownMode;
  dungeons: DungeonStats[];
  onEnterEdit: () => void;
  onCancel: () => void;
  onDone: () => void;
  isSaving: boolean;
  onAdjust: (
    dungeonId: string,
    field: "deaths" | "yeets",
    delta: 1 | -1,
  ) => void;
  season?: SeasonSummary;
  dungeonBackTo?: string;
  profileBackTo?: string;
}
