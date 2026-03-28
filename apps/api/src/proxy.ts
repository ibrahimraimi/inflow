import { type NextRequest, NextResponse } from "next/server";
import { TRUSTED_ORIGINS } from "@inflow/core/lib/auth";

export default function proxy(request: NextRequest) {
  const origin = request.headers.get("origin");
  const response = NextResponse.next();

  // If the origin is in our trusted list, we set the specific header
  // This allows credentials: 'include' to work correctly
  if (origin && TRUSTED_ORIGINS.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, Better-Auth-Client-Token, Better-Auth-Session");
  } else if (!origin) {
     // For non-browser requests (e.g. server-to-server), we can allow * safely
     // or just skip CORS headers.
  } else {
    // For other origins, we can allow * if no credentials are needed (like public SDK)
    // However, it's safer to only allow if necessary.
    // For now, let's keep it restrictive to trusted origins for security.
  }

  // Handle preflight (OPTIONS) requests
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: response.headers,
    });
  }

  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};
