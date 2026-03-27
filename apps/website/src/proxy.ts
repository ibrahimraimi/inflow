import { type NextRequest, NextResponse } from "next/server";
import siteConfig from "@inflow/core/configs/site";

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Paths that should be handled by the dashboard app
  const dashboardPaths = ["/dashboard", "/login", "/signup", "/forgot-password"];
  
  if (dashboardPaths.some(path => pathname.startsWith(path))) {
    // Redirect to the dashboard app, preserving search params
    const url = new URL(pathname + request.nextUrl.search, siteConfig.dashboardUrl);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup", "/forgot-password"],
};
