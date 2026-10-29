import { LABELS, ROWS, WIDTHS } from "../lib/keyboard";

type Props = {
  pressed?: Set<string>;
  next?: string;
  heat?: Record<string, number>;
};

export default function Keyboard({ pressed, next, heat }: Props) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-2 rounded-2xl bg-panel p-3 select-none" aria-hidden="true">
      {ROWS.map((row, i) => (
        <div key={i} className={`flex gap-2 ${row.length === 1 ? "justify-center" : ""}`}>
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
                className={`keycap flex h-10 items-start rounded-lg px-2 pt-1 font-mono text-xs ${down ? "down" : ""} ${
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
