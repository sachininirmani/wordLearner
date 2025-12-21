export async function fetchSuggestions(q: string): Promise<string[]> {
  const url = `https://api.datamuse.com/sug?s=${encodeURIComponent(q)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data.slice(0, 8).map((x: any) => String(x.word)).filter(Boolean);
}
