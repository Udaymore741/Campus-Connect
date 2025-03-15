import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),
      login: async (email, password) => {
        try {
          set({ isLoading: true });
          // Replace with your actual API endpoint
          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            throw new Error("Login failed");
          }

          const user = await response.json();
          set({ user, isLoading: false });
          return user;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      logout: async () => {
        try {
          set({ isLoading: true });
          // Replace with your actual API endpoint
          await fetch("/api/auth/logout", {
            method: "POST",
          });
          set({ user: null, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      checkAuth: async () => {
        try {
          set({ isLoading: true });
          // Replace with your actual API endpoint
          const response = await fetch("/api/auth/me");
          if (!response.ok) {
            set({ user: null, isLoading: false });
            return null;
          }
          const user = await response.json();
          set({ user, isLoading: false });
          return user;
        } catch (error) {
          set({ user: null, isLoading: false });
          return null;
        }
      },
    }),
    {
      name: "auth-storage",
    }
  )
);

export const useAuth = () => {
  const store = useAuthStore();
  return {
    user: store.user,
    isLoading: store.isLoading,
    login: store.login,
    logout: store.logout,
    checkAuth: store.checkAuth,
  };
};

export default useAuth; 