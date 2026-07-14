import { useRef, type KeyboardEvent } from "react";
import { useTheme } from "../hooks";
import { cn } from "../utils/cn";

const THEMES = [
  { key: "daytime" as const, label: "Daytime" },
  { key: "midnight" as const, label: "Midnight" },
] as const;

const ACTIVE_THEME_CLASS = "bg-accent-secondary text-background-default";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const activeIndex = THEMES.findIndex((entry) => entry.key === theme);
    if (activeIndex === -1) return;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      const nextIndex = (activeIndex + 1) % THEMES.length;
      setTheme(THEMES[nextIndex].key);
      buttonRefs.current[nextIndex]?.focus();
      return;
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      const nextIndex = (activeIndex - 1 + THEMES.length) % THEMES.length;
      setTheme(THEMES[nextIndex].key);
      buttonRefs.current[nextIndex]?.focus();
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      onKeyDown={handleKeyDown}
      className="inline-flex items-start rounded-pill border border-border-subtle bg-surface-secondary/95 p-xs shadow-[0_8px_24px_rgba(0,0,0,0.45)] backdrop-blur-md outline-none transition-colors hover:border-accent-primary focus-within:border-accent-primary"
    >
      {THEMES.map((entry, index) => {
        const isActive = theme === entry.key;

        return (
          <button
            key={entry.key}
            ref={(element) => {
              buttonRefs.current[index] = element;
            }}
            type="button"
            role="radio"
            aria-checked={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => setTheme(entry.key)}
            className={cn(
              "min-h-9 rounded-pill px-lg py-0 text-xs font-bold leading-4 transition-all duration-200 outline-none",
              isActive ? ACTIVE_THEME_CLASS : "text-text-primary",
            )}
          >
            {entry.label}
          </button>
        );
      })}
    </div>
  );
}
