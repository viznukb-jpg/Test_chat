import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // TODO: Тут ми пізніше додамо логіку перевірки доступу
  // Наприклад: якщо юзер не має токена і намагається зайти на /chat, перенаправимо на /login
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
