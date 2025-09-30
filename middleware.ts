import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { get } from "@vercel/edge-config";

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const isInMaintenanceMode = await get("isInMaintenanceMode");

  // If NOT in maintenance mode, just allow everything
  if (!isInMaintenanceMode) {
    if (url.pathname.startsWith("/api/auth/ip/get")) {
      const ip = (request.headers.get("x-forwarded-for") ?? "127.0.0.1").split(
        ","
      )[0];
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("client-ip-address", `${ip}`);
      return NextResponse.next({
        request: { headers: requestHeaders },
      });
    }

    return NextResponse.next();
  }

  const allowed = ["/api/auth/session-alive", "/api/auth/logout"];
  // 🚧 Maintenance mode active
  // Don’t block maintenance page, Next.js assets, or whitelisted routes
  if (
    url.pathname.startsWith("/maintenance") ||
    url.pathname.startsWith("/_next") ||
    allowed.some((route) => url.pathname.startsWith(route))
  ) {
    return NextResponse.next();
  }

  // Otherwise, rewrite everything to the maintenance page
  return NextResponse.rewrite(new URL("/maintenance", request.url));
}

// export const config = {
//   matcher: "/api/auth/ip-whitelist/get",
// };
