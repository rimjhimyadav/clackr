import { Fragment, memo, useLayoutEffect, useMemo, useRef } from "react";

// each word with the space (or new line) after it, and where it starts in the text
function splitWords(text: string) {
  const words: { text: string; start: number }[] = [];
  let start = 0;
  for (const word of text.match(/[^ \n]*[ \n]?/g) ?? []) {
    if (!word) continue;
    words.push({ text: word, start });
    start += word.length;
  }
  return words;
}

// memo, so only the word you're typing re-renders on each key
const Word = memo(function Word({ text, start, typed }: { text: string; start: number; typed: string }) {
  return (
    <span className="inline-flex">
      {[...text].map((char, i) => {
        const done = i < typed.length;
        const right = typed[i] === char;
        const isSpace = char === " " || char === "\n";
        let color = "text-sub";
        if (done) color = right ? "text-text" : isSpace ? "rounded-sm bg-error/30" : "text-error underline decoration-2 underline-offset-[6px]";

        return (
          <span key={i} data-i={start + i} className={`${color} ${char === "\n" && !done ? "opacity-40" : ""}`}>
            {char === "\n" ? "↵" : char}
          </span>
        );
      })}
    </span>
  );
});

type Props = {
  text: string;
  typed: string;
  started: boolean;
  ghost: number | null;
};

export default function TypingText({ text, typed, started, ghost }: Props) {
  const words = useMemo(() => splitWords(text), [text]);
  const linesRef = useRef<HTMLDivElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);

  const ghostRef = useRef<HTMLSpanElement>(null);

  // move the carets to their letters, and scroll so you're always on the second line
  useLayoutEffect(() => {
    const lines = linesRef.current;
    if (!lines || !caretRef.current || !ghostRef.current) return;

    function place(index: number) {
      const atEnd = index >= text.length;
      const letter = lines!.querySelector<HTMLElement>(`[data-i="${atEnd ? text.length - 1 : index}"]`);
      if (!letter) return null;
      return { left: letter.offsetLeft + (atEnd ? letter.offsetWidth : 0), top: letter.offsetTop, height: letter.offsetHeight };
    }

    const caret = place(typed.length);
    if (!caret) return;
    const firstLine = Math.max(0, Math.round(caret.top / caret.height) - 1);
    caretRef.current.style.transform = `translate(${caret.left}px, ${caret.top}px)`;
    caretRef.current.style.height = `${caret.height}px`;
    lines.style.transform = `translateY(${-firstLine * caret.height}px)`;

    const ghostSpot = ghost === null ? null : place(ghost);
    const ghostLine = ghostSpot ? Math.round(ghostSpot.top / ghostSpot.height) : -1;
    ghostRef.current.style.opacity = ghostLine >= firstLine && ghostLine <= firstLine + 2 ? "1" : "0";
    if (ghostSpot) {
      ghostRef.current.style.transform = `translate(${ghostSpot.left}px, ${ghostSpot.top}px)`;
      ghostRef.current.style.height = `${ghostSpot.height}px`;
    }
  }, [typed.length, text, ghost]);

  return (
    <div className="h-[7.5rem] overflow-hidden font-mono text-[1.55rem] leading-[2.5rem] sm:text-[1.7rem]">
      <div ref={linesRef} className="relative flex flex-wrap whitespace-pre transition-transform duration-200">
        <span
          ref={ghostRef}
          title="Your best run"
          className="absolute top-0 left-0 w-[3px] rounded-full bg-sub/60 opacity-0 transition-[transform,opacity] duration-100 ease-linear"
        />
        <span
          ref={caretRef}
          className={`absolute top-0 left-0 w-[3px] rounded-full bg-accent transition-transform duration-100 ease-out ${started ? "" : "animate-[blink_1s_step-end_infinite]"}`}
        />
        {words.map((word) => (
          <Fragment key={word.start}>
            <Word text={word.text} start={word.start} typed={typed.slice(word.start, word.start + word.text.length)} />
            {word.text.endsWith("\n") && <span className="basis-full" />}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
