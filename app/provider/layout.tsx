"use client";

import { useAuthData } from "@/hooks/useAuthData";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/provider/sidebar";
import { useEffect, useState, createContext } from "react";
import { Spinner } from "@heroui/spinner";
import clsx from "clsx";

// Create a context for PPN value similar to AdminSettingsContext
export const ProviderSettingsContext = createContext<{
  ppn: number | null;
  settings: any | null;
}>({
  ppn: null,
  settings: null,
});

export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isProvider, loading } = useAuthData();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [ppn, setPpn] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !isProvider) {
      router.replace("/");
    }
  }, [isProvider, loading, router]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/setting");
        const data = await response.json();
        setSettings(data);
        if (data.status === "ok" && data.data.ppn) {
          setPpn(data.data.ppn);
          console.log("PPN value:", data.data.ppn); // This will show the ppn value
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      }
    };

    if (isProvider) {
      fetchSettings();
    }
  }, [isProvider]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isProvider) {
    return null;
  }

  return (
    <div className="flex min-h-screen relative">
      <ProviderSettingsContext.Provider value={{ ppn, settings }}>
        <Sidebar
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />
        <main
          className={clsx(
            "flex-1 p-4 md:p-8 transition-all duration-300 ease-in-out",
            isMobile && !sidebarCollapsed ? "ml-[280px]" : ""
          )}
        >
          {children}
        </main>
      </ProviderSettingsContext.Provider>
    </div>
  );
}
