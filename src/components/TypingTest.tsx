import { useEffect, useEffectEvent, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Ghost, MousePointerClick } from "lucide-react";
import type { Mode, Result, SoundName } from "../types";
import { backspace, countCorrect, deleteWord, isComplete, newTest, typeChar, type TestState } from "../lib/engine";
import { keyFor } from "../lib/keyboard";
import { playPress, playRelease, type KeyKind } from "../lib/sound";
import { buildResult, ghostAt, wordsPerMinute } from "../lib/stats";
import { useKeysDown } from "../hooks/useKeysDown";
import Keyboard from "./Keyboard";
import TypingText from "./TypingText";

type Props = {
  text: string;
  mode: Mode;
  amount: number;
  sound: SoundName;
  ghost?: number[];
  onFinish: (result: Result) => void;
};

export default function TypingTest({ text, mode, amount, sound, ghost, onFinish }: Props) {
  const [test, setTest] = useState(() => newTest(text));
  const [now, setNow] = useState(() => Date.now());
  const [focused, setFocused] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const finished = useRef(false);
  const pressed = useKeysDown();

  const started = test.startedAt !== null;
  const elapsed = started ? Math.max(0, (now - test.startedAt!) / 1000) : 0;

  function finish(state: TestState, endedAt: number) {
    if (finished.current) return;
    finished.current = true;
    onFinish(buildResult(state, mode, amount, endedAt));
  }

  function update(next: TestState, kind: KeyKind = "key") {
    playPress(sound, kind);
    if (next === test) return;
    setTest(next);
    if (isComplete(next)) finish(next, Date.now());
  }

  const tick = useEffectEvent(() => {
    const time = Date.now();
    setNow(time);
    if (mode === "time" && test.startedAt && time - test.startedAt >= amount * 1000) {
      finish(test, test.startedAt + amount * 1000);
    }
  });

  useEffect(() => {
    if (!started) return;
    const id = setInterval(tick, 100);
    return () => clearInterval(id);
  }, [started]);

  // start typing anywhere on the page, even when the text isn't focused
  useEffect(() => {
    const focusOnType = (event: globalThis.KeyboardEvent) => {
      if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) inputRef.current?.focus();
    };
    window.addEventListener("keydown", focusOnType);
    return () => window.removeEventListener("keydown", focusOnType);
  }, []);

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const { key } = event;

    if (key === "Backspace") {
      event.preventDefault();
      update(event.ctrlKey || event.altKey || event.metaKey ? deleteWord(test) : backspace(test), "big");
    } else if (key === "Enter") {
      event.preventDefault();
      update(typeChar(test, "\n", Date.now()), "big");
    } else if (key.length === 1 && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      update(typeChar(test, key, Date.now()), key === " " ? "space" : "key");
    }
  }

  // phones send letters as input events instead of key presses
  function handleInput(event: FormEvent<HTMLInputElement>) {
    const value = event.currentTarget.value;
    event.currentTarget.value = "";
    update([...value].reduce((state, char) => typeChar(state, char, Date.now()), test));
  }

  const wordsTyped = (test.typed.match(/ /g) ?? []).length;
  const progress =
    mode === "time"
      ? `${Math.max(0, Math.ceil(amount - elapsed))}`
      : mode === "code"
        ? `${Math.round((test.typed.length / text.length) * 100)}%`
        : `${wordsTyped}/${amount}`;
  const correct = countCorrect(test);
  const wpm = elapsed >= 1 ? Math.round(wordsPerMinute(correct, elapsed)) : 0;
  const ghostIndex = ghost && started ? Math.min(text.length, ghostAt(ghost, elapsed)) : null;
  const lead = ghostIndex === null ? 0 : correct - ghostIndex;

  return (
    <div className="mt-12">
      <div className="mb-3 flex h-8 items-end gap-5 font-mono text-accent">
        <span className="text-2xl">{progress}</span>
        {started && <span className="text-sm text-sub">{wpm} wpm</span>}
        {ghostIndex !== null && (
          <span className={`flex items-center gap-1 text-sm ${lead >= 0 ? "text-text" : "text-error"}`}>
            <Ghost size={14} />
            {lead >= 0 ? `ahead by ${lead}` : `behind by ${-lead}`}
          </span>
        )}
      </div>

      <div className="relative cursor-text" onClick={() => inputRef.current?.focus()}>
        <input
          ref={inputRef}
          autoFocus
          aria-label="Type here"
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          onKeyDown={handleKeyDown}
          onKeyUp={() => playRelease(sound)}
          onInput={handleInput}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="absolute size-px opacity-0"
        />
        <div className={`transition ${focused ? "" : "opacity-40 blur-sm"}`}>
          <TypingText text={text} typed={test.typed} started={started} ghost={ghostIndex} />
        </div>
        {!focused && (
          <p className="absolute inset-0 grid place-items-center text-sub">
            <span className="flex items-center gap-2">
              <MousePointerClick size={18} />
              Click here or start typing
            </span>
          </p>
        )}
      </div>

      <div className="mt-14 hidden md:block">
        <Keyboard pressed={pressed} next={keyFor(text[test.typed.length] ?? " ")} />
      </div>
    </div>
  );
}
