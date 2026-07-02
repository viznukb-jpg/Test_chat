import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function middleware(request: NextRequest) {
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Застосовуємо middleware до всіх шляхів, окрім:
     * - api (API роути)
     * - _next/static (статичні файли)
     * - _next/image (оптимізовані зображення)
     * - favicon.ico
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
