"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import {
  HomeIcon,
  ShoppingCartIcon,
  ArrowRightOnRectangleIcon,
  DocumentTextIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Cog6ToothIcon,
  CommandLineIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/lib/store/auth/authSlice";
import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { LucideClockFading, ShoppingBasket } from "lucide-react";
import { useAuthData } from "@/hooks/useAuthData";
import { useProfileImage } from "@/hooks/useS3Image";
import type { RootState } from "@/lib/store/store";

const menuItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: HomeIcon },
  {
    href: "/admin/user-management",
    label: "User Management",
    icon: UserCircleIcon,
    superadminOnly: true,
  },
  { href: "/admin/orders", label: "Pending Orders", icon: LucideClockFading },
  { href: "/admin/all-orders", label: "All Orders", icon: ShoppingBasket },
  {
    href: "/admin/all-products",
    label: "All Products",
    icon: ShoppingCartIcon,
  },
  {
    href: "/admin/provider-request",
    label: "Partners",
    icon: DocumentTextIcon,
  },
  {
    href: "/admin/setting",
    label: "Settings",
    icon: Cog6ToothIcon,
    superadminOnly: true,
  },
  {
    href: "/admin/system-environment",
    label: "System Environment",
    icon: CommandLineIcon,
    superadminOnly: true,
  },
];

interface SidebarProps {
  className?: string;
  collapsed: boolean;
  setCollapsed: Dispatch<SetStateAction<boolean>>;
}

