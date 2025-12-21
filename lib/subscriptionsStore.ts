import fs from "node:fs";
import path from "node:path";

export type PushSubscriptionJSON = {
  endpoint: string;
  keys?: { p256dh?: string; auth?: string };
  expirationTime?: number | null;
};

function resolveStorePath() {
  // Prefer repo data folder for local dev.
  const preferred = path.join(process.cwd(), "data", "subscriptions.json");
  try {
    fs.mkdirSync(path.dirname(preferred), { recursive: true });
    if (!fs.existsSync(preferred)) fs.writeFileSync(preferred, "[]", "utf-8");
    return preferred;
  } catch {
    // Serverless-friendly fallback
    const fallback = path.join("/tmp", "subscriptions.json");
    try {
      if (!fs.existsSync(fallback)) fs.writeFileSync(fallback, "[]", "utf-8");
    } catch {}
    return fallback;
  }
}

const STORE_PATH = resolveStorePath();

function readAll(): PushSubscriptionJSON[] {
  try {
    const raw = fs.readFileSync(STORE_PATH, "utf-8");
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as PushSubscriptionJSON[]) : [];
  } catch {
    return [];
  }
}

function writeAll(list: PushSubscriptionJSON[]) {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(list, null, 2), "utf-8");
  } catch {
    // ignore
  }
}

export function addSubscription(sub: PushSubscriptionJSON) {
  const list = readAll();
  const exists = list.some((s) => s.endpoint === sub.endpoint);
  if (!exists) {
    list.push(sub);
    writeAll(list);
  }
  return { ok: true, count: list.length };
}

export function removeSubscription(sub: PushSubscriptionJSON) {
  const list = readAll().filter((s) => s.endpoint !== sub.endpoint);
  writeAll(list);
  return { ok: true, count: list.length };
}

export function getAllSubscriptions() {
  return readAll();
}
