import { Link } from "react-router";
import { Trash2 } from "lucide-react";
import type { Mode } from "../types";
import { useStore } from "../store";
import { heatmap, modeLabel, personalBest } from "../lib/stats";
import Chart from "../components/Chart";
import Keyboard from "../components/Keyboard";

const BESTS: [Mode, number][] = [
  ["time", 15],
  ["time", 30],
  ["time", 60],
  ["words", 10],
  ["words", 25],
  ["words", 50],
  ["code", 1],
];

export default function History() {
  const history = useStore((state) => state.history);
  const keyStats = useStore((state) => state.keyStats);
  const clearHistory = useStore((state) => state.clearHistory);

  if (history.length === 0) {
    return (
      <div className="mt-24 text-center">
        <p className="text-2xl font-semibold">No tests yet</p>
        <p className="mt-2 text-sub">Your speed, best scores and weakest keys show up here.</p>
        <Link to="/" className="mt-6 inline-block rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-bg">
          Take a test
        </Link>
      </div>
    );
  }

  const recent = history.slice(0, 30).reverse();
  const lastTen = history.slice(0, 10);
  const average = Math.round(lastTen.reduce((sum, entry) => sum + entry.wpm, 0) / lastTen.length);
  const minutes = Math.round(history.reduce((sum, entry) => sum + entry.duration, 0) / 60);
  const overview = [
    { label: "tests", value: history.length },
    { label: "average wpm (last 10)", value: average },
    { label: "best wpm", value: Math.max(...history.map((entry) => entry.wpm)) },
    { label: "minutes typed", value: minutes },
  ];

  return (
    <div className="mt-6 pb-10">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {overview.map((stat) => (
          <div key={stat.label} className="rounded-xl bg-panel px-4 py-3">
            <p className="text-xs text-sub">{stat.label}</p>
            <p className="mt-0.5 font-mono text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-12 mb-4 text-sm text-sub">Last {recent.length} tests</h2>
      <Chart
        series={[
          { label: "wpm", values: recent.map((entry) => entry.wpm), color: "var(--accent)" },
          { label: "accuracy", values: recent.map((entry) => entry.accuracy), color: "var(--sub)", dashed: true },
        ]}
        xLabel={(i) => `#${history.length - recent.length + i + 1}`}
      />

      <h2 className="mt-12 mb-4 text-sm text-sub">Personal bests</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {BESTS.map(([mode, amount]) => {
          const best = personalBest(history, mode, amount);
          return (
            <div key={`${mode}${amount}`} className="rounded-xl bg-panel px-4 py-3">
              <p className="text-xs text-sub">{modeLabel(mode, amount)}</p>
              <p className={`mt-0.5 font-mono text-2xl font-bold ${best ? "text-accent" : "text-sub"}`}>{best || "-"}</p>
            </div>
          );
        })}
      </div>

      <h2 className="mt-12 mb-4 text-sm text-sub">Keys you miss most, from every test</h2>
      <Keyboard heat={heatmap(keyStats)} />

      <div className="mt-12 mb-4 flex items-center justify-between">
        <h2 className="text-sm text-sub">Recent tests</h2>
        <button
          type="button"
          onClick={() => confirm("Delete all your tests and stats?") && clearHistory()}
          className="flex cursor-pointer items-center gap-1.5 text-sm text-sub transition hover:text-error"
        >
          <Trash2 size={14} />
          Clear history
        </button>
      </div>
      <div className="overflow-x-auto rounded-xl bg-panel">
        <table className="w-full font-mono text-sm">
          <thead className="text-left text-xs text-sub">
            <tr>
              {["test", "wpm", "accuracy", "consistency", "date"].map((heading) => (
                <th key={heading} className="px-4 py-3 font-normal">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.slice(0, 15).map((entry) => (
              <tr key={entry.id} className="border-t border-bg">
                <td className="px-4 py-2.5">{modeLabel(entry.mode, entry.amount)}</td>
                <td className="px-4 py-2.5 font-bold text-accent">{entry.wpm}</td>
                <td className="px-4 py-2.5">{entry.accuracy}%</td>
                <td className="px-4 py-2.5">{entry.consistency}%</td>
                <td className="px-4 py-2.5 text-sub">{new Date(entry.date).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
