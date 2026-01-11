"use client";

import dynamic from "next/dynamic";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/lib/store/store";
import { useEffect } from "react";
import { setCredentials, logout } from "@/lib/store/auth/authSlice";
import { ToastProvider } from "@heroui/toast";
import axios from "axios";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { useDispatch } from "react-redux";

// ThemeProvider hanya dijalankan di client
const ThemeProvider = dynamic(
  () => import("next-themes").then((mod) => mod.ThemeProvider),
  { ssr: false }
);

function AuthInitializer() {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();

  // Tentukan halaman mana yang memerlukan otentikasi
  const requiresAuth =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/provider") ||
    pathname?.startsWith("/customer/orders") ||
    pathname === "/customer/become-provider";

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const response = await axios.get("/api/auth/check");
        const { authenticated, token, user } = response.data;

        if (authenticated && token && user) {
          dispatch(setCredentials({ token, user }));
        } else {
          // Clear client-side cookies and Redux state
          Cookies.remove("token", { path: "/" });
          Cookies.remove("user", { path: "/" });
          dispatch(logout());

          // Redirect ke login HANYA jika halaman memerlukan otentikasi
          if (requiresAuth) {
            router.push("/login");
          }
        }
      } catch (error) {
        // Clear client-side cookies
        Cookies.remove("token", { path: "/" });
        Cookies.remove("user", { path: "/" });

        // Dispatch logout to clean Redux state and localStorage
        dispatch(logout());

        // Redirect ke login HANYA jika halaman memerlukan otentikasi
        if (requiresAuth) {
          router.push("/login");
        }
      }
    };

    initializeAuth();

    // Pasang interceptor untuk menangani expired token (401)
    const interceptorId = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error.response?.status;
        if (status === 401) {
          // Hapus cookie
          Cookies.remove("token", { path: "/" });
          Cookies.remove("user", { path: "/" });

          // Dispatch logout to clean Redux state and localStorage
          dispatch(logout());

          // Redirect ke login HANYA jika halaman memerlukan otentikasi
          if (requiresAuth) {
            router.replace("/login");
          }
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptor saat unmount
    return () => {
      axios.interceptors.response.eject(interceptorId);
    };
  }, [dispatch, router, pathname, requiresAuth]);

  return null;
}

export function RootProvider({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider store={store}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        forcedTheme="light"
      >
        <AuthInitializer />
        <ToastProvider />
        {children}
      </ThemeProvider>
    </ReduxProvider>
  );
}
