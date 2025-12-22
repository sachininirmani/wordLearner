import type { PushSubscriptionJSON } from "@/lib/subscriptionsStore";
import { removeSubscription } from "@/lib/subscriptionsStore";

export async function POST(req: Request) {
  const sub = (await req.json().catch(() => null)) as PushSubscriptionJSON | null;
  if (!sub?.endpoint) return Response.json({ ok: true });

  await removeSubscription(sub.endpoint);
  return Response.json({ ok: true });
}
