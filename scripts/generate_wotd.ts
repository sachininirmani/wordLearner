import fs from "node:fs";
import path from "node:path";

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

function pickWord() {
  const words = ["resilient","curious","gentle","focus","improve","proud","brave","patient","respect","honest","creative","simple"];
  const d = new Date();
  const idx = (d.getUTCFullYear() + (d.getUTCMonth() + 1) * 31 + d.getUTCDate()) % words.length;
  return words[idx];
}

async function main() {
  const word = pickWord();
  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
  const data = await fetchJson(url);
  const entry = Array.isArray(data) ? data[0] : null;

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
  if (!meaningEn) meaningEn = `A useful English word: "${word}".`;

  const meaningSi = await translateEnToSi(meaningEn);

  const usageEn = [
    `I am learning the word "${word}" today.`,
    `Can you use "${word}" in a sentence?`,
    `This word "${word}" is useful in daily English.`
  ];
  const usage = [];
  for (const en of usageEn) usage.push({ en, si: await translateEnToSi(en) });

  const out = { date: new Date().toISOString().slice(0, 10), word, meaningEn, meaningSi, phonetic, audio, usage };

  const target = path.join(process.cwd(), "public", "wotd.json");
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, JSON.stringify(out, null, 2), "utf-8");
  console.log("WOTD generated:", out.word, out.date);
}

main().catch((e) => { console.error(e); process.exit(1); });
