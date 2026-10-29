import { describe, expect, it } from "vitest";
import type { HistoryEntry } from "../types";
import { newTest, typeChar } from "./engine";
import { keyFor } from "./keyboard";
import { buildResult, consistency, ghostAt, missedKeys, ghostSamples, heatmap, personalBest, progressTimeline, weakestKeys, wordsPerMinute } from "./stats";

describe("speed", () => {
  it("counts 5 characters as a word", () => {
    expect(wordsPerMinute(50, 60)).toBe(10);
    expect(wordsPerMinute(25, 15)).toBe(20);
    expect(wordsPerMinute(10, 0)).toBe(0);
  });

  it("gives 100 consistency when every second is the same", () => {
    expect(consistency([60, 60, 60])).toBe(100);
    expect(consistency([20, 100])).toBeLessThan(50);
  });
});

describe("buildResult", () => {
  // 10 letters over 2 seconds, one of them wrong
  const typed = [..."helloxorld"].reduce((state, char, i) => typeChar(state, char, i * 200), newTest("helloworld"));
  const result = buildResult(typed, "words", 10, 2000);

  it("works out speed and accuracy", () => {
    expect(result.wpm).toBe(54);
    expect(result.raw).toBe(60);
    expect(result.accuracy).toBe(90);
    expect(result.correct).toBe(9);
    expect(result.incorrect).toBe(1);
  });

  it("makes one sample per second", () => {
    expect(result.samples.map((sample) => sample.second)).toEqual([1, 2]);
    expect(result.samples[1].errors).toBe(1);
  });

  it("counts hits and misses per key", () => {
    expect(result.keys.w).toEqual({ hits: 1, misses: 1 });
    expect(result.keys.l).toEqual({ hits: 3, misses: 0 });
  });
});

describe("keys", () => {
  it("maps characters to the key you press", () => {
    expect(keyFor("A")).toBe("a");
    expect(keyFor("{")).toBe("[");
    expect(keyFor(" ")).toBe("space");
  });

  it("finds the letters you miss most", () => {
    const stats = { a: { hits: 20, misses: 1 }, q: { hits: 10, misses: 5 }, z: { hits: 2, misses: 2 }, ";": { hits: 9, misses: 9 } };
    expect(weakestKeys(stats)).toEqual(["q", "a"]);
    expect(heatmap(stats).q).toBe(0.5);
    expect(missedKeys(stats)).toEqual([";", "q", "z"]);
  });
});

it("finds the best score for the same test", () => {
  const entry = (mode: HistoryEntry["mode"], amount: number, wpm: number) => ({ mode, amount, wpm }) as HistoryEntry;
  const history = [entry("time", 30, 70), entry("time", 30, 82), entry("time", 60, 99)];
  expect(personalBest(history, "time", 30)).toBe(82);
  expect(personalBest(history, "words", 25)).toBe(0);
});

describe("ghost", () => {
  // one right letter every 200ms, the 3rd one wrong
  const run = [..."abcdef"].reduce((state, char, i) => typeChar(state, i === 2 ? "x" : char, i * 200), newTest("abcdef"));

  it("records right letters every 250ms", () => {
    expect(progressTimeline(run, 1.25)).toEqual([2, 2, 3, 4, 5]);
  });

  it("finds where the ghost is and waits at the end", () => {
    const progress = [2, 4, 6];
    expect(ghostAt(progress, 0)).toBe(2);
    expect(ghostAt(progress, 0.5)).toBe(6);
    expect(ghostAt(progress, 10)).toBe(6);
    expect(ghostAt([], 3)).toBe(0);
  });

  it("turns the ghost run into wpm per second", () => {
    const progress = Array.from({ length: 8 }, (_, i) => (i + 1) * 5);
    expect(ghostSamples(progress, 2)).toEqual([240, 240]);
    expect(ghostSamples(progress, 5)).toHaveLength(2);
  });
});
