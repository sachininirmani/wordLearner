import { kv } from "@vercel/kv";

export interface PushSubscriptionJSON {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * Store each subscription using its endpoint as the key.
 * Key format: push:sub:<endpoint>
 */

function keyFor(endpoint: string) {
  return `push:sub:${endpoint}`;
}

export async function addSubscription(sub: PushSubscriptionJSON) {
  await kv.set(keyFor(sub.endpoint), sub);
}

export async function getAllSubscriptions(): Promise<PushSubscriptionJSON[]> {
  const keys = await kv.keys("push:sub:*");
  if (keys.length === 0) return [];

  const subs = await kv.mget<PushSubscriptionJSON[]>(...keys);
  return subs.filter(Boolean) as PushSubscriptionJSON[];
}

export async function removeSubscription(endpoint: string) {
  await kv.del(keyFor(endpoint));
}
