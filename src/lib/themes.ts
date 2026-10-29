import type { ThemeName } from "../types";

// colors for the theme picker, the real values are in index.css
export const THEMES: { name: ThemeName; bg: string; key: string; accent: string }[] = [
  { name: "paper", bg: "#f3eee4", key: "#fbf8f2", accent: "#e2603b" },
  { name: "midnight", bg: "#15171c", key: "#262a33", accent: "#7cc4ff" },
  { name: "matcha", bg: "#1e2520", key: "#2f3a31", accent: "#a8d38d" },
  { name: "retro", bg: "#d9d4c7", key: "#ece8de", accent: "#3f6fa8" },
  { name: "sakura", bg: "#fdeef0", key: "#fffafb", accent: "#e0607e" },
];
