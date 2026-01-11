"use client";

import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/lib/store/auth/authSlice";
import type { RootState } from "@/lib/store/store";
import { Card } from "@heroui/card";
import { Button } from "@heroui/button";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Spinner } from "@heroui/spinner";
import { useState, useEffect, createContext } from "react";
import Footer from "@/components/footer";
import { useAuthData } from "@/hooks/useAuthData";
import axios from "axios";
import {
  RefreshCw,
  LayoutDashboard,
  LogOut,
  LogIn,
  Clock,
  Settings,
} from "lucide-react";

// Create a context for PPN value similar to AdminSettingsContext
export const CustomerSettingsContext = createContext<{
  ppn: number | null;
  settings: any | null;
}>({
  ppn: null,
  settings: null,
});

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<any>(null);
  const [ppn, setPpn] = useState<number | null>(null);
  const [isMaintenance, setIsMaintenance] = useState<boolean>(false);
  const dispatch = useDispatch();

  // Check for stored maintenance status immediately
  const storedMaintenance =
    typeof window !== "undefined"
      ? localStorage.getItem("isMaintenance")
      : null;

  // Add useAuthData hook to get user information - this is not required for the maintenance page
  const { user, isAdmin } = useAuthData();
  useEffect(() => {
    // First, check if we already know this is a maintenance mode from localStorage
    if (storedMaintenance === "true") {
      setIsMaintenance(true);
    }

    // Fetch settings and PPN data
    const fetchSettings = async () => {
      try {
        // Use no-cache option to ensure we always get fresh data about maintenance status
        const response = await fetch("/api/setting", { cache: "no-store" });
        const data = await response.json();
        setSettings(data);

        if (data.status === "ok") {
          if (data.data?.ppn) {
            setPpn(data.data.ppn);
          }
          // Store maintenance status in localStorage to persist it
          localStorage.setItem("isMaintenance", "false");
          setIsMaintenance(false); // Not in maintenance if status is "ok"
        } else if (
          data.status === "error" &&
          data.message === "Server is under maintenance"
        ) {
          // Store maintenance status in localStorage to persist it
          localStorage.setItem("isMaintenance", "true");
          setIsMaintenance(true); // In maintenance if we get this specific error
        } else if (data.status === "error" && data.requiresAuth === true) {
          // This is not a maintenance error but an auth error
          // Don't set maintenance mode, but we still need to update loading state
          localStorage.setItem("isMaintenance", "false");
          setIsMaintenance(false);
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);

        // Check if the error is due to a network issue, which could indicate
        // the backend is down (potential maintenance situation)
        if (!navigator.onLine || error instanceof TypeError) {
          localStorage.setItem("isMaintenance", "true");
          setIsMaintenance(true);
        }
      } finally {
        // Always stop the loading state after fetch attempt completes
        setIsLoading(false);
      }
    };

    fetchSettings();

    // Log maintenance status
    console.log("Initial maintenance status:", storedMaintenance === "true");
  }, [storedMaintenance]);

  // Add router for navigation and hooks need to be at the top level
  const router = useRouter();

  // Handle login/logout functions
  const handleLogin = () => {
    router.push("/login");
  };

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout");

      // Clear all storage locations
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("isMaintenance"); // Also clear maintenance status
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");

      // Clear cookies on client side
      document.cookie =
        "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      // Update Redux state
      dispatch(logout());

      // Force a hard refresh to ensure all state is cleared
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
      // Even if the API call fails, still clear local state and redirect
      dispatch(logout());
      window.location.href = "/login";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isMaintenance) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 relative">
        {/* Enhanced Tech-themed Geometric Background */}
        <div className="fixed inset-0 z-0">
          {/* Base Circuit Board Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTI1IDAgTDI1IDEwMCBNNTAgMCBMNTAgMTAwIE03NSAwIEw3NSAxMDAiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIxIiBzdHJva2Utb3BhY2l0eT0iMC4wNCIvPjxwYXRoIGQ9Ik0wIDI1IEwxMDAgMjUgTTAgNTAgTDEwMCA1MCBNMCA3NSBMMTA3NSA3NSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZS1vcGFjaXR5PSIwLjA0Ii8+PC9zdmc+')] opacity-70"></div>

          {/* Tech Hexagon Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTMwLDUyLjVMNTIuNSw2MEw3NSw1Mi41TDc1LDM3LjVMNTIuNSwzMEwzMCwzNy41WiIgc3Ryb2tlPSIjMDAwMGZmIiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTEwNSw5MEwxMjcuNSw5Ny41TDE1MCw5MEwxNTAsNzVMMTI3LjUsNjcuNUwxMDUsNzVaIiBzdHJva2U9IiMwMDAwZmYiIHN0cm9rZS13aWR0aD0iMSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMTgwLDUyLjVMMjAyLjUsNjBMMjI1LDUyLjVMMjI1LDM3LjVMMjAyLjUsMzBMMTgwLDM3LjVaIiBzdHJva2U9IiMwMDAwZmYiIHN0cm9rZS13aWR0aD0iMSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMzAsNjdMMTIwLDMyIiBzdHJva2U9IiMwMDg4ZmYiIHN0cm9rZS13aWR0aD0iMSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDgiLz48L3N2Zz4=')] opacity-80"></div>

          {/* Colored Background Elements */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-500/20 to-cyan-500/5 dark:from-blue-800/20 dark:to-cyan-800/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-gradient-to-tr from-indigo-500/10 to-sky-500/5 dark:from-indigo-900/20 dark:to-sky-900/5 rounded-full blur-3xl"></div>

          {/* Circuit Board Nodes */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Digital Processing Centers */}
            <div className="absolute top-[15%] left-[20%]">
              <div className="w-16 h-16 rounded-lg border border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-100/30 to-cyan-100/20 dark:from-blue-900/30 dark:to-cyan-900/20 backdrop-blur-sm"></div>
              <div className="absolute top-4 left-4 w-8 h-8 rounded-md border border-blue-300 dark:border-blue-700 bg-gradient-to-br from-blue-200/40 to-cyan-200/30 dark:from-blue-800/40 dark:to-cyan-800/30"></div>
              <div className="absolute top-2 left-2 w-4 h-4 rounded-sm border border-blue-400 dark:border-blue-600 bg-gradient-to-br from-blue-300/50 to-cyan-300/40 dark:from-blue-700/50 dark:to-cyan-700/40"></div>
            </div>

            <div className="absolute top-[65%] right-[25%]">
              <div className="w-12 h-12 rounded-full border border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-100/30 to-sky-100/20 dark:from-indigo-900/30 dark:to-sky-900/20 backdrop-blur-sm"></div>
              <div className="absolute top-3 left-3 w-6 h-6 rounded-full border border-indigo-300 dark:border-indigo-700 bg-gradient-to-br from-indigo-200/40 to-sky-200/30 dark:from-indigo-800/40 dark:to-sky-800/30"></div>
              <div className="absolute top-4 left-4 w-4 h-4 rounded-full border border-indigo-400 dark:border-indigo-600 bg-gradient-to-br from-indigo-300/50 to-sky-300/40 dark:from-indigo-700/50 dark:to-sky-700/40"></div>
            </div>
          </div>

          {/* Technology Flow Lines */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Horizontal Data Streams */}
            <div className="absolute h-[1px] w-full top-[15%] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
            <div className="absolute h-[1px] w-full top-[35%] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent"></div>
            <div className="absolute h-[1px] w-full top-[65%] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
            <div className="absolute h-[1px] w-full top-[85%] bg-gradient-to-r from-transparent via-sky-500/40 to-transparent"></div>

            {/* Vertical Data Streams */}
            <div className="absolute w-[1px] h-full left-[20%] bg-gradient-to-b from-transparent via-blue-500/50 to-transparent"></div>
            <div className="absolute w-[1px] h-full left-[40%] bg-gradient-to-b from-transparent via-cyan-500/40 to-transparent"></div>
            <div className="absolute w-[1px] h-full left-[60%] bg-gradient-to-b from-transparent via-indigo-500/50 to-transparent"></div>
            <div className="absolute w-[1px] h-full left-[80%] bg-gradient-to-b from-transparent via-sky-500/40 to-transparent"></div>

            {/* Diagonal Connection Lines */}
            <div className="absolute top-[15%] left-[20%] w-[40%] h-[50%]">
              <div className="w-full h-full border-b border-r border-blue-300/20 dark:border-blue-700/20 rounded-br-3xl"></div>
            </div>
            <div className="absolute top-[35%] right-[20%] w-[30%] h-[30%]">
              <div className="w-full h-full border-t border-l border-cyan-300/20 dark:border-cyan-700/20 rounded-tl-3xl"></div>
            </div>
          </div>

          {/* Tech Particles */}
          <div className="absolute inset-0 overflow-hidden">
            {Array(12)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 dark:from-blue-500 dark:to-cyan-500"
                  style={{
                    top: `${15 + (i % 4) * 20}%`,
                    left: `${20 + Math.floor(i / 4) * 20}%`,
                    opacity: 0.4 + (i % 3) * 0.2,
                    boxShadow: "0 0 8px rgba(56, 189, 248, 0.5)",
                    animation: `pulse ${2 + (i % 3)}s infinite alternate ease-in-out`,
                  }}
                ></div>
              ))}
          </div>
        </div>

        <div className="w-full max-w-4xl p-6 relative z-10">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img
              src="/images/logo.png"
              alt="APJII Logo"
              className="w-auto h-16"
            />
          </div>

          {/* Main Content */}
          <Card className="p-0 overflow-hidden shadow-xl border-0 dark:bg-gray-800/60 backdrop-blur-sm">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-sky-600 h-3" />

            <div className="grid md:grid-cols-5 gap-0">
              {/* Illustration Section */}
              <div className="p-6 flex items-center justify-center md:col-span-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
                <div className="relative w-full h-64 flex items-center justify-center">
                  <Clock className="w-48 h-48 text-blue-500/20" />
                  <div className="absolute w-full h-full flex items-center justify-center">
                    <div className="animate-bounce">
                      <Settings className="w-24 h-24 text-blue-500" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-8 md:col-span-3 flex flex-col">
                <div className="flex-grow">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                    System Maintenance
                  </h2>
                  <div className="h-1 w-20 bg-blue-500 rounded mb-5"></div>

                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Mohon maaf atas ketidaknyamanannya. Sistem sedang dalam
                    pemeliharaan untuk meningkatkan kualitas layanan kami.
                    Silakan coba kembali beberapa saat lagi.
                  </p>

                  <div className="flex items-center mb-6 text-sm">
                    <div className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                      <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse"></div>
                      <span>Silahkan Coba Lagi Dalam Beberapa Jam</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    <Button
                      variant="flat"
                      color="default"
                      className="flex-1 max-w-[180px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                      onClick={() => window.location.reload()}
                      startContent={<RefreshCw className="w-4 h-4" />}
                    >
                      Coba Kembali
                    </Button>

                    {/* Only show Admin Dashboard button if user is logged in and is admin */}
                    {user && isAdmin && (
                      <Button
                        variant="flat"
                        color="default"
                        className="flex-1 max-w-[180px] bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300"
                        onClick={() =>
                          (window.location.href = "/admin/dashboard")
                        }
                        startContent={<LayoutDashboard className="w-4 h-4" />}
                      >
                        Admin Dashboard
                      </Button>
                    )}

                    {/* Always show login/logout button regardless of maintenance state */}
                    {user ? (
                      <Button
                        variant="flat"
                        color="default"
                        className="flex-1 max-w-[180px] bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-300"
                        onClick={handleLogout}
                        startContent={<LogOut className="w-4 h-4" />}
                      >
                        Sign Out
                      </Button>
                    ) : (
                      <Button
                        variant="flat"
                        color="default"
                        className="flex-1 max-w-[180px] bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-300"
                        onClick={handleLogin}
                        startContent={<LogIn className="w-4 h-4" />}
                      >
                        Sign In
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Footer */}
          <div className="mt-8 text-center text-gray-500 dark:text-gray-400 text-sm">
            © {new Date().getFullYear()} APJII DC. All rights reserved.
          </div>
        </div>
      </div>
    );
  }

  return (
    <CustomerSettingsContext.Provider value={{ ppn, settings }}>
      {/* Enhanced Main Layout with Tech-Themed Background */}
      <div className="relative min-h-screen bg-gray-50/90 dark:bg-gray-950/90">
        {/* Enhanced Technology-Themed Background */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          {/* Base Grid Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTI1IDAgTDI1IDEwMCBNNTAgMCBMNTAgMTAwIE03NSAwIEw3NSAxMDAiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIxIiBzdHJva2Utb3BhY2l0eT0iMC4wNCIvPjxwYXRoIGQ9Ik0wIDI1IEwxMDAgMjUgTTAgNTAgTDEwMCA1MCBNMCA3NSBMMTA3NSA3NSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZS1vcGFjaXR5PSIwLjA0Ii8+PC9zdmc+')] opacity-70"></div>

          {/* Circular Element Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48Y2lyY2xlIGN4PSI3NSIgY3k9Ijc1IiByPSI1IiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDc3ZmYiIHN0cm9rZS13aWR0aD0iMSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDgiLz48Y2lyY2xlIGN4PSIxNTAiIGN5PSIxNTAiIHI9IjgiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwNzdmZiIgc3Ryb2tlLXdpZHRoPSIxIiBzdHJva2Utb3BhY2l0eT0iMC4wOCIvPjxjaXJjbGUgY3g9IjIyNSIgY3k9Ijc1IiByPSI1IiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDc3ZmYiIHN0cm9rZS13aWR0aD0iMSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDgiLz48Y2lyY2xlIGN4PSI3NSIgY3k9IjIyNSIgcj0iNyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDA3N2ZmIiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZS1vcGFjaXR5PSIwLjA4Ii8+PHBhdGggZD0iTTc1LDc1IEwxNTAsMTUwIiBzdHJva2U9IiMwMDc3ZmYiIHN0cm9rZS13aWR0aD0iMC41IiBzdHJva2Utb3BhY2l0eT0iMC4wNSIvPjxwYXRoIGQ9Ik0xNTAsMTUwIEwyMjUsNzUiIHN0cm9rZT0iIzAwNzdmZiIgc3Ryb2tlLXdpZHRoPSIwLjUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1Ii8+PHBhdGggZD0iTTE1MCwxNTAgTDc1LDIyNSIgc3Ryb2tlPSIjMDA3N2ZmIiBzdHJva2Utd2lkdGg9IjAuNSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiLz48L3N2Zz4=')] opacity-70"></div>

          {/* Color Gradient Areas */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-blue-400/10 via-cyan-400/5 to-transparent dark:from-blue-800/20 dark:via-cyan-800/10 dark:to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-gradient-to-tr from-indigo-400/10 via-sky-400/5 to-transparent dark:from-indigo-800/20 dark:via-sky-800/10 dark:to-transparent rounded-full blur-3xl"></div>

          {/* Complex Circuit Elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Tech Component 1 */}
            <div className="absolute top-20 left-[10%]">
              <div className="w-24 h-24 rounded-lg border border-blue-200/30 dark:border-blue-800/30 bg-gradient-to-br from-blue-100/10 to-cyan-100/5 dark:from-blue-900/10 dark:to-cyan-900/5 backdrop-blur-sm"></div>
              <div className="absolute top-6 left-6 w-12 h-12 rounded-md border border-blue-300/30 dark:border-blue-700/30 bg-gradient-to-br from-blue-200/10 to-cyan-200/5 dark:from-blue-800/10 dark:to-cyan-800/5"></div>
              <div className="absolute top-8 left-8 w-8 h-8 rounded-full border border-blue-400/30 dark:border-blue-600/30 bg-gradient-to-br from-blue-300/10 to-cyan-300/5 dark:from-blue-700/10 dark:to-cyan-700/5"></div>
              <div className="absolute top-10 left-10 w-4 h-4 bg-blue-500/40 dark:bg-blue-500/30 rounded-full animate-pulse"></div>
            </div>

            {/* Tech Component 2 */}
            <div className="absolute top-1/2 right-[15%] transform -translate-y-1/2">
              <div className="w-32 h-32 rounded-full border border-indigo-200/30 dark:border-indigo-800/30 bg-gradient-to-br from-indigo-100/10 to-sky-100/5 dark:from-indigo-900/10 dark:to-sky-900/5 backdrop-blur-sm"></div>
              <div className="absolute top-8 left-8 w-16 h-16 rounded-full border border-indigo-300/30 dark:border-indigo-700/30 bg-gradient-to-br from-indigo-200/10 to-sky-200/5 dark:from-indigo-800/10 dark:to-sky-800/5"></div>
              <div className="absolute top-12 left-12 w-8 h-8 rounded-full border border-indigo-400/30 dark:border-indigo-600/30 bg-gradient-to-br from-indigo-300/10 to-sky-300/5 dark:from-indigo-700/10 dark:to-sky-700/5"></div>
              <div className="absolute top-14 left-14 w-4 h-4 bg-indigo-500/40 dark:bg-indigo-500/30 rounded-full animate-pulse"></div>
            </div>

            {/* Tech Component 3 */}
            <div className="absolute bottom-24 left-[30%]">
              <div className="w-40 h-16 rounded-xl border border-cyan-200/30 dark:border-cyan-800/30 bg-gradient-to-br from-cyan-100/10 to-blue-100/5 dark:from-cyan-900/10 dark:to-blue-900/5 backdrop-blur-sm"></div>
              <div className="absolute top-4 left-10 w-20 h-8 rounded-lg border border-cyan-300/30 dark:border-cyan-700/30 bg-gradient-to-br from-cyan-200/10 to-blue-200/5 dark:from-cyan-800/10 dark:to-blue-800/5"></div>
              <div className="absolute top-6 left-16 w-8 h-4 rounded-md border border-cyan-400/30 dark:border-cyan-600/30 bg-gradient-to-br from-cyan-300/10 to-blue-300/5 dark:from-cyan-700/10 dark:to-blue-700/5"></div>
              <div className="absolute top-7 left-18 w-4 h-2 bg-cyan-500/40 dark:bg-cyan-500/30 rounded-sm animate-pulse"></div>
            </div>
          </div>

          {/* Dynamic Data Flow Lines */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Horizontal Data Streams with Animation */}
            <div className="absolute h-[2px] w-full top-[10%] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent animate-pulse"></div>
            <div
              className="absolute h-[1px] w-full top-[30%] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent animate-pulse"
              style={{ animationDelay: "0.5s" }}
            ></div>
            <div
              className="absolute h-[2px] w-full top-[50%] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
            <div
              className="absolute h-[1px] w-full top-[70%] bg-gradient-to-r from-transparent via-sky-500/20 to-transparent animate-pulse"
              style={{ animationDelay: "1.5s" }}
            ></div>
            <div
              className="absolute h-[2px] w-full top-[90%] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent animate-pulse"
              style={{ animationDelay: "2s" }}
            ></div>

            {/* Vertical Data Streams with Animation */}
            <div className="absolute w-[2px] h-full left-[10%] bg-gradient-to-b from-transparent via-blue-500/30 to-transparent animate-pulse"></div>
            <div
              className="absolute w-[1px] h-full left-[30%] bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent animate-pulse"
              style={{ animationDelay: "0.5s" }}
            ></div>
            <div
              className="absolute w-[2px] h-full left-[50%] bg-gradient-to-b from-transparent via-indigo-500/30 to-transparent animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
            <div
              className="absolute w-[1px] h-full left-[70%] bg-gradient-to-b from-transparent via-sky-500/20 to-transparent animate-pulse"
              style={{ animationDelay: "1.5s" }}
            ></div>
            <div
              className="absolute w-[2px] h-full left-[90%] bg-gradient-to-b from-transparent via-blue-500/30 to-transparent animate-pulse"
              style={{ animationDelay: "2s" }}
            ></div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <Navbar />
          {children}
          <Footer />
        </div>
      </div>
    </CustomerSettingsContext.Provider>
  );
}
