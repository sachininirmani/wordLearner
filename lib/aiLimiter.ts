type DailyUsage = { count: number; dateKey: string };
type MinuteUsage = { count: number; minuteKey: string };
type Throttle = { lastAt: number };

export const MAX_AI_PER_IP_PER_DAY = Number(process.env.AI_MAX_PER_IP_PER_DAY ?? "5");
export const MAX_AI_GLOBAL_PER_DAY = Number(process.env.AI_MAX_GLOBAL_PER_DAY ?? "100");

// RPM (requests per minute) – keep small for free tier safety
export const MAX_AI_PER_IP_PER_MINUTE = Number(process.env.AI_MAX_PER_IP_PER_MINUTE ?? "2");

// Minimum gap between Gemini calls from same IP (ms)
export const MIN_AI_INTERVAL_MS = Number(process.env.AI_MIN_INTERVAL_MS ?? "15000");

const ipDaily = new Map<string, DailyUsage>();
let globalDaily: DailyUsage = { count: 0, dateKey: todayKeyUTC() };

const ipMinute = new Map<string, MinuteUsage>();
const ipThrottle = new Map<string, Throttle>();

function todayKeyUTC() {
  const d = new Date();
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function minuteKeyUTC() {
  const d = new Date();
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mi = String(d.getUTCMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function resetIfNewDay() {
  const key = todayKeyUTC();
  if (globalDaily.dateKey !== key) {
    globalDaily = { count: 0, dateKey: key };
    ipDaily.clear();
  }
}

function resetIfNewMinute(ip: string) {
  const key = minuteKeyUTC();
  const u = ipMinute.get(ip);
  if (!u || u.minuteKey !== key) {
    ipMinute.set(ip, { count: 0, minuteKey: key });
  }
}

export type AIGuard =
  | { ok: true }
  | { ok: false; reason: "daily_ip" | "daily_global" | "rpm_ip" | "throttle"; retryAfterMs?: number };

export function canUseAI(ip: string): AIGuard {
  resetIfNewDay();
  resetIfNewMinute(ip);

  // Global daily
  if (globalDaily.count >= MAX_AI_GLOBAL_PER_DAY) {
    return { ok: false, reason: "daily_global" };
  }

  // IP daily
  const d = ipDaily.get(ip);
  const ipCount = !d || d.dateKey !== globalDaily.dateKey ? 0 : d.count;
  if (ipCount >= MAX_AI_PER_IP_PER_DAY) {
    return { ok: false, reason: "daily_ip" };
  }

  // IP per-minute
  const m = ipMinute.get(ip)!;
  if (m.count >= MAX_AI_PER_IP_PER_MINUTE) {
    return { ok: false, reason: "rpm_ip", retryAfterMs: 60_000 };
  }

  // Minimum interval throttle
  const t = ipThrottle.get(ip);
  const now = Date.now();
  if (t && now - t.lastAt < MIN_AI_INTERVAL_MS) {
    return { ok: false, reason: "throttle", retryAfterMs: MIN_AI_INTERVAL_MS - (now - t.lastAt) };
  }

  return { ok: true };
}

export function recordAIUsage(ip: string) {
  resetIfNewDay();
  resetIfNewMinute(ip);

  globalDaily.count += 1;

  const current = ipDaily.get(ip);
  if (!current || current.dateKey !== globalDaily.dateKey) {
    ipDaily.set(ip, { count: 1, dateKey: globalDaily.dateKey });
  } else {
    current.count += 1;
    ipDaily.set(ip, current);
  }

  const min = ipMinute.get(ip)!;
  min.count += 1;
  ipMinute.set(ip, min);

  ipThrottle.set(ip, { lastAt: Date.now() });
}
