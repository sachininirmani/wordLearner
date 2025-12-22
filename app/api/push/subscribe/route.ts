import type { PushSubscriptionJSON } from "@/lib/subscriptionsStore";
import { addSubscription } from "@/lib/subscriptionsStore";

export async function POST(req: Request) {
  const sub = (await req.json().catch(() => null)) as PushSubscriptionJSON | null;

  if (!sub?.endpoint) {
    return Response.json(
      { error: "Invalid subscription" },
      { status: 400 }
    );
  }

  // IMPORTANT: await because KV is async
  await addSubscription(sub);

  return Response.json({ ok: true });
}
