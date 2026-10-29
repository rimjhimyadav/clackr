import type { Keystroke } from "../types";

export type TestState = {
  target: string;
  typed: string;
  startedAt: number | null;
  keystrokes: Keystroke[];
};

export function newTest(target: string): TestState {
  return { target, typed: "", startedAt: null, keystrokes: [] };
}

export function isComplete(state: TestState) {
  return state.typed.length >= state.target.length;
}

// marks a letter you skipped by pressing space early
export const SKIPPED = "\0";

export function typeChar(state: TestState, char: string, now: number): TestState {
  if (isComplete(state)) return state;

  const startedAt = state.startedAt ?? now;
  const expected = state.target[state.typed.length];
  const keystrokes = [...state.keystrokes, { expected, typed: char, time: now - startedAt }];

  // the indentation was already typed for you, so extra spaces at the start of a line don't count
  if (char === " " && expected !== " " && /\n *$/.test(state.typed)) return state;

  // a letter where a space should be is a mistake, but you stay on the same word
  if (expected === " " && char !== " ") return { ...state, startedAt, keystrokes };

  let typed = state.typed + char;

  // space in the middle of a word skips the rest of it
  if (char === " " && expected !== "\n") {
    const wordEnd = state.target.indexOf(" ", state.typed.length);
    if (wordEnd !== -1) typed = state.typed + SKIPPED.repeat(wordEnd - state.typed.length) + " ";
  }

  // after a new line, the indentation is typed for you
  if (expected === "\n") {
    while (state.target[typed.length] === " ") typed += " ";
  }

  return { ...state, typed, startedAt, keystrokes };
}

export function backspace(state: TestState): TestState {
  let length = state.typed.length;
  if (length === 0) return state;

  // removing the indentation also removes the new line before it
  const lineStart = state.target.lastIndexOf("\n", length - 1);
  if (lineStart !== -1 && state.target.slice(lineStart + 1, length).trim() === "") length = lineStart;
  else length -= 1;

  // going back over a skipped word puts you right after the last letter you typed
  return { ...state, typed: state.typed.slice(0, length).replace(/\0+$/, "") };
}

// Ctrl + Backspace
export function deleteWord(state: TestState): TestState {
  const lastWord = state.typed.match(/\S*\s*$/)?.[0] ?? "";
  return { ...state, typed: state.typed.slice(0, state.typed.length - lastWord.length) };
}

export function countTyped(state: TestState) {
  return state.typed.replaceAll(SKIPPED, "").length;
}

export function countCorrect(state: TestState) {
  return [...state.typed].filter((char, i) => char === state.target[i]).length;
}
