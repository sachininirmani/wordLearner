import { NextRequest, NextResponse } from "next/server";
import { generateUsage } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const { word, meaningEn } = await req.json();

    if (!word || typeof word !== "string") {
      return NextResponse.json(
        { error: "Invalid word" },
        { status: 400 }
      );
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const result = await generateUsage(word, meaningEn, ip);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Usage generation failed" },
      { status: 500 }
    );
  }
}
