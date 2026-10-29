import { LABELS, ROWS, WIDTHS } from "../lib/keyboard";

type Props = {
  pressed?: Set<string>;
  next?: string;
  heat?: Record<string, number>;
};

export default function Keyboard({ pressed, next, heat }: Props) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-1 rounded-xl bg-panel p-1.5 select-none sm:gap-2 sm:rounded-2xl sm:p-3" aria-hidden="true">
      {ROWS.map((row, i) => (
        <div key={i} className={`flex gap-1 sm:gap-2 ${row.length === 1 ? "justify-center" : ""}`}>
          {row.map((key) => {
            const down = pressed?.has(key) || (key === "rshift" && pressed?.has("shift"));
            const hot = heat?.[key] ?? 0;
            return (
              <div
                key={key}
                style={{
                  flex: `${WIDTHS[key] ?? 1} 1 0`,
                  maxWidth: key === "space" ? "42%" : undefined,
                  backgroundColor: hot ? `color-mix(in srgb, var(--error) ${Math.round(hot * 75)}%, var(--key))` : undefined,
                }}
                className={`keycap flex h-8 min-w-0 items-start overflow-hidden rounded-md px-1 pt-0.5 font-mono text-[10px] sm:h-10 sm:rounded-lg sm:px-2 sm:pt-1 sm:text-xs ${down ? "down" : ""} ${
                  key === next ? "text-accent ring-2 ring-accent" : "text-sub"
                } ${hot > 0.5 ? "text-white" : ""}`}
              >
                {LABELS[key] ?? key}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
