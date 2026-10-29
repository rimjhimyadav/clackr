import { describe, expect, it } from "vitest";
import { SKIPPED, backspace, countCorrect, deleteWord, isComplete, newTest, typeChar } from "./engine";

function typeAll(target: string, input: string) {
  return [...input].reduce((state, char, i) => typeChar(state, char, 1000 + i * 100), newTest(target));
}

describe("typing", () => {
  it("records what you typed and starts the clock on the first key", () => {
    const state = typeAll("cat", "cxt");
    expect(state.typed).toBe("cxt");
    expect(state.startedAt).toBe(1000);
    expect(state.keystrokes[1]).toEqual({ expected: "a", typed: "x", time: 100 });
    expect(countCorrect(state)).toBe(2);
    expect(isComplete(state)).toBe(true);
  });

  it("ignores keys after the end", () => {
    const done = typeAll("hi", "hi");
    expect(typeChar(done, "x", 5000)).toBe(done);
  });

  it("types the indentation after a new line for you", () => {
    const state = typeAll("if {\n  go\n}", "if {\n");
    expect(state.typed).toBe("if {\n  ");
    expect(state.keystrokes).toHaveLength(5);
  });

  it("ignores spaces you type yourself at the start of a line", () => {
    const state = typeAll("if {\n  go\n}", "if {\n  g");
    expect(state.typed).toBe("if {\n  g");
  });
});

describe("mistakes stay inside the word", () => {
  it("doesn't move on when you type an extra letter at the end of a word", () => {
    const state = typeAll("hi there", "hiii there");
    expect(state.typed).toBe("hi there");
    expect(state.keystrokes.filter((key) => key.typed !== key.expected)).toHaveLength(2);
  });

  it("skips the rest of the word when you press space early", () => {
    const state = typeAll("hello world", "he w");
    expect(state.typed).toBe(`he${SKIPPED.repeat(3)} w`);
    expect(countCorrect(state)).toBe(4);
  });

  it("goes back to the last typed letter after a skipped word", () => {
    const state = backspace(typeAll("hello world", "he "));
    expect(state.typed).toBe("he");
  });
});

describe("deleting", () => {
  it("removes one letter", () => {
    expect(backspace(typeAll("hello", "hel")).typed).toBe("he");
    expect(backspace(newTest("hello")).typed).toBe("");
  });

  it("removes a new line together with its indentation", () => {
    const state = typeAll("a\n  b", "a\n");
    expect(state.typed).toBe("a\n  ");
    expect(backspace(state).typed).toBe("a");
  });

  it("removes the last word with Ctrl + Backspace", () => {
    expect(deleteWord(typeAll("one two three", "one two")).typed).toBe("one ");
    expect(deleteWord(typeAll("one two three", "one two ")).typed).toBe("one ");
  });
});
