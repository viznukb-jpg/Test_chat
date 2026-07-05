import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')?.value;

  // Protect /chat routes
  if (request.nextUrl.pathname.startsWith('/chat')) {
    if (!accessToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const secret = process.env.JWT_ACCESS_SECRET;
      if (!secret) {
        console.error('JWT_ACCESS_SECRET is not defined in environment');
        return NextResponse.redirect(new URL('/login', request.url));
      }

      await jwtVerify(accessToken, new TextEncoder().encode(secret));
    } catch {
      // Token is expired or invalid
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Apply middleware to all routes except api, _next/static, _next/image, and favicon
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
