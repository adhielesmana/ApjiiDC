import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const clearAuthCookies = (response: NextResponse) => {
  const cookieOptions = {
    maxAge: 0,
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
  };

  response.cookies.set("token", "", cookieOptions);
  response.cookies.set("user", "", cookieOptions);
  return response;
};

const createAuthResponse = (
  authenticated: boolean,
  data: any = null,
  error: string | null = null,
  status = 200
) => {
  const response = NextResponse.json(
    {
      authenticated,
      token: authenticated ? data?.token : null,
      user: authenticated ? data?.user : null,
      error: error || undefined,
    },
    { status }
  );

  if (!authenticated) {
    return clearAuthCookies(response);
  }

  return response;
};

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const userCookie = cookieStore.get("user");

    // Check if cookies exist
    if (!token?.value || !userCookie?.value) {
      return createAuthResponse(false, null, "Token Not Found", 401);
    }

    // Get clean token value
    const tokenValue = token.value.replace(/^Bearer\s/, "");

    // Validate token
    const decoded = jwt.decode(tokenValue);
    if (!decoded || typeof decoded !== "object" || !decoded.exp) {
      return createAuthResponse(false, null, "Invalid Token Format", 401);
    }

    // Check token expiration
    const isExpired = Math.floor(Date.now() / 1000) >= decoded.exp;
    if (isExpired) {
      return createAuthResponse(false, null, "Token Expired", 401);
    }

    // Valid auth - return user data
    return createAuthResponse(true, {
      token: token.value,
      user: JSON.parse(userCookie.value),
    });
  } catch (error) {
    console.error("Auth check error:", error);
    return createAuthResponse(false, null, "Authentication Error", 401);
  }
}
