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
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      setAuth: (user, token) => {
        Cookies.set("accessToken", token, { expires: 1 }); // expires in 1 day
        set({ user, accessToken: token });
      },
      logout: () => {
        Cookies.remove("accessToken");
        set({ user: null, accessToken: null });
      },
    }),
    {
      name: "auth-storage",
    },
  ),
);
