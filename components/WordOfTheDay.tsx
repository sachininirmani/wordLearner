"use client";

import { useEffect, useRef, useState } from "react";
import Loader from "@/components/Loader";
import { CalendarDays } from "lucide-react";
import type { WordResult } from "@/lib/types";

/* -------------------- Types -------------------- */

type WotdFile = {
  date: string;
  word: string;
  meaningEn: string;
  meaningSi: string;
  phonetic?: string | null;
  audio?: string | null;
  usage?: { en: string; si: string }[];
};

type WordOfTheDayProps = {
  autoLoad?: boolean;
  onLoadWord?: (word: WordResult) => void;
};

/* -------------------- Component -------------------- */

export default function WordOfTheDay({
  autoLoad = false,
  onLoadWord,
}: WordOfTheDayProps) {
  const [data, setData] = useState<WotdFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  async function toggleAudio() {
    if (!data?.audio) return;
    try {
      // If currently playing, stop it
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
        return;
      }

      // Create and play a new audio element
      const a = new Audio(data.audio);
      audioRef.current = a;
      await a.play();
      setIsPlaying(true);
      a.addEventListener("ended", () => setIsPlaying(false));
      a.addEventListener("pause", () => setIsPlaying(false));
    } catch {
      setIsPlaying(false);
    }
  }

  // Clean up audio on data change / unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
        setIsPlaying(false);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  async function load() {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/wotd.json", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load");

      const json = (await res.json()) as WotdFile;
      setData(json);

      /* ✅ Normalize WOTD → WordResult */
      onLoadWord?.({
        word: json.word,
        meaningEn: json.meaningEn,
        meaningSi: json.meaningSi,
        phonetic: json.phonetic,
        audio: json.audio,
        examplesEn: [],
        examplesSi: [],
        source: "Word of the Day",
      });
    } catch {
      setError("Could not load Word of the Day.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (autoLoad) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoad]);

  return (
    <section className="rounded-3xl bg-white dark:bg-slate-800 shadow-lg p-5 md:p-7 wotd-card">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-slate-700" />
          <h2 className="text-lg font-semibold">Word of the Day</h2>
        </div>

        <div className="flex items-center gap-2">
          <a className="btn-soft" href="/">
            Back
          </a>
          <button className="btn-soft" onClick={load} disabled={loading}>
            Refresh
          </button>
        </div>
      </div>

      <div className="mt-3 min-h-[24px]">
        {loading && <Loader label="Loading WOTD..." />}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      {data && (
        <div className="mt-4 space-y-4">
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">{data.date}</p>
              <p className="wotd-word text-4xl md:text-6xl">{data.word}</p>
            </div>
            <div className="flex items-center gap-3">
              {data.phonetic && <p className="text-sm text-slate-600">{data.phonetic}</p>}
              {data.audio && (
                <button
                  className="btn-soft"
                  onClick={toggleAudio}
                  aria-pressed={isPlaying}
                  aria-label={isPlaying ? "Stop pronunciation" : "Play pronunciation"}
                >
                  {isPlaying ? "⏹️ Stop" : "🔊 Play"}
                </button>
              )}
            </div>
          </div>

          <div className="wotd-meaning">
            <p className="font-medium">Meaning (EN)</p>
            <p className="mt-1 text-lg text-slate-800 dark:text-slate-100">{data.meaningEn}</p>

            <p className="mt-3 font-medium">අර්ථය (SI)</p>
            <p className="mt-1 text-lg sinhala text-slate-800 dark:text-slate-100">{data.meaningSi}</p>
          </div>


        </div>
      )}
    </section>
  );
}
