/**
 * Translation strategy:
 * - If TRANSLATE_ENDPOINT is set, call LibreTranslate-compatible endpoint.
 * - Otherwise use MyMemory public endpoint (free) for EN->SI.
 */
export async function translateEnToSi(text: string): Promise<string> {
  const endpoint = process.env.TRANSLATE_ENDPOINT?.trim();

  if (endpoint) {
    const res = await fetch(`${endpoint.replace(/\/$/, "")}/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: text, source: "en", target: "si", format: "text" }),
      cache: "no-store"
    });
    if (!res.ok) return fallback(text);
    const data = await res.json();
    const out = data?.translatedText;
    return typeof out === "string" && out.trim() ? out : fallback(text);
  }

  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|si`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return fallback(text);
  const data = await res.json();
  const out = data?.responseData?.translatedText;
  return typeof out === "string" && out.trim() ? out : fallback(text);
}

function fallback(text: string) {
  return `(${text})`;
}
