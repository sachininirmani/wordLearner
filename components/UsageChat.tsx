"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { UsageResult } from "@/lib/types";
import Loader from "@/components/Loader";
import { MessageCircle, ShieldCheck } from "lucide-react";

const LS_KEY = "ai_usage_daily_count_v1";
const MAX_LOCAL_PER_DAY = 10;

function todayKeyLocal() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getLocalCount(): { dateKey: string; count: number } {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { dateKey: todayKeyLocal(), count: 0 };
    const parsed = JSON.parse(raw);
    if (!parsed?.dateKey || typeof parsed.count !== "number") {
      return { dateKey: todayKeyLocal(), count: 0 };
    }
    return parsed;
  } catch {
    return { dateKey: todayKeyLocal(), count: 0 };
  }
}

function setLocalCount(dateKey: string, count: number) {
  localStorage.setItem(LS_KEY, JSON.stringify({ dateKey, count }));
}

export default function UsageChat({
  word,
  meaningEn,
  onUsage,
  usage,
}: {
  word: string;
  meaningEn?: string;
  onUsage: (u: UsageResult) => void;
  usage: UsageResult | null;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // remaining browser-side quota
  const remainingToday = useMemo(() => {
    if (typeof window === "undefined") return MAX_LOCAL_PER_DAY;
    const key = todayKeyLocal();
    const { dateKey, count } = getLocalCount();
    if (dateKey !== key) return MAX_LOCAL_PER_DAY;
    return Math.max(0, MAX_LOCAL_PER_DAY - count);
  }, [word, meaningEn]);

  // prevent duplicate requests
  const lastRequestRef = useRef<{ sig: string; at: number } | null>(null);

  // cancel in-flight request
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  async function generate() {
    setError(null);

    if (loading) return;
    if (!word?.trim()) return;

    if (remainingToday <= 0) {
      setError("Daily limit reached for this browser. Please try again tomorrow.");
      return;
    }

    // debounce identical request within 2 seconds
    const sig = `${word.toLowerCase().trim()}__${(meaningEn ?? "")
      .toLowerCase()
      .trim()}`;
    const now = Date.now();
    if (
      lastRequestRef.current &&
      lastRequestRef.current.sig === sig &&
      now - lastRequestRef.current.at < 2000
    ) {
      return;
    }
    lastRequestRef.current = { sig, at: now };

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);

    try {
      const res = await fetch("/api/usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word, meaningEn }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to generate usage examples.");
      }

      const data = (await res.json()) as UsageResult;
      onUsage(data);

      // update browser-side quota
      const key = todayKeyLocal();
      const current = getLocalCount();
      const count = current.dateKey === key ? current.count + 1 : 1;
      setLocalCount(key, count);
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        setError(e?.message ?? "Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card p-4 md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-slate-700" />
          <div>
            <h3 className="text-base font-semibold">Usage examples</h3>
            <p className="text-sm text-slate-600">
              Example sentences in English with Sinhala meaning.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1 text-xs text-slate-600 md:flex">
            <ShieldCheck className="h-4 w-4" />
            <span>{remainingToday} left today</span>
          </div>

          <button
            className="btn"
            onClick={generate}
            disabled={loading || !word?.trim()}
          >
            {loading ? "Generating…" : "Generate"}
          </button>
        </div>
      </div>

      {/* ERROR */}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {/* LOADING */}
      {loading && (
        <div className="mt-4">
          <Loader label="Generating examples..." />
        </div>
      )}

      {/* WARNING WHEN AI FALLBACK */}
      {usage?.mode === "demo" && (
        <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
          ⚠️ AI usage limit has been reached.  
          Showing standard example sentences instead.
        </div>
      )}

      {/* SOURCE LABEL */}
      {usage && (
        <p className="mt-2 text-xs text-slate-500">
          Source:{" "}
          {usage.mode === "ai"
            ? "AI-generated"
            : usage.mode === "dictionary"
            ? "Dictionary examples"
            : "Standard examples"}
        </p>
      )}

      {/* RESULTS */}
      {usage && (
        <div className="mt-4 space-y-3">
          {usage.pairs.map((p, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 bg-white p-4"
            >
              <p className="text-slate-900">{p.en}</p>
              <p className="mt-2 text-slate-700 sinhala">{p.si}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
