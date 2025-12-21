"use client";

import { Volume2 } from "lucide-react";

export default function Pronunciation({ phonetic, audio, word }: { phonetic?: string | null; audio?: string | null; word: string }) {
  const canPlay = Boolean(audio);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {phonetic && <span className="chip">IPA: {phonetic}</span>}
      <button
        type="button"
        className="btn-soft"
        disabled={!canPlay}
        onClick={() => {
          if (!audio) return;
          const a = new Audio(audio);
          a.play().catch(() => {});
        }}
        title={canPlay ? "Play pronunciation" : "Audio not available"}
      >
        <Volume2 className="h-4 w-4" />
        Pronounce
      </button>
      <span className="text-xs text-slate-500">{canPlay ? "Click to hear." : `No audio for "${word}".`}</span>
    </div>
  );
}