export function Sidebar({
  className = "",
  collapsed,
  setCollapsed,
}: SidebarProps) {
  const { user } = useSelector((state: RootState) => state.auth);
  // console.log("Get sidebar user:", user);
  const pathname = usePathname();
  const dispatch = useDispatch();
  const [isHovering, setIsHovering] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const { imageUrl } = useProfileImage(user?.pp, user?.fullName || "");
  const { isSuperadmin } = useAuthData();

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);

      // Only auto-collapse on initial mobile detection or window resize to mobile
      if (isMobileView) {
        setCollapsed(true);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [setCollapsed]);

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout");

      // Clear all storage locations
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");

      // Clear cookies on client side
      document.cookie =
        "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      // Make sure Redux state is cleared
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

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && !collapsed && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      <aside
        className={clsx(
          "bg-gradient-to-b from-blue-500 to-blue-600 border-r border-divider/30 shadow-lg flex flex-col transition-all duration-300 ease-in-out",
          // Fixed height and positioning
          "fixed top-0 bottom-0 h-screen",
          // Desktop styling
          !isMobile && "z-30",
          !isMobile && collapsed ? "w-20" : !isMobile ? "w-72" : "",
          // Mobile positioning
          isMobile && "z-50 w-[280px]",
          isMobile && collapsed ? "-translate-x-full" : "translate-x-0",
          className
        )}
      >
        {/* Desktop toggle button - visible only on desktop */}
        {!isMobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute right-[-10px] top-[300px] flex items-center justify-center w-5 h-16 bg-cyan-700 text-white rounded-r-lg shadow-xl hover:bg-cyan-800 transition-all z-50 border-2 border-cyan border-l-0"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRightIcon className="w-5 h-5" />
            ) : (
              <ChevronLeftIcon className="w-5 h-5" />
            )}
          </button>
        )}

        {/* Brand Header */}
        <div
          className={clsx(
            "border-b border-divider/20 flex items-center",
            !isMobile && collapsed ? "justify-center py-6" : "p-6"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 flex items-center justify-center">
              <img
                src="/images/logo-kotak-white.png"
                alt="APJII Logo"
                className="w-auto h-10"
              />
            </div>
            {(!collapsed || isMobile) && (
              <h2 className="text-xl font-bold bg-clip-text text-white">
                APJII DC
              </h2>
            )}
          </div>
        </div>

        {/* User Profile - always show on mobile, hide on collapsed desktop */}
        {(!collapsed || isMobile) && (
          <div className="p-4 mb-2 mt-2">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600/30">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={user?.fullName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <UserCircleIcon className="w-10 h-10 text-white/90" />
              )}
              <div>
                <p className="font-medium text-white">{user?.fullName}</p>
                <p className="text-xs text-white/80">Administrator</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Header - always show on mobile */}
        {(!collapsed || isMobile) && (
          <div className="px-4 text-xs font-medium text-white/80 uppercase tracking-wider mt-2">
            Main Navigation
          </div>
        )}
        {/* Navigation Items - with proper overflow handling */}
        <nav
          className={clsx(
            "flex-1 py-2 overflow-y-auto",
            !isMobile && collapsed ? "px-2 space-y-3 mt-4" : "px-4 space-y-1"
          )}
        >
          {menuItems
            .filter((item) => !item.superadminOnly || isSuperadmin)
            .map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onMouseEnter={() => setIsHovering(item.href)}
                onMouseLeave={() => setIsHovering(null)}
                title={collapsed && !isMobile ? item.label : undefined}
                className={clsx(
                  "flex items-center gap-3 transition-all duration-200 overflow-hidden relative",
                  !isMobile && collapsed ? "justify-center p-3" : "px-4 py-3",
                  "rounded-xl",
                  pathname === item.href
                    ? "bg-blue-700 text-white font-medium shadow-md"
                    : "hover:bg-blue-600/50 text-white"
                )}
              >
                {pathname === item.href && (
                  <span className="absolute inset-0 bg-primary/10 rounded-xl" />
                )}
                {item.icon && (
                  <item.icon
                    className={clsx(
                      !isMobile && collapsed ? "w-6 h-6" : "w-5 h-5",
                      "transition-transform",
                      (isHovering === item.href || pathname === item.href) &&
                        "scale-110"
                    )}
                  />
                )}
                {(!collapsed || isMobile) && (
                  <span className="font-medium">{item.label}</span>
                )}
                {(!collapsed || isMobile) && pathname === item.href && (
                  <span className="absolute right-4 h-1.5 w-1.5 rounded-full bg-white" />
                )}
              </Link>
            ))}
        </nav>

        {/* Footer Actions - Fixed at bottom */}
        <div
          className={clsx(
            "sticky bottom-0 left-0 right-0 bg-blue-600 border-t border-blue-700/50 py-2",
            !isMobile && collapsed ? "px-2" : "px-4"
          )}
        >
          {(!collapsed || isMobile) && (
            <div className="px-1 text-xs font-medium text-white/80 uppercase tracking-wider mb-2">
              Account
            </div>
          )}
          <button
            onClick={handleLogout}
            title={collapsed && !isMobile ? "Logout" : undefined}
            className={clsx(
              "bg-red-600 hover:bg-red-700 text-white w-full rounded-xl transition-all duration-200 group shadow-md",
              !isMobile && collapsed
                ? "flex justify-center p-3"
                : "flex items-center gap-3 px-4 py-3"
            )}
          >
            <ArrowRightOnRectangleIcon
              className={clsx(
                !isMobile && collapsed ? "w-6 h-6" : "w-5 h-5",
                "text-white group-hover:rotate-12 transition-transform"
              )}
            />
            {(!collapsed || isMobile) && (
              <span className="font-medium">Logout</span>
            )}
          </button>
        </div>
      </aside>

      {/* Main content padding for fixed sidebar */}
      <div
        className={clsx(
          "transition-all duration-300",
          !isMobile && collapsed ? "pl-20" : !isMobile ? "pl-72" : "pl-0"
        )}
      />

      {/* Mobile Toggle Button - Always visible on mobile */}
      {isMobile && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="fixed z-[60] p-3 rounded-full bg-blue-500 text-white shadow-lg md:hidden transition-all duration-300 bottom-4 left-4"
          aria-label={collapsed ? "Open menu" : "Close menu"}
        >
          <Bars3Icon className="w-6 h-6" />
        </button>
      )}
    </>
  );
}
