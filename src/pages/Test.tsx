import { useEffect, useEffectEvent, useState } from "react";
import type { Result, Settings } from "../types";
import { useStore } from "../store";
import { amountFor, buildText } from "../lib/text";
import { modeKey, personalBest, weakestKeys } from "../lib/stats";
import ModeBar from "../components/ModeBar";
import Results from "../components/Results";
import TypingTest from "../components/TypingTest";

export default function Test() {
  const settings = useStore((state) => state.settings);
  const history = useStore((state) => state.history);
  const keyStats = useStore((state) => state.keyStats);
  const updateSettings = useStore((state) => state.updateSettings);
  const addResult = useStore((state) => state.addResult);
  const ghosts = useStore((state) => state.ghosts);

  const [round, setRound] = useState(0);
  const [text, setText] = useState(() => buildText(settings, weakestKeys(keyStats)));
  const [result, setResult] = useState<Result | null>(null);
  const [best, setBest] = useState(0);
  const [racedGhost, setRacedGhost] = useState<number[]>();
  const weakKeys = weakestKeys(keyStats);
  const ghost = settings.ghost ? ghosts[modeKey(settings.mode, amountFor(settings))] : undefined;

  function restart(next: Settings = settings, sameText = false) {
    if (!sameText) setText(buildText(next, weakestKeys(useStore.getState().keyStats)));
    setResult(null);
    setRound((count) => count + 1);
  }

  function changeSettings(changes: Partial<Settings>) {
    updateSettings(changes);
    restart({ ...settings, ...changes });
  }

  function handleFinish(finished: Result) {
    setBest(personalBest(history, finished.mode, finished.amount));
    setRacedGhost(ghost);
    addResult(finished);
    setResult(finished);
  }

  // Tab gives you new words, Esc restarts with the same ones
  const handleKey = useEffectEvent((event: KeyboardEvent) => {
    if (event.key === "Tab" || event.key === "Escape") {
      event.preventDefault();
      restart(settings, event.key === "Escape");
    }
  });

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  if (result) {
    return (
      <Results
        result={result}
        best={best}
        ghost={racedGhost}
        onNext={() => restart()}
        onRepeat={() => restart(settings, true)}
        onPractice={() => changeSettings({ mode: "weak" })}
      />
    );
  }

  return (
    <>
      <ModeBar settings={settings} onChange={changeSettings} />
      {settings.mode === "weak" && (
        <p className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm text-sub">
          {weakKeys.length > 0 ? (
            <>
              Practicing
              {weakKeys.map((key) => (
                <kbd key={key} className="keycap rounded-md px-2 py-0.5 font-mono text-text">
                  {key}
                </kbd>
              ))}
            </>
          ) : (
            "Take a few tests first, then this mode practices the keys you miss most."
          )}
        </p>
      )}
      {settings.ghost && !ghost && <p className="mt-4 text-center text-sm text-sub">No ghost yet. Finish this test and your best run becomes the ghost to beat.</p>}
      <TypingTest
        key={round}
        text={text}
        mode={settings.mode}
        amount={amountFor(settings)}
        sound={settings.sound}
        ghost={ghost}
        onFinish={handleFinish}
      />
    </>
  );
}
