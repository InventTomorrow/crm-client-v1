import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes reachable without a session. Everything else requires the refresh
// token cookie — checking that (not accessToken) since it survives the
// short-lived access token's expiry, so it's the true "signed in" signal.
const PUBLIC_PREFIXES = ["/auth", "/checkout"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/" || PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  if (!request.cookies.has("refreshToken")) {
    const loginUrl = new URL("/auth/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico|webp)$).*)"],
};
