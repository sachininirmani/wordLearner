import { GoogleGenAI } from "@google/genai";
import type { UsagePair } from "./types";

const DEBUG = process.env.DEBUG_AI === "1";

function dbg(...args: any[]) {
  if (DEBUG) console.log("[gemini.ts]", ...args);
}

export async function generateUsageWithGemini(
  word: string,
  meaningEn?: string
): Promise<UsagePair[]> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error("GEMINI_API_KEY missing");

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
Return EXACTLY 3 short, natural English sentences using the word "${word}".

Rules:
- Declarative only
- No instructions
- No explanations
- Simple English (A2–B1)

Return ONLY a JSON array of 3 strings.
`.trim();

  dbg("PROMPT:", prompt);

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  const text = response.text;
  dbg("RAW:", text);
  if (!text) {
    throw new Error("Gemini returned no text");
  }

  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed)) {
    throw new Error("Gemini did not return an array");
  }

  return parsed.slice(0, 3).map((s) => ({
    en: String(s),
    si: "",
  }));
}
