import fs from "node:fs";
import path from "node:path";
import { randomInt } from "node:crypto";

async function fetchJson(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Fetch failed: ${url}`);
  return res.json();
}

async function translateEnToSi(text: string): Promise<string> {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|si`;
  try {
    const data = await fetchJson(url);
    const out = data?.responseData?.translatedText;
    return typeof out === "string" && out.trim() ? out : `(${text})`;
  } catch {
    return `(${text})`;
  }
}

function loadLocalWords(): string[] {
  const p = path.join(process.cwd(), "data", "words_alpha.txt");
  try {
    const raw = fs.readFileSync(p, "utf-8");
    const arr = raw.split(/\r?\n/).map((s) => s.trim().toLowerCase()).filter(Boolean);
    // Keep only alphabetic words of reasonable length
    return arr.filter((w) => /^[a-z]+$/.test(w) && w.length >= 3);
  } catch {
    return [];
  }
}

function pickWord() {
  const list = loadLocalWords();
  if (list.length > 0) return list[randomInt(0, list.length)];

  const fallback = ["resilient","curious","gentle","focus","improve","proud","brave","patient","respect","honest","creative","simple"];
  return fallback[randomInt(0, fallback.length)];
}

async function main() {
  const maxAttempts = 6;
  let chosenWord = "";
  let entry: any = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidate = pickWord().toLowerCase();
    try {
      const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(candidate)}`;
      const data = await fetchJson(url);
      const e = Array.isArray(data) ? data[0] : null;
      const meanings = e?.meanings;
      const defs = Array.isArray(meanings) && meanings.length > 0 ? (meanings[0]?.definitions ?? []) : [];
      if (Array.isArray(defs) && defs.length > 0) {
        chosenWord = candidate;
        entry = e;
        break;
      }
    } catch {
      // ignore and try another word
    }
  }

  if (!chosenWord) {
    // As a fallback, pick once and try to fetch (use the last candidate)
    chosenWord = pickWord().toLowerCase();
    try {
      const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(chosenWord)}`;
      const data = await fetchJson(url);
      entry = Array.isArray(data) ? data[0] : null;
    } catch {
      entry = null;
    }
  }

  const phonetic = entry?.phonetic ?? null;
  let audio: string | null = null;
  if (Array.isArray(entry?.phonetics)) {
    for (const p of entry.phonetics) {
      if (p?.audio && typeof p.audio === "string" && p.audio.trim()) { audio = p.audio; break; }
    }
  }

  let meaningEn = "";
  const meanings = entry?.meanings;
  if (Array.isArray(meanings) && meanings.length > 0) {
    const defs = meanings[0]?.definitions;
    if (Array.isArray(defs) && defs.length > 0) meaningEn = String(defs[0]?.definition ?? "");
  }
  if (!meaningEn) meaningEn = `A useful English word: "${chosenWord}".`;

  const meaningSi = await translateEnToSi(meaningEn);

  const usageEn = [
    `I am learning the word "${chosenWord}" today.`,
    `Can you use "${chosenWord}" in a sentence?`,
    `This word "${chosenWord}" is useful in daily English.`
  ];
  const usage = [];
  for (const en of usageEn) usage.push({ en, si: await translateEnToSi(en) });

  const out = { date: new Date().toISOString().slice(0, 10), word: chosenWord, meaningEn, meaningSi, phonetic, audio, usage };

  const target = path.join(process.cwd(), "public", "wotd.json");
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, JSON.stringify(out, null, 2), "utf-8");
  console.log("WOTD generated:", out.word, out.date);
}

main().catch((e) => { console.error(e); process.exit(1); });
