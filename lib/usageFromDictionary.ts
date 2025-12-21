export type DictUsageResult = {
  partOfSpeech?: string;
  examples: string[];
};

export async function getUsageFromDictionary(
  word: string
): Promise<DictUsageResult | null> {
  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
    );

    if (!res.ok) return null;

    const json = await res.json();
    if (!Array.isArray(json) || json.length === 0) return null;

    const meanings = json[0]?.meanings;
    if (!Array.isArray(meanings) || meanings.length === 0) return null;

    const partOfSpeech = meanings[0]?.partOfSpeech;

    const examples: string[] = [];
    for (const m of meanings) {
      for (const d of m.definitions ?? []) {
        if (typeof d.example === "string") {
          examples.push(d.example);
        }
      }
    }

    return {
      partOfSpeech,
      examples: examples.slice(0, 3),
    };
  } catch {
    return null;
  }
}
