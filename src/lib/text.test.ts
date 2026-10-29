import { describe, expect, it } from "vitest";
import type { Settings } from "../types";
import { SNIPPETS } from "./snippets";
import { buildText, randomWords, weakKeyWords } from "./text";

const settings: Settings = { mode: "words", time: 30, words: 25, theme: "paper", sound: "off", ghost: false };

describe("text", () => {
  it("makes the number of words asked for, without repeating a word twice in a row", () => {
    const words = randomWords(40).split(" ");
    expect(words).toHaveLength(40);
    expect(words.every((word, i) => word !== words[i - 1])).toBe(true);
  });

  it("uses words with your weak keys", () => {
    const words = weakKeyWords(["z", "q"], 20).split(" ");
    expect(words.every((word) => word.includes("z") || word.includes("q"))).toBe(true);
  });

  it("builds text for every mode", () => {
    expect(buildText({ ...settings, mode: "time", time: 15 }, []).split(" ")).toHaveLength(60);
    expect(buildText(settings, []).split(" ")).toHaveLength(25);
    expect(SNIPPETS).toContain(buildText({ ...settings, mode: "code" }, []));
  });
});
