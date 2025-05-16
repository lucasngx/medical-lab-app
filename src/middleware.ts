import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname;

  // Check if this is a protected route
  const isProtectedRoute = !path.includes('/login');
    // Development bypass - allow all routes
  if (path === '/login') {
    return NextResponse.next();
  }
  return NextResponse.next();

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    // Add routes that should be protected
    '/dashboard/:path*',
    '/patients/:path*',
    '/doctors/:path*',
    '/examinations/:path*',
    '/prescriptions/:path*',
    '/lab-tests/:path*',
    '/test-results/:path*',
    '/medications/:path*',
    '/technicians/:path*',
    '/login'
  ],
};
