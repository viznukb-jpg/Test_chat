'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/shared/store/useAuthStore';

export function AuthHydrator() {
  const setUser = useAuthStore((state) => state.setUser);
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;

    // Use native fetch to avoid axios interceptors redirecting to /login
    // if the user is not authenticated.
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    fetch(`${API_URL}/auth/me`, {
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then((user: { id: string; email: string; username: string }) => setUser(user))
      .catch(() => {
        // Silently fail if not authenticated
        // The axios interceptor handles global logouts when needed
      });
  }, [setUser]);

  return null;
}
