// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token");
  const userCookie = request.cookies.get("user");

  const isAuthPage = request.nextUrl.pathname === "/login";
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isProviderRoute = request.nextUrl.pathname.startsWith("/provider");
  const isOrderRoute = request.nextUrl.pathname.startsWith("/customer/orders");
  const isBecomeProviderRoute =
    request.nextUrl.pathname === "/customer/become-provider";

  try {
    const user = userCookie ? JSON.parse(userCookie.value) : null;
    const roleType = user?.roleType;

    // Already logged in users can be redirected from login page
    if (isAuthPage && token) {
      return NextResponse.redirect(new URL("/customer", request.url));
    }

    // Protected routes require authentication
    if (
      !token &&
      (isAdminRoute || isProviderRoute || isOrderRoute || isBecomeProviderRoute)
    ) {
      // Create login URL with 'from' parameter to enable redirect after login
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set(
        "from",
        request.nextUrl.pathname + request.nextUrl.search
      );
      return NextResponse.redirect(loginUrl);
    }

    // Role-based access control (only if user is logged in)
    if (token && roleType) {
      // Admin routes - only admin
      if (isAdminRoute && roleType !== "admin") {
        return NextResponse.redirect(new URL("/customer", request.url));
      }

      // Provider routes - only provider and admin
      if (isProviderRoute && !["admin", "provider"].includes(roleType)) {
        return NextResponse.redirect(new URL("/customer", request.url));
      }

      // Become provider route - only users who are not providers yet
      if (isBecomeProviderRoute && roleType !== "user") {
        return NextResponse.redirect(new URL("/customer", request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    // Handle parsing errors by redirecting to login only for protected routes
    if (
      isAdminRoute ||
      isProviderRoute ||
      isOrderRoute ||
      isBecomeProviderRoute
    ) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/login",
    "/admin/:path*",
    "/provider/:path*",
    "/customer/orders/:path*",
    "/customer/become-provider",
  ],
};
