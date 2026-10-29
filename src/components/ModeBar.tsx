import { Clock, Code, Crosshair, Ghost, Type, type LucideIcon } from "lucide-react";
import type { Mode, Settings } from "../types";

const MODES: { mode: Mode; label: string; icon: LucideIcon }[] = [
  { mode: "time", label: "time", icon: Clock },
  { mode: "words", label: "words", icon: Type },
  { mode: "code", label: "code", icon: Code },
  { mode: "weak", label: "weak keys", icon: Crosshair },
];

const TIMES = [15, 30, 60];
const WORD_COUNTS = [10, 25, 50];

type Props = {
  settings: Settings;
  onChange: (changes: Partial<Settings>) => void;
};

export default function ModeBar({ settings, onChange }: Props) {
  const option = (active: boolean) => `cursor-pointer rounded-lg px-2.5 py-1 transition ${active ? "text-accent" : "hover:text-text"}`;
  const amounts = settings.mode === "time" ? TIMES : settings.mode === "code" ? [] : WORD_COUNTS;
  const current = settings.mode === "time" ? settings.time : settings.words;

  return (
    <div className="mx-auto flex w-fit flex-wrap items-center justify-center gap-x-1 gap-y-1 rounded-xl bg-panel px-2 py-1.5 font-mono text-sm text-sub">
      <div className="flex flex-wrap justify-center">
        {MODES.map(({ mode, label, icon: Icon }) => (
          <button key={mode} type="button" onClick={() => onChange({ mode })} className={`flex items-center gap-1.5 ${option(settings.mode === mode)}`}>
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>
      <span className="mx-1 hidden h-5 w-1 rounded-full bg-bg sm:block" />
      <div className="flex items-center">
        {amounts.map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => onChange(settings.mode === "time" ? { time: amount } : { words: amount })}
            className={option(current === amount)}
          >
            {amount}
          </button>
        ))}
        {amounts.length > 0 && <span className="mx-1 h-5 w-1 rounded-full bg-bg" />}
        <button
          type="button"
          onClick={() => onChange({ ghost: !settings.ghost })}
          aria-pressed={settings.ghost}
          title="Race a ghost of your best run"
          className={`flex items-center gap-1.5 ${option(settings.ghost)}`}
        >
          <Ghost size={14} />
          ghost
        </button>
      </div>
    </div>
  );
}
