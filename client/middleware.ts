import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  // If no accessToken but we have refreshToken, try to refresh via backend
  if (!accessToken && refreshToken) {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `refreshToken=${refreshToken}`,
        },
      });

      if (res.ok) {
        // Redirect to the exact same URL so the Server Components will reload with the new cookies
        const response = NextResponse.redirect(request.url);
        
        // Extract Set-Cookie headers from backend response and forward to browser
        const setCookieHeaders = res.headers.getSetCookie();
        for (const cookie of setCookieHeaders) {
          response.headers.append('Set-Cookie', cookie);
        }
        
        return response;
      }
    } catch (e) {
      console.error('Middleware refresh failed:', e);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Apply middleware to all routes except api, _next/static, _next/image, and favicon
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
