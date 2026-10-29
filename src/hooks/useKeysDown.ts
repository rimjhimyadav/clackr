import { useEffect, useState } from "react";
import { keyFromEvent } from "../lib/keyboard";

// keys held down right now, so the keyboard on screen presses with yours
export function useKeysDown() {
  const [keys, setKeys] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    function update(key: string, down: boolean) {
      setKeys((current) => {
        const next = new Set(current);
        if (down) next.add(key);
        else next.delete(key);
        return next;
      });
    }
    const handleDown = (event: KeyboardEvent) => update(keyFromEvent(event.key), true);
    const handleUp = (event: KeyboardEvent) => update(keyFromEvent(event.key), false);
    const clear = () => setKeys(new Set());

    window.addEventListener("keydown", handleDown);
    window.addEventListener("keyup", handleUp);
    window.addEventListener("blur", clear);
    return () => {
      window.removeEventListener("keydown", handleDown);
      window.removeEventListener("keyup", handleUp);
      window.removeEventListener("blur", clear);
    };
  }, []);

  return keys;
}
