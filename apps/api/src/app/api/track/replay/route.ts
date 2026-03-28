import { type NextRequest, NextResponse } from "next/server";

import { logger } from "@inflow/logger";
import { rateLimit } from "@inflow/cache";
import { trackReplaySchema } from "@inflow/core/lib/validations/track";
import { ReplayService } from "@inflow/core/server/services/replay.service";

const CORS_HEADERS = (req: NextRequest) => {
  const origin = req.headers.get("origin") || "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  };
};

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 200, headers: CORS_HEADERS(req) });
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
        { status: 429, headers: CORS_HEADERS(req) }
      );
    }

    const bodyJson = await req.json();
    const validation = trackReplaySchema.safeParse(bodyJson);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validation.error.format() },
        { status: 400, headers: CORS_HEADERS(req) }
      );
    }

    const result = await ReplayService.saveEvents(validation.data);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500, headers: CORS_HEADERS(req) }
      );
    }

    return NextResponse.json({
      message: "Replay data received",
    }, { headers: CORS_HEADERS(req) });
  } catch (error) {
    logger.error({ err: error }, "Replay Tracking Error");
    return NextResponse.json(
      { error: "Internal Server Error", message: error instanceof Error ? error.message : String(error) },
      { status: 500, headers: CORS_HEADERS(req) }
    );
  }
}
