"use client";

import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Button } from "@heroui/button";
import { Kbd } from "@heroui/kbd";
import { Link } from "@heroui/link";
import { Input } from "@heroui/input";
import { link as linkStyles } from "@heroui/theme";
import NextLink from "next/link";
import clsx from "clsx";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Avatar } from "@heroui/avatar";
import { useSelector, useDispatch } from "react-redux";
import { logout, setCredentials } from "@/lib/store/auth/authSlice";
import type { RootState } from "@/lib/store/store";
import { useState, useEffect } from "react";
import { User } from "@/types/auth";

import { siteConfig } from "@/config/site";
import {
  TwitterIcon,
  GithubIcon,
  DiscordIcon,
  HeartFilledIcon,
  SearchIcon,
  Logo,
} from "@/components/icons";
// import { useAuth } from "@/hooks/useAuth";
import { useAuthData } from "@/hooks/useAuthData";
import { useProfileImage } from "@/hooks/useS3Image";

export const Navbar = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [mounted, setMounted] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { loading, isProvider, isUser, isAdmin } = useAuthData();
  // Use type assertion to temporarily resolve TypeScript errors
  const userWithPp = user as (User & { pp?: string }) | null;
  const { imageUrl } = useProfileImage(
    userWithPp?.pp,
    userWithPp?.fullName || ""
  );

  if (isUser) {
    console.log("User is authenticated");
  }
  useEffect(() => {
    // Get latest user data from localStorage
    const latestUser = localStorage.getItem("user");
    if (latestUser) {
      const parsedUser = JSON.parse(latestUser);
      // Only update Redux if the data is different
      if (JSON.stringify(user) !== JSON.stringify(parsedUser)) {
        dispatch(
          setCredentials({
            token: localStorage.getItem("token") || "",
            user: parsedUser as User,
          })
        );
      }
    }
    setMounted(true);
  }, [dispatch, user]);

  if (!mounted) {
    return null; // or loading skeleton
  }

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

  const handleLogin = () => {
    router.push("/login");
  };

  const searchInput = (
    <Input
      aria-label="Search"
      classNames={{
        inputWrapper: "bg-default-100",
        input: "text-sm",
      }}
      endContent={
        <Kbd className="hidden lg:inline-block" keys={["command"]}>
          K
        </Kbd>
      }
      labelPlacement="outside"
      placeholder="Search..."
      startContent={
        <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
      }
      type="search"
    />
  );

  const navItems = siteConfig.navItems.filter(
    (item) => !item.isLogout && !item.isLogin
  );

  const navMenuItems = siteConfig.navMenuItems.filter(
    (item) => !item.isLogout && !item.isLogin
  );
  console.log("user", user);
  return (
    <HeroUINavbar
      maxWidth="xl"
      position="sticky"
      className="bg-background/70 backdrop-blur-md border-b border-divider"
    >
      <NavbarContent className="basis-1/4" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink
            className="flex justify-start items-center gap-3 transition-transform hover:scale-105"
            href="/"
          >
            <img
              src="/images/logo.png"
              alt="APJII Logo"
              className="w-auto h-10"
            />
          </NextLink>
        </NavbarBrand>
      </NavbarContent>

      {/* Center nav content */}
      <NavbarContent className="basis-1/2 hidden lg:flex" justify="center">
        <ul className="flex gap-8 justify-center items-center">
          {navItems.map((item) => (
            <NavbarItem key={item.href} className="h-full flex items-center">
              <NextLink
                className={clsx(
                  "h-[40px] px-4 rounded-lg transition-all flex items-center font-medium",
                  "hover:text-primary hover:bg-primary/10",
                  pathname === item.href
                    ? "text-primary font-semibold bg-primary/10"
                    : "text-foreground/90"
                )}
                href={item.href}
              >
                {item.label}
              </NextLink>
            </NavbarItem>
          ))}
        </ul>
      </NavbarContent>

      <NavbarContent className="basis-1/4" justify="end">
        <NavbarItem className="hidden sm:flex items-center">
          {user ? (
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Avatar
                  name={user.fullName}
                  size="sm"
                  className="cursor-pointer"
                  src={imageUrl}
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="User menu">
                <DropdownItem key="user-info" className="h-14 gap-2">
                  <p className="font-semibold">{user.fullName}</p>
                  <p className="text-sm text-default-500">
                    {user.provider ? user.provider.name : user.email}
                  </p>
                </DropdownItem>
                {isUser ? (
                  <DropdownItem
                    key="join-provider"
                    onClick={() => router.push("/customer/join-provider")}
                  >
                    Join
                  </DropdownItem>
                ) : null}
                {isProvider ? (
                  <DropdownItem
                    key="provider-dashboard"
                    onClick={() => router.push("/provider/dashboard")}
                  >
                    Partner Dashboard
                  </DropdownItem>
                ) : null}
                {isUser ? (
                  <DropdownItem
                    key="orders"
                    onClick={() => router.push("/customer/orders")}
                  >
                    Orders
                  </DropdownItem>
                ) : null}
                {isAdmin ? (
                  <DropdownItem
                    key="admin-dashboard"
                    onClick={() => router.push("/admin/dashboard")}
                  >
                    Admin Dashboard
                  </DropdownItem>
                ) : null}
                <DropdownItem
                  key="settings"
                  onClick={() => router.push("/customer/user-setting")}
                >
                  Settings
                </DropdownItem>
                <DropdownItem
                  key="logout"
                  className="text-danger"
                  color="danger"
                  onClick={handleLogout}
                >
                  Log Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          ) : (
            <Button
              className="h-[40px] px-5 rounded-lg transition-colors hover:text-white hover:bg-primary"
              color="primary"
              onPress={() => router.push("/login")}
              variant="flat"
            >
              Sign In
            </Button>
          )}
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <NavbarMenuToggle className="text-primary" />
      </NavbarContent>

      <NavbarMenu className="bg-background/70 backdrop-blur-md pt-6">
        {user && (
          <div className="px-4 py-3 border-b border-divider">
            <p className="font-semibold">{user.fullName}</p>
            <p className="text-sm text-default-500">
              {user.provider ? user.provider.name : user.email}
            </p>
          </div>
        )}
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {navMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link
                className={clsx(
                  "w-full px-3 py-2 rounded-lg transition-colors",
                  pathname === item.href
                    ? "text-primary font-medium bg-primary/10"
                    : "text-foreground/90 hover:text-primary hover:bg-primary/10"
                )}
                href={item.href}
                size="lg"
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}

          {/* User-specific menu items */}
          {user && (
            <>
              {isUser && (
                <NavbarMenuItem>
                  <Button
                    className="w-full justify-start font-normal text-foreground/90 hover:text-primary hover:bg-primary/10"
                    onPress={() => router.push("/customer/join-provider")}
                    size="lg"
                    variant="light"
                  >
                    Join Provider
                  </Button>
                </NavbarMenuItem>
              )}

              {isProvider && (
                <NavbarMenuItem>
                  <Button
                    className="w-full justify-start font-normal text-foreground/90 hover:text-primary hover:bg-primary/10"
                    onPress={() => router.push("/provider/dashboard")}
                    size="lg"
                    variant="light"
                  >
                    Partner Dashboard
                  </Button>
                </NavbarMenuItem>
              )}

              {isUser && (
                <NavbarMenuItem>
                  <Button
                    className="w-full justify-start font-normal text-foreground/90 hover:text-primary hover:bg-primary/10"
                    onPress={() => router.push("/customer/orders")}
                    size="lg"
                    variant="light"
                  >
                    Orders
                  </Button>
                </NavbarMenuItem>
              )}

              {isAdmin && (
                <NavbarMenuItem>
                  <Button
                    className="w-full justify-start font-normal text-foreground/90 hover:text-primary hover:bg-primary/10"
                    onPress={() => router.push("/admin/dashboard")}
                    size="lg"
                    variant="light"
                  >
                    Admin Dashboard
                  </Button>
                </NavbarMenuItem>
              )}

              <NavbarMenuItem>
                <Button
                  className="w-full justify-start font-normal text-foreground/90 hover:text-primary hover:bg-primary/10"
                  onPress={() => router.push("/customer/user-setting")}
                  size="lg"
                  variant="light"
                >
                  Settings
                </Button>
              </NavbarMenuItem>
            </>
          )}

          {user ? (
            <Button
              className="w-full justify-start font-normal hover:text-white hover:bg-danger"
              onPress={handleLogout}
              size="lg"
              variant="flat"
            >
              Sign Out
            </Button>
          ) : (
            <Button
              className="w-full justify-start font-normal hover:text-white hover:bg-primary"
              onPress={handleLogin}
              size="lg"
              variant="flat"
            >
              Sign In
            </Button>
          )}
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
