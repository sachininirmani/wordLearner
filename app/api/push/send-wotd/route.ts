import webpush from "web-push";
import fs from "node:fs";
import path from "node:path";
import {
  getAllSubscriptions,
  removeSubscription,
} from "@/lib/subscriptionsStore";

function getWotd() {
  const p = path.join(process.cwd(), "public", "wotd.json");
  try {
    const raw = fs.readFileSync(p, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  // Optional auth so random callers can't spam notifications
  const secret = process.env.PUSH_CRON_SECRET?.trim();
  if (secret) {
    const provided =
      req.headers.get("x-push-secret") ||
      new URL(req.url).searchParams.get("secret");

    if (provided !== secret) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
  }

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim();
  const subject =
    process.env.VAPID_SUBJECT?.trim() || "mailto:admin@example.com";

  if (!publicKey || !privateKey) {
    return Response.json(
      { error: "Push not configured (missing VAPID keys)" },
      { status: 400 }
    );
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);

  const wotd = getWotd();
  const title = "Word of the Day";
  const body = wotd?.word
    ? `${wotd.word} — ${wotd.meaningEn ?? ""}`
    : "Open to see today's word.";

  const payload = JSON.stringify({
    title,
    body,
    url: "/wotd",
  });

  // IMPORTANT: await KV read
  const subs = await getAllSubscriptions();

  let sent = 0;
  let failed = 0;

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(sub as any, payload);
        sent += 1;
      } catch (e: any) {
        failed += 1;

        // Clean up dead subscriptions
        if (e?.statusCode === 410 || e?.statusCode === 404) {
          await removeSubscription(sub.endpoint);
        }
      }
    })
  );

  return Response.json({
    ok: true,
    total: subs.length,
    sent,
    failed,
  });
}
