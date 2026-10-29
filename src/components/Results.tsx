import { ChevronRight, Crosshair, Ghost, RotateCcw, Trophy } from "lucide-react";
import type { Result } from "../types";
import { ghostSamples, heatmap, modeLabel, weakestKeys } from "../lib/stats";
import Chart from "./Chart";
import Keyboard from "./Keyboard";

type Props = {
  result: Result;
  best: number;
  ghost?: number[];
  onNext: () => void;
  onRepeat: () => void;
  onPractice: () => void;
};

const button = "flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition";

export default function Results({ result, best, ghost, onNext, onRepeat, onPractice }: Props) {
  const isBest = result.wpm > best && best > 0;
  const weak = weakestKeys(result.keys, 3);
  const small = [
    { label: "raw", value: result.raw },
    { label: "consistency", value: `${result.consistency}%` },
    { label: "characters", value: `${result.correct}/${result.incorrect}` },
    { label: "time", value: `${result.duration}s` },
    { label: "test", value: modeLabel(result.mode, result.amount) },
  ];

  return (
    <div className="mt-10 animate-[fade_0.4s_ease-out]">
      <div className="grid items-center gap-8 lg:grid-cols-[auto_1fr]">
        <div className="flex gap-10 lg:flex-col lg:gap-4">
          <div>
            <p className="text-sm text-sub">wpm</p>
            <p className="font-mono text-7xl leading-none font-bold text-accent">{result.wpm}</p>
            {isBest && (
              <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-accent">
                <Trophy size={15} />
                New personal best
              </p>
            )}
            {ghost && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-sub">
                <Ghost size={15} />
                {result.wpm > best ? `You beat your ghost by ${result.wpm - best}` : result.wpm === best ? "Tied with your ghost" : `Your ghost won by ${best - result.wpm}`}
              </p>
            )}
          </div>
          <div>
            <p className="text-sm text-sub">accuracy</p>
            <p className="font-mono text-5xl leading-none font-bold">{result.accuracy}%</p>
          </div>
        </div>

        <Chart
          series={[
            { label: "wpm", values: result.samples.map((sample) => sample.wpm), color: "var(--accent)" },
            { label: "raw", values: result.samples.map((sample) => sample.raw), color: "var(--sub)", dashed: true },
            ...(ghost ? [{ label: "ghost", values: ghostSamples(ghost, result.samples.length), color: "var(--text)", faint: true }] : []),
          ]}
          errors={result.samples.map((sample) => sample.errors)}
          xLabel={(i) => `${i + 1}s`}
        />
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {small.map((stat) => (
          <div key={stat.label} className="rounded-xl bg-panel px-4 py-3">
            <p className="text-xs text-sub">{stat.label}</p>
            <p className="mt-0.5 font-mono text-lg font-semibold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-sub">
          Keys you missed
          {weak.length === 0 && <span className="text-text">none, clean run</span>}
          {weak.map((key) => (
            <kbd key={key} className="keycap rounded-md px-2 py-0.5 font-mono text-text">
              {key}
            </kbd>
          ))}
        </div>
        <Keyboard heat={heatmap(result.keys)} />
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={onNext} className={`${button} bg-accent text-bg hover:brightness-110`}>
          Next test
          <ChevronRight size={16} />
        </button>
        <button type="button" onClick={onRepeat} className={`${button} bg-panel hover:text-accent`}>
          <RotateCcw size={15} />
          Repeat
        </button>
        {weak.length > 0 && (
          <button type="button" onClick={onPractice} className={`${button} bg-panel hover:text-accent`}>
            <Crosshair size={15} />
            Practice weak keys
          </button>
        )}
      </div>
    </div>
  );
}
