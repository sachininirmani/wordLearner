import { getCache, setCache } from "@/lib/cache";
import { fetchFromFreeDictionary } from "@/lib/dictionary";
import { translateEnToSi } from "@/lib/translate";
import type { WordResult } from "@/lib/types";

const TTL_7_DAYS = 7 * 24 * 60 * 60 * 1000;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("word")?.trim().toLowerCase();

  if (!raw) return Response.json({ error: "Missing word" }, { status: 400 });

  const key = `define:${raw}`;
  const cached = getCache<WordResult>(key);
  if (cached) return Response.json({ ...cached, source: "cache" });

  try {
    const dict = await fetchFromFreeDictionary(raw);
    const meaningSi = await translateEnToSi(dict.meaningEn);

    const examplesEn = dict.examplesEn ?? [];
    const examplesSi: string[] = [];
    for (const ex of examplesEn) {
      examplesSi.push(await translateEnToSi(ex));
    }

    const out: WordResult = {
      word: raw,
      phonetic: dict.phonetic ?? null,
      audio: dict.audio ?? null,
      partOfSpeech: dict.partOfSpeech ?? null,
      meaningEn: dict.meaningEn,
      meaningSi,
      examplesEn,
      examplesSi,
      source: "dictionaryapi"
    };

    setCache(key, out, TTL_7_DAYS);
    return Response.json(out);
  } catch (e: any) {
    return Response.json({ error: "Failed to fetch definition. Try another word." }, { status: 500 });
  }
}
