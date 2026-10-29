import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router";
import { ChartLine, Keyboard, Palette, Volume2, VolumeX } from "lucide-react";
import type { SoundName } from "../types";
import { useStore } from "../store";
import { THEMES } from "../lib/themes";
import Logo from "./Logo";

const SOUNDS: SoundName[] = ["thock", "clicky", "off"];

const button = "flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-sub transition hover:text-text";

export default function Header() {
  const settings = useStore((state) => state.settings);
  const updateSettings = useStore((state) => state.updateSettings);
  const [themesOpen, setThemesOpen] = useState(false);
  const themesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!themesOpen) return;
    const close = (event: PointerEvent) => {
      if (!themesRef.current?.contains(event.target as Node)) setThemesOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [themesOpen]);

  return (
    <header className="flex flex-wrap items-center gap-x-6 gap-y-2 py-5 sm:py-6">
      <Logo />
      <nav className="order-last -ml-2.5 flex w-full gap-1 sm:order-none sm:ml-0 sm:w-auto">
        <NavLink to="/" end className={({ isActive }) => `${button} ${isActive ? "text-text" : ""}`}>
          <Keyboard size={17} />
          Test
        </NavLink>
        <NavLink to="/history" className={({ isActive }) => `${button} ${isActive ? "text-text" : ""}`}>
          <ChartLine size={17} />
          History
        </NavLink>
      </nav>

      <div className="ml-auto flex gap-1">
        <button
          type="button"
          onClick={() => updateSettings({ sound: SOUNDS[(SOUNDS.indexOf(settings.sound) + 1) % SOUNDS.length] })}
          title={`Key sound: ${settings.sound}`}
          aria-label={`Key sound: ${settings.sound}`}
          className={button}
        >
          {settings.sound === "off" ? <VolumeX size={17} /> : <Volume2 size={17} />}
          <span className="hidden sm:inline">{settings.sound}</span>
        </button>

        <div ref={themesRef} className="relative">
          <button type="button" onClick={() => setThemesOpen(!themesOpen)} aria-expanded={themesOpen} aria-label="Theme" className={button}>
            <Palette size={17} />
            <span className="hidden sm:inline">{settings.theme}</span>
          </button>
          {themesOpen && (
            <div className="absolute top-full right-0 z-20 mt-2 w-44 rounded-xl bg-panel p-1.5 shadow-xl">
              {THEMES.map((theme) => (
                <button
                  key={theme.name}
                  type="button"
                  onClick={() => {
                    updateSettings({ theme: theme.name });
                    setThemesOpen(false);
                  }}
                  className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-sm hover:bg-bg ${settings.theme === theme.name ? "text-text" : "text-sub"}`}
                >
                  <span className="flex overflow-hidden rounded-full ring-1 ring-black/10">
                    <span className="size-4" style={{ background: theme.bg }} />
                    <span className="size-4" style={{ background: theme.key }} />
                    <span className="size-4" style={{ background: theme.accent }} />
                  </span>
                  {theme.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
