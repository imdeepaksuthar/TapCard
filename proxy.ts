import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Next.js 16 "proxy" convention (the renamed successor to "middleware").
// Server-side guard for the dashboard — runs before the page renders.
export function proxy(request: NextRequest) {
  const token = request.cookies.get('card-setu-token')?.value;
  const { pathname } = request.nextUrl;

  // Bounce unauthenticated users away from the dashboard.
  if (pathname.startsWith('/dashboard') && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
