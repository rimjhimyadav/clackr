import type { HistoryEntry, KeyStats, Mode, Result } from "../types";
import { countCorrect, countTyped, type TestState } from "./engine";
import { keyFor } from "./keyboard";

// a "word" is 5 characters, so speed doesn't depend on how long the words are
export function wordsPerMinute(chars: number, seconds: number) {
  return seconds > 0 ? (chars / 5) * (60 / seconds) : 0;
}

// 100 means the same speed every second
export function consistency(values: number[]) {
  if (values.length < 2) return 100;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  if (mean === 0) return 0;

  const deviation = Math.sqrt(values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length);
  return Math.max(0, Math.round(100 - (deviation / mean) * 100));
}

export const GHOST_STEP = 250;

// how many letters you had typed right after each 250ms
export function progressTimeline(state: TestState, duration: number) {
  const steps = Math.ceil((duration * 1000) / GHOST_STEP);
  return Array.from(
    { length: steps },
    (_, i) => state.keystrokes.filter((key) => key.time < (i + 1) * GHOST_STEP && key.typed === key.expected).length
  );
}

// where the ghost is after some seconds. once its run is over it waits at the end
export function ghostAt(progress: number[], seconds: number) {
  if (progress.length === 0) return 0;
  return progress[Math.min(progress.length - 1, Math.floor((seconds * 1000) / GHOST_STEP))];
}

// stops where the ghost's own run ended
export function ghostSamples(progress: number[], seconds: number) {
  const length = Math.min(seconds, Math.ceil((progress.length * GHOST_STEP) / 1000));
  return Array.from({ length }, (_, i) => Math.round(wordsPerMinute(ghostAt(progress, i + 1 - 0.001), i + 1)));
}

export function buildResult(state: TestState, mode: Mode, amount: number, endedAt: number): Result {
  const { keystrokes } = state;
  const duration = Math.max((endedAt - (state.startedAt ?? endedAt)) / 1000, 1);
  const correct = countCorrect(state);
  const rightKeystrokes = keystrokes.filter((key) => key.typed === key.expected).length;

  const samples = Array.from({ length: Math.round(duration) }, (_, i) => {
    const second = i + 1;
    const isLast = second === Math.round(duration);
    const inSecond = keystrokes.filter((key) => key.time >= i * 1000 && (isLast || key.time < second * 1000));
    const rightSoFar = keystrokes.filter((key) => key.time < second * 1000 && key.typed === key.expected).length;

    return {
      second,
      wpm: Math.round(wordsPerMinute(rightSoFar, Math.min(second, duration))),
      raw: Math.round(wordsPerMinute(inSecond.length, 1)),
      errors: inSecond.filter((key) => key.typed !== key.expected).length,
    };
  });

  const keys: KeyStats = {};
  for (const { expected, typed } of keystrokes) {
    if (expected === " " || expected === "\n") continue;
    const key = keyFor(expected);
    keys[key] ??= { hits: 0, misses: 0 };
    keys[key].hits++;
    if (typed !== expected) keys[key].misses++;
  }

  return {
    id: crypto.randomUUID(),
    date: Date.now(),
    mode,
    amount,
    wpm: Math.round(wordsPerMinute(correct, duration)),
    raw: Math.round(wordsPerMinute(countTyped(state), duration)),
    accuracy: keystrokes.length ? Math.round((rightKeystrokes / keystrokes.length) * 100) : 0,
    consistency: consistency(samples.map((sample) => sample.raw)),
    correct,
    incorrect: countTyped(state) - correct,
    duration: Math.round(duration * 10) / 10,
    samples,
    keys,
    progress: progressTimeline(state, duration),
  };
}

export function mergeKeyStats(total: KeyStats, extra: KeyStats) {
  const merged = { ...total };
  for (const [key, { hits, misses }] of Object.entries(extra)) {
    merged[key] = { hits: (merged[key]?.hits ?? 0) + hits, misses: (merged[key]?.misses ?? 0) + misses };
  }
  return merged;
}

// letters you miss most often, compared to how often you type them
export function weakestKeys(stats: KeyStats, count = 4) {
  return Object.entries(stats)
    .filter(([key, { hits, misses }]) => /^[a-z]$/.test(key) && hits >= 5 && misses > 0)
    .sort(([, a], [, b]) => b.misses / b.hits - a.misses / a.hits)
    .slice(0, count)
    .map(([key]) => key);
}

// miss rate of every key from 0 to 1, where 1 is your worst key
export function heatmap(stats: KeyStats) {
  const rates = Object.entries(stats).map(([key, { hits, misses }]) => [key, misses / hits] as const);
  const worst = Math.max(0, ...rates.map(([, rate]) => rate));
  return Object.fromEntries(rates.map(([key, rate]) => [key, worst ? rate / worst : 0]));
}

export function personalBest(history: HistoryEntry[], mode: Mode, amount: number) {
  return Math.max(0, ...history.filter((entry) => entry.mode === mode && entry.amount === amount).map((entry) => entry.wpm));
}

export function modeKey(mode: Mode, amount: number) {
  return `${mode}-${amount}`;
}

export function modeLabel(mode: Mode, amount: number) {
  if (mode === "code") return "code";
  if (mode === "weak") return `weak keys ${amount}`;
  return `${mode} ${amount}`;
}
