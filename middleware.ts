import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/auth/ip/get")) {
    // Get user's ip address
    const ip = (request.headers.get("x-forwarded-for") ?? "127.0.0.1").split(
      ","
    )[0];
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("client-ip-address", `${ip}`);
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    return response;
  }
}

// export const config = {
//   matcher: "/api/auth/ip-whitelist/get",
// };
