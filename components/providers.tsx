"use client";

import { Provider } from "react-redux";
import { store } from "@/lib/store/store";
import { useEffect } from "react";
import { restoreState, setLoading } from "@/lib/store/auth/authSlice";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedAuth = localStorage.getItem("auth");
        if (storedAuth) {
          const authState = JSON.parse(storedAuth);
          store.dispatch(restoreState(authState));
        }
      } catch (e) {
        console.error("Failed to parse stored auth state:", e);
      } finally {
        // Set loading to false after initialization
        store.dispatch(setLoading(false));
      }
    };

    initializeAuth();
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
