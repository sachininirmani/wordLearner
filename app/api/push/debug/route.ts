import { NextResponse } from "next/server";
import { getAllSubscriptions } from "@/lib/subscriptionsStore";

const DEBUG = process.env.DEBUG_AI === "1";

export async function GET() {
  // Hide this endpoint unless debug mode is enabled
  if (!DEBUG) {
    return NextResponse.json(
      { error: "Not found" },
      { status: 404 }
    );
  }

  const subs = await getAllSubscriptions();

  return NextResponse.json({
    total: subs.length,
    endpoints: subs.map((s) => s.endpoint),
  });
}
