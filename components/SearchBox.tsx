"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Autocomplete from "@/components/Autocomplete";
import Loader from "@/components/Loader";
import { Search, Sparkles } from "lucide-react";
import type { WordResult } from "@/lib/types";
import { fetchSuggestions } from "@/lib/datamuse";

function debounce<T extends (...args: any[]) => void>(fn: T, ms: number) {
  let t: any;
  return (...args: Parameters<T>) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

export default function SearchBox({ onResult }: { onResult: (r: WordResult) => void }) {
  const [q, setQ] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSug, setLoadingSug] = useState(false);
  const [loadingDef, setLoadingDef] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastRequested = useRef<string>("");

  const debouncedSuggest = useMemo(
    () =>
      debounce(async (text: string) => {
        const t = text.trim();
        if (t.length < 2) {
          setSuggestions([]);
          return;
        }
        setLoadingSug(true);
        const items = await fetchSuggestions(t);
        setSuggestions(items);
        setLoadingSug(false);
      }, 450),
    []
  );

  useEffect(() => {
    setError(null);
    debouncedSuggest(q);
  }, [q, debouncedSuggest]);

  async function fetchDefine(word: string) {
    const w = word.trim().toLowerCase();
    if (!w) return;

    if (lastRequested.current === w) return;
    lastRequested.current = w;

    setLoadingDef(true);
    setError(null);
    setSuggestions([]);

    try {
      const res = await fetch(`/api/define?word=${encodeURIComponent(w)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Failed");
      onResult(data);
    } catch (e: any) {
      setError(String(e?.message ?? e));
    } finally {
      setLoadingDef(false);
    }
  }

  return (
    <div>
      <label className="text-sm text-slate-700 dark:text-white">Enter an English word</label>

      <div className="mt-2 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") fetchDefine(q);
            }}
            placeholder="e.g., resilient"
            className="w-full rounded-2xl border px-12 py-4 text-lg
             bg-white dark:bg-slate-900
             focus:ring-2 focus:ring-primary-400"
          />
          {loadingSug && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-200 border-t-primary-700" />
            </div>
          )}
        </div>

        <button className="btn" onClick={() => fetchDefine(q)} disabled={loadingDef}>
          <Sparkles className="h-4 w-4" />
          Search
        </button>
      </div>

      <Autocomplete
        items={suggestions}
        onPick={(w) => {
          setQ(w);
          fetchDefine(w);
        }}
      />

      <div className="mt-3 min-h-[24px]">
        {loadingDef && <Loader label="Fetching meaning..." />}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      <p className="mt-2 text-xs text-slate-500 sinhala">
        උපදෙස්: Enter ඔබන්න.
      </p>
    </div>
  );
}
