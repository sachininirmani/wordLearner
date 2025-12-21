export async function fetchFromFreeDictionary(word: string): Promise<{
  phonetic?: string | null;
  audio?: string | null;
  partOfSpeech?: string | null;
  meaningEn: string;
  examplesEn: string[];
}> {
  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Dictionary lookup failed");
  const data = await res.json();

  const entry = Array.isArray(data) ? data[0] : null;
  const phonetic = entry?.phonetic ?? null;

  let audio: string | null = null;
  if (Array.isArray(entry?.phonetics)) {
    for (const p of entry.phonetics) {
      if (p?.audio && typeof p.audio === "string" && p.audio.trim()) {
        audio = p.audio;
        break;
      }
    }
  }

  let partOfSpeech: string | null = null;
  let meaningEn = "";
  const examplesEn: string[] = [];

  const meanings = entry?.meanings;
  if (Array.isArray(meanings) && meanings.length > 0) {
    const m0 = meanings[0];
    partOfSpeech = m0?.partOfSpeech ?? null;
    const defs = m0?.definitions;
    if (Array.isArray(defs) && defs.length > 0) {
      meaningEn = String(defs[0]?.definition ?? "");
      for (const d of defs) {
        if (d?.example) examplesEn.push(String(d.example));
        if (examplesEn.length >= 2) break;
      }
    }
  }

  if (!meaningEn) meaningEn = "No definition found. Try another word.";
  return { phonetic, audio, partOfSpeech, meaningEn, examplesEn };
}
