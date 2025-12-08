// src/store/auth.store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import axiosInstance from "@/api/axiosInstance";

export type User = {
  id?: number;
  name?: string;
  employee_id?: string;
  // extend with other fields your backend returns
};

type AuthState = {
  user: User | null;
  access: string | null;
  refresh: string | null;

  isAuthenticated: () => boolean;

  login: (employee_id: string, password: string) => Promise<void>;
  logout: () => void;
  restoreSession: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      access: null,
      refresh: null,

      // isAuthenticated: () => {
      //   return !!get().access;
      // },
      isAuthenticated: () => {
        const access = get().access || localStorage.getItem("access");
        return !!access;
      },


      // Login: call backend, save tokens+user
      login: async (employee_id: string, password: string) => {
        const res = await axiosInstance.post("/auth/login/", {
          employee_id,
          password,
        });

        const { access, refresh, user } = res.data;

        // persist via zustand
        set({
          access,
          refresh,
          user,
        });

        // also keep legacy localStorage for axios interceptor compatibility
        try {
          localStorage.setItem("access", access);
          localStorage.setItem("refresh", refresh);
          localStorage.setItem("user", JSON.stringify(user));
        } catch {
          /* ignore storage errors */
        }
      },

      // Logout: clear store + localStorage
      logout: () => {
        set({ user: null, access: null, refresh: null });
        try {
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          localStorage.removeItem("user");
        } catch {
          /* ignore */
        }
      },

      // Restore session from localStorage (useful on app boot)
      restoreSession: () => {
        try {
          const access = localStorage.getItem("access");
          const refresh = localStorage.getItem("refresh");
          const userRaw = localStorage.getItem("user");

          if (access && refresh && userRaw) {
            set({
              access,
              refresh,
              user: JSON.parse(userRaw),
            });
          }
        } catch {
          // ignore parsing / storage errors
        }
      },
    }),
    {
      name: "auth-store", // key in localStorage
      partialize: (state) => ({ access: state.access, refresh: state.refresh, user: state.user }),
    }
  )
);
