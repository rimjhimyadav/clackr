import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { HistoryEntry, KeyStats, Result, Settings } from "./types";
import { mergeKeyStats, modeKey, personalBest } from "./lib/stats";

type State = {
  settings: Settings;
  history: HistoryEntry[];
  keyStats: KeyStats;
  // your best run for each test, raced by the ghost
  ghosts: Record<string, number[]>;
  updateSettings: (changes: Partial<Settings>) => void;
  addResult: (result: Result) => void;
  clearHistory: () => void;
};

// settings and past tests, saved in localStorage
export const useStore = create<State>()(
  persist(
    (set) => ({
      settings: { mode: "time", time: 30, words: 25, theme: "paper", sound: "thock", ghost: true },
      history: [],
      keyStats: {},
      ghosts: {},

      updateSettings: (changes) => set((state) => ({ settings: { ...state.settings, ...changes } })),

      addResult: ({ samples, keys, progress, ...entry }) =>
        set((state) => {
          const isBest = entry.wpm > personalBest(state.history, entry.mode, entry.amount);
          return {
            history: [entry, ...state.history].slice(0, 100),
            keyStats: mergeKeyStats(state.keyStats, keys),
            ghosts: isBest ? { ...state.ghosts, [modeKey(entry.mode, entry.amount)]: progress } : state.ghosts,
          };
        }),

      clearHistory: () => set({ history: [], keyStats: {}, ghosts: {} }),
    }),
    { name: "clackr" }
  )
);
