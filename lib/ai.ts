import type { UsagePair } from "./types";
import { translateEnToSi } from "./translate";
import { generateUsageWithGemini } from "./gemini";
import { canUseAI, recordAIUsage } from "./aiLimiter";
import { getUsageFromDictionary } from "./usageFromDictionary";
import { demoSentencesByPOS } from "./demoSentences";

export async function generateUsage(
  word: string,
  meaningEn: string | undefined,
  ip: string
): Promise<{
  mode: "dictionary" | "ai" | "demo";
  pairs: UsagePair[];
}> {
  // 1️⃣ Dictionary first (FREE)
  const dict = await getUsageFromDictionary(word);
  if (dict && dict.examples.length > 0) {
    const pairs = await translate(dict.examples);
    return { mode: "dictionary", pairs };
  }

  // 2️⃣ AI second (if allowed)
  if (process.env.GEMINI_API_KEY?.trim()) {
    const guard = canUseAI(ip);
    if (guard.ok) {
      try {
        const aiPairs = await generateUsageWithGemini(word, meaningEn);
        recordAIUsage(ip);
        return { mode: "ai", pairs: aiPairs };
      } catch {
        // fall through to demo
      }
    }
  }

  // 3️⃣ Demo fallback (POS-aware)
  const demoSentences = demoSentencesByPOS(
    word,
    dict?.partOfSpeech
  );

  const pairs = await translate(demoSentences);
  return { mode: "demo", pairs };
}

async function translate(sentences: string[]): Promise<UsagePair[]> {
  const out: UsagePair[] = [];
  for (const en of sentences.slice(0, 3)) {
    const si = await translateEnToSi(en);
    out.push({ en, si });
  }
  return out;
}
