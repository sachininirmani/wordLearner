import type { PushSubscriptionJSON } from "@/lib/subscriptionsStore";
import { removeSubscription } from "@/lib/subscriptionsStore";

export async function POST(req: Request) {
  const sub = (await req.json().catch(() => null)) as PushSubscriptionJSON | null;
  if (!sub?.endpoint) return Response.json({ ok: true });

  const out = removeSubscription(sub);
  return Response.json(out);
}
