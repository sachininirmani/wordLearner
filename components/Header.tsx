"use client";

import { Sparkles, BookOpenText, Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export default function Header() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("theme");
      if (stored === "dark") {
        document.documentElement.classList.add("dark");
        setIsDark(true);
      } else if (stored === "light") {
        document.documentElement.classList.remove("dark");
        setIsDark(false);
      } else {
        // follow system preference
        const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (prefersDark) {
          document.documentElement.classList.add("dark");
          setIsDark(true);
        }
      }
    } catch {}
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }

  return (
    <header className="flex flex-col items-center text-center gap-3">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 border border-primary-100 shadow-glow">
        <Sparkles className="h-4 w-4 text-primary-700" />
        <span className="text-sm text-slate-700">Sinhala-friendly English learning</span>
      </div>

      <h1 className="mt-3 text-4xl md:text-6xl font-extrabold tracking-tight">
        Sinhala <span className="text-primary-700">English Learner</span>
      </h1>

      <p className="max-w-xl text-slate-600">
        Type an English word, get a simple meaning, Sinhala translation, pronunciation, and quick usage examples.
      </p>

      <div className="mt-2 flex items-center gap-2 text-primary-700">
        <BookOpenText className="h-4 w-4" />
        <span className="text-sm sinhala">සිංහලෙන් ඉගෙනගමු • Unicode</span>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2 items-center">
        <nav className="flex gap-2">
          <a className="btn-soft" href="/">Home</a>
          <a className="btn-soft" href="/wotd">Word of the Day</a>
        </nav>

        <button
          aria-pressed={isDark}
          aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
          className="btn-soft ml-2 flex items-center gap-2"
          onClick={toggleTheme}
          title="Toggle theme"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          <span className="sr-only">Toggle theme</span>
        </button>
      </div>
    </header>
  );
}
