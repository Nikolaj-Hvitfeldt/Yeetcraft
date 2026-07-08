import type { DungeonStats } from "../../api/types";
import { DungeonTableRow } from "./DungeonTableRow";
import { TableHeader } from "../ui/TableHeader";

type DungeonBreakdownMode = "browse" | "edit";

const DUNGEON_TABLE_GRID =
  "minmax(0, 3.5fr) minmax(5.5rem, 1fr) minmax(5.5rem, 1fr) minmax(5.5rem, 1fr)";

const TABLE_COLUMNS = [
  { id: "dungeon", label: "Dungeon", className: "text-text-secondary" },
  {
    id: "total",
    label: "Total",
    className: "justify-self-center text-center text-stat-yeets",
    width: "5.5rem",
  },
  {
    id: "deaths",
    label: "Deaths",
    className: "justify-self-center text-center text-stat-total",
    width: "5.5rem",
  },
  {
    id: "yeets",
    label: "Yeets",
    className: "justify-self-center text-center text-stat-deaths",
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
            className="rounded-[20px] border border-border-subtle bg-overlay-dark px-[14px] py-[7px] text-[13px] font-semibold text-accent-primary transition-colors hover:border-accent-primary focus:border-accent-primary disabled:opacity-40"
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
                className="inline-flex items-center gap-[6px] rounded-[20px] bg-accent-primary px-lg py-[7px] text-[13px] font-semibold text-background-default disabled:opacity-40"
              >
                <span aria-hidden="true">✓</span>
                Done
              </button>

              <button
                type="button"
                disabled={isSaving}
                onClick={onCancel}
                className="inline-flex items-center rounded-[20px] border border-red-400/40 bg-red-950/30 px-xl py-sm text-xs font-bold text-red-300 disabled:opacity-40"
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
            {dungeons.map((dungeon, index) => (
              <DungeonTableRow
                key={dungeon.dungeon.id}
                dungeon={dungeon}
                index={index}
                mode={mode}
                gridTemplateColumns={DUNGEON_TABLE_GRID}
                onAdjust={onAdjust}
                disabled={isSaving}
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
}
