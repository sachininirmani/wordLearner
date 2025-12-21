"use client";

import { useState } from "react";
import Header from "@/components/Header";
import SearchBox from "@/components/SearchBox";
import WordCard from "@/components/WordCard";
import UsageChat from "@/components/UsageChat";
import WordOfTheDay from "@/components/WordOfTheDay";
import type { WordResult, UsageResult } from "@/lib/types";

export default function Home() {
  const [result, setResult] = useState<WordResult | null>(null);
  const [usage, setUsage] = useState<UsageResult | null>(null);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10 py-6 md:py-10">
        <Header />

        <div className="mt-6 rounded-3xl bg-white dark:bg-slate-800 shadow-md p-4 md:p-6">
          <SearchBox
            onResult={(r) => {
              setResult(r);
              setUsage(null);
            }}
          />

          {/* WOTD teaser */}
          <section className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Word of the Day
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Discover today’s highlighted word.
                </p>
              </div>
              <a
                className="btn-soft w-full sm:w-auto text-center"
                href="/wotd"
              >
                Open
              </a>
            </div>
          </section>
        </div>

        {result && (
          <div className="mt-6 space-y-6">
            <WordCard result={result} />
            <UsageChat
              word={result.word}
              meaningEn={result.meaningEn}
              onUsage={(u) => setUsage(u)}
              usage={usage}
            />
          </div>
        )}

        <footer className="mt-12 text-center text-sm text-slate-500 dark:text-slate-400">
          Built for educational purposes • Mobile-friendly • Free-tier aware
        </footer>
      </div>
    </main>
  );
}
