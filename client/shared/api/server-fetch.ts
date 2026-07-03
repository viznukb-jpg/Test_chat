import { cookies } from 'next/headers';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function serverFetch(endpoint: string, options: RequestInit = {}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  const refreshToken = cookieStore.get('refreshToken')?.value;

  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  // Forward httpOnly cookies to the backend via Cookie header
  // (server-side fetch doesn't send browser cookies automatically)
  const cookieParts: string[] = [];
  if (accessToken) cookieParts.push(`accessToken=${accessToken}`);
  if (refreshToken) cookieParts.push(`refreshToken=${refreshToken}`);
  if (cookieParts.length > 0) {
    headers.set('Cookie', cookieParts.join('; '));
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${endpoint}: ${res.statusText}`);
  }

  return res.json();
}
