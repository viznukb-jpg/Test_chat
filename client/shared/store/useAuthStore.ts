import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";

interface User {
  id: string;
  email: string;
  username: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (user: User, token: string, refreshToken?: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setAuth: (user, token, refreshToken) => {
        Cookies.set("accessToken", token, { expires: 1 });
        if (refreshToken) {
          Cookies.set("refreshToken", refreshToken, { expires: 7 });
        }
        set({ user, accessToken: token, refreshToken: refreshToken || null });
      },
      logout: () => {
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        set({ user: null, accessToken: null, refreshToken: null });
      },
    }),
    {
      name: "auth-storage",
    },
  ),
);
