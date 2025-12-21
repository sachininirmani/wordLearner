type Bucket = { count: number; dateKey: string };
const buckets = new Map<string, Bucket>();

function todayKeyUTC() {
  const d = new Date();
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function consumeDaily(key: string, maxPerDay: number): { ok: boolean; remaining: number } {
  const dateKey = todayKeyUTC();
  const current = buckets.get(key);

  if (!current || current.dateKey !== dateKey) {
    buckets.set(key, { count: 1, dateKey });
    return { ok: true, remaining: Math.max(0, maxPerDay - 1) };
  }

  if (current.count >= maxPerDay) return { ok: false, remaining: 0 };

  current.count += 1;
  buckets.set(key, current);
  return { ok: true, remaining: Math.max(0, maxPerDay - current.count) };
}
