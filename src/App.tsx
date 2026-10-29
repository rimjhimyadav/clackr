import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router";
import { useStore } from "./store";
import Header from "./components/Header";
import History from "./pages/History";
import Test from "./pages/Test";

const SHORTCUTS = [
  ["tab", "new test"],
  ["esc", "restart"],
  ["ctrl + backspace", "delete word"],
];

export default function App() {
  const theme = useStore((state) => state.settings.theme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <div className="mx-auto flex min-h-dvh max-w-5xl flex-col overflow-x-clip px-4 sm:px-8">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Test />} />
          <Route path="/history" element={<History />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="hidden flex-wrap justify-center gap-x-6 gap-y-2 py-8 text-xs text-sub md:flex">
        {SHORTCUTS.map(([key, action]) => (
          <span key={key}>
            <kbd className="rounded bg-panel px-1.5 py-0.5 font-mono">{key}</kbd> {action}
          </span>
        ))}
      </footer>
    </div>
  );
}
