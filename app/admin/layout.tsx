"use client";

import { useAuthData } from "@/hooks/useAuthData";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/admin/sidebar";
import { useEffect, useState, createContext } from "react";
import { Spinner } from "@heroui/spinner";
import clsx from "clsx";

// Create a context for PPN value
export const AdminSettingsContext = createContext<{
  ppn: number | null;
  settings: any | null;
}>({
  ppn: null,
  settings: null,
});

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin, loading, isSuperadmin, isAdminStaff } = useAuthData();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [ppn, setPpn] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.replace("/");
    }
  }, [isAdmin, loading, router]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isSuperadmin) {
      console.log("Superadmin");
    }
    if (isAdminStaff) {
      console.log("Admin staff");
    }

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

    if (isAdmin) {
      fetchSettings();
    }
  }, [isAdmin]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }
  return (
    <div className="flex min-h-screen relative overflow-hidden">
      <AdminSettingsContext.Provider value={{ ppn, settings }}>
        <Sidebar
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />
        <main
          className={clsx(
            "flex-1 p-4 md:p-8 transition-all duration-300 ease-in-out overflow-hidden",
            isMobile && !sidebarCollapsed ? "ml-[280px]" : ""
          )}
        >
          <div className="max-w-full overflow-hidden">{children}</div>
        </main>
      </AdminSettingsContext.Provider>
    </div>
  );
}
