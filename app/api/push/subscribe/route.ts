import type { PushSubscriptionJSON } from "@/lib/subscriptionsStore";
import { addSubscription } from "@/lib/subscriptionsStore";

export async function POST(req: Request) {
  const sub = (await req.json().catch(() => null)) as PushSubscriptionJSON | null;
  if (!sub?.endpoint) return Response.json({ error: "Invalid subscription" }, { status: 400 });

  const out = addSubscription(sub);
  return Response.json(out);
}
