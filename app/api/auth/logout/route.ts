// app/api/logout/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import axios from "axios";

// Support both POST and GET for logout
export async function POST(req: Request) {
  return handleLogout(req);
}

export async function GET(req: Request) {
  return handleLogout(req);
}

async function handleLogout(req: Request) {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  // Call backend logout if token exists
  if (token && BACKEND_URL) {
    try {
      await axios.post(
        `${BACKEND_URL}/auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "User-Agent": "MitraDC-Frontend",
          },
          timeout: 10000,
          withCredentials: true,
        }
      );
    } catch (backendError: any) {
      // Log backend error but continue with client logout
      console.error("Backend logout error:", backendError.response?.data);
    }
  }

  const res = NextResponse.json({
    success: true,
    message: "Logout berhasil",
  });

  // Clear all authentication cookies
  res.cookies.delete("token");
  res.cookies.delete("user");
  res.cookies.delete("refreshToken");

  return res;
}
