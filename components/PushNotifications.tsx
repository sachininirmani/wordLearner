"use client";

import { useEffect, useMemo, useState } from "react";

type Status = "idle" | "unsupported" | "denied" | "granted";

export default function PushNotifications() {
  const [status, setStatus] = useState<Status>("idle");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const supported = useMemo(() => {
    return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
  }, []);

  useEffect(() => {
    if (!supported) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "denied") setStatus("denied");
    else if (Notification.permission === "granted") setStatus("granted");
    else setStatus("idle");
  }, [supported]);

  async function enable() {
    setMsg(null);
    if (!supported) return;

    setBusy(true);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setStatus(perm === "denied" ? "denied" : "idle");
        setMsg("Notifications not enabled.");
        return;
      }
      setStatus("granted");

      const reg = await navigator.serviceWorker.ready;

      const pkRes = await fetch("/api/push/public-key", { cache: "no-store" });
      const pkData = await pkRes.json();
      const publicKey = pkData?.publicKey as string | null;

      if (!publicKey) {
        setMsg("Push is not configured on the server yet.");
        return;
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub),
      });

      if (!res.ok) {
        setMsg("Failed to save subscription. Try again.");
        return;
      }

      setMsg("Push notifications enabled ✅");
    } catch {
      setMsg("Could not enable push notifications.");
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setMsg(null);
    if (!supported) return;

    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (!sub) {
        setMsg("No active subscription found.");
        return;
      }

      await fetch("/api/push/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub),
      }).catch(() => null);

      await sub.unsubscribe();
      setMsg("Push notifications disabled.");
    } catch {
      setMsg("Could not disable push notifications.");
    } finally {
      setBusy(false);
    }
  }

  if (status === "unsupported") {
    return (
      <div className="rounded-xl border border-slate-200 p-4 text-sm text-slate-700">
        Push notifications aren&apos;t supported in this browser/device.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-medium">Word of the Day push</p>
          <p className="text-sm text-slate-600">Get a daily notification for the Word of the Day.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-soft" onClick={enable} disabled={busy}>
            Enable
          </button>
          <button className="btn-soft" onClick={disable} disabled={busy}>
            Disable
          </button>
        </div>
      </div>
      {status === "denied" && (
        <p className="mt-2 text-sm text-amber-700">
          Notifications are blocked. Enable them from your browser settings.
        </p>
      )}
      {msg && <p className="mt-2 text-sm text-slate-700">{msg}</p>}
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
