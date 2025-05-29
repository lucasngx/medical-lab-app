import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Check for token in cookies
  const token = request.cookies.get("auth_token")?.value;
  
  // Check for token in Authorization header
  const authHeader = request.headers.get("Authorization");
  const hasAuthHeader = authHeader?.startsWith("Bearer ");
  
  const isAuthenticated = token || hasAuthHeader;
  const isAuthPage = request.nextUrl.pathname === "/login";
  const isUnauthorizedPage = request.nextUrl.pathname === "/unauthorized";

  // Skip auth check for API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated && !isAuthPage && !isUnauthorizedPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect authenticated users to dashboard
  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect root to dashboard
  if (request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
