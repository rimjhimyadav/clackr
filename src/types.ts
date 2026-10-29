export type Mode = "time" | "words" | "code" | "weak";

export type SoundName = "thock" | "clicky" | "off";

export type ThemeName = "paper" | "midnight" | "matcha" | "retro" | "sakura";

export type Settings = {
  mode: Mode;
  time: number;
  words: number;
  theme: ThemeName;
  sound: SoundName;
  ghost: boolean;
};

export type Keystroke = {
  expected: string;
  typed: string;
  time: number;
};

export type Sample = {
  second: number;
  wpm: number;
  raw: number;
  errors: number;
};

export type KeyStats = Record<string, { hits: number; misses: number }>;

export type Result = {
  id: string;
  date: number;
  mode: Mode;
  amount: number;
  wpm: number;
  raw: number;
  accuracy: number;
  consistency: number;
  correct: number;
  incorrect: number;
  duration: number;
  samples: Sample[];
  keys: KeyStats;
  // correct letters typed every 250ms, so the ghost can replay it
  progress: number[];
};

export type HistoryEntry = Omit<Result, "samples" | "keys" | "progress">;
