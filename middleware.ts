import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check for Firebase auth session cookie (set client-side, just presence check)
  // Full auth verification happens in the (app)/layout.tsx client component
  const sessionCookie =
    request.cookies.get("firebase-auth-token") ??
    request.cookies.get("__session");

  if (!sessionCookie) {
    // No cookie — could be first visit or not logged in
    // Allow through; AuthContext will redirect client-side if needed
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
