import { type NextRequest, NextResponse } from "next/server";
import { trackReplaySchema } from "@/lib/validations/track";
import { rateLimit } from "@/lib/rate-limit";
import { ReplayService } from "@/server/services/replay.service";

export const runtime = "edge";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const ratelimit = await rateLimit(ip, 50, 60 * 1000, "replay-api"); // 50 requests per minute

    if (!ratelimit.success) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: CORS_HEADERS }
      );
    }

    const bodyJson = await req.json();
    const validation = trackReplaySchema.safeParse(bodyJson);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validation.error.format() },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const result = await ReplayService.saveEvents(validation.data);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500, headers: CORS_HEADERS }
      );
    }

    return NextResponse.json({
      message: "Replay data received",
    }, { headers: CORS_HEADERS });
  } catch (error) {
    console.error("Replay Tracking Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
