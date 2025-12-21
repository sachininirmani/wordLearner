import Pronunciation from "@/components/Pronunciation";
import type { WordResult } from "@/lib/types";

export default function WordCard({ result }: { result: WordResult }) {
  return (
    <section className="rounded-3xl bg-white dark:bg-slate-800 shadow-lg p-5 md:p-7">
      <div className="flex flex-col gap-4">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white capitalize">
          {result.word}
        </h2>

        <div className="flex flex-wrap gap-2">
          {result.partOfSpeech && (
            <span className="chip">Part of speech: {result.partOfSpeech}</span>
          )}
          <span className="chip">Source: {result.source}</span>
        </div>

        <Pronunciation
          phonetic={result.phonetic}
          audio={result.audio}
          word={result.word}
        />

        <div className="grid gap-4 md:grid-cols-2 mt-4">
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 p-4">
            <h3 className="font-semibold text-lg">Meaning (English)</h3>
            <p className="mt-2 text-lg text-slate-700 dark:text-slate-300">
              {result.meaningEn}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 p-4">
            <h3 className="font-semibold text-lg sinhala">සිංහල අර්ථය</h3>
            <p className="mt-2 text-lg text-slate-700 dark:text-slate-300 sinhala">
              {result.meaningSi}
            </p>
          </div>
        </div>

        {(result.examplesEn.length > 0 || result.examplesSi.length > 0) && (
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 p-4 mt-4">
            <h3 className="font-semibold text-lg">Examples</h3>
            <div className="grid gap-4 md:grid-cols-2 mt-3">
              <ul className="list-disc pl-5 text-slate-700 dark:text-slate-300">
                {result.examplesEn.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
              <ul className="list-disc pl-5 text-slate-700 dark:text-slate-300 sinhala">
                {result.examplesSi.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
