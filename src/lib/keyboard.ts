export const ROWS = [
  ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "backspace"],
  ["tab", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\"],
  ["caps", "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'", "enter"],
  ["shift", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/", "rshift"],
  ["space"],
];

// how wide each key is, in normal key widths. every row adds up to 15
export const WIDTHS: Record<string, number> = {
  backspace: 2,
  tab: 1.5,
  "\\": 1.5,
  caps: 1.75,
  enter: 2.25,
  shift: 2.25,
  rshift: 2.75,
  space: 6.25,
};

export const LABELS: Record<string, string> = {
  backspace: "⌫",
  tab: "tab",
  caps: "caps",
  enter: "enter",
  shift: "shift",
  rshift: "shift",
  space: "",
};

const SHIFTED: Record<string, string> = {
  "~": "`", "!": "1", "@": "2", "#": "3", "$": "4", "%": "5", "^": "6", "&": "7", "*": "8", "(": "9", ")": "0",
  _: "-", "+": "=", "{": "[", "}": "]", "|": "\\", ":": ";", '"': "'", "<": ",", ">": ".", "?": "/",
};

// the key you press for a character, so "{" and "[" share one key
export function keyFor(char: string) {
  if (char === " ") return "space";
  if (char === "\n") return "enter";
  const lower = char.toLowerCase();
  return SHIFTED[lower] ?? lower;
}

// names for event.key values, so "Shift" lights up the shift key
export function keyFromEvent(key: string) {
  const names: Record<string, string> = { " ": "space", Enter: "enter", Backspace: "backspace", Tab: "tab", Shift: "shift", CapsLock: "caps" };
  return names[key] ?? keyFor(key);
}
