import type { Settings } from "../types";
import { SNIPPETS } from "./snippets";
import { WORDS } from "./words";

type Random = () => number;

function pick<T>(list: T[], random: Random) {
  return list[Math.floor(random() * list.length)];
}

export function randomWords(count: number, pool = WORDS, random: Random = Math.random) {
  const words: string[] = [];
  while (words.length < count) {
    const word = pick(pool, random);
    if (word !== words.at(-1)) words.push(word);
  }
  return words.join(" ");
}

// words that have at least one of the keys you keep missing
export function weakKeyWords(keys: string[], count: number, random: Random = Math.random) {
  const pool = WORDS.filter((word) => keys.some((key) => word.includes(key)));
  return randomWords(count, pool.length >= 10 ? pool : WORDS, random);
}

export function amountFor(settings: Settings) {
  if (settings.mode === "time") return settings.time;
  if (settings.mode === "code") return 1;
  return settings.words;
}

export function buildText(settings: Settings, weakKeys: string[], random: Random = Math.random) {
  switch (settings.mode) {
    case "time":
      // enough words for someone typing 240 wpm
      return randomWords(settings.time * 4, WORDS, random);
    case "words":
      return randomWords(settings.words, WORDS, random);
    case "weak":
      return weakKeyWords(weakKeys, settings.words, random);
    case "code":
      return pick(SNIPPETS, random);
  }
}
