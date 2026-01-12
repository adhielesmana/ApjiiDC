// app/api/login/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import axios from "axios";

export async function POST(req: Request) {
  const { usernameOrEmail, password, remember } = await req.json();
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  if (!BACKEND_URL) {
    return NextResponse.json(
      { success: false, message: "Backend URL tidak ditemukan" },
      { status: 500 }
    );
  }

  try {
    console.log("Sending login request to:", `${BACKEND_URL}/auth/login`);
    console.log("Request payload:", {
      usernameOrEmail: usernameOrEmail?.trim(),
      password: "***",
      remember,
    });

    const backendRes = await axios.post(
      `${BACKEND_URL}/auth/login`,
      {
        usernameOrEmail: usernameOrEmail.trim(),
        password: password.trim(),
        remember: Boolean(remember), // Ensure boolean type
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent": "MitraDC-Frontend",
        },
        timeout: 10000,
        withCredentials: true,
      }
    );

    const { token, user } = backendRes.data;

    // Create response first
    const response = NextResponse.json({
      success: true,
      message: "Login berhasil",
      token,
      user,
    });

    // Set cookie expiration time based on remember option
    const cookieExpires =
      remember === "true"
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days if remember is true
        : undefined; // Session cookie if remember is false

    // Set cookies with proper configuration
    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: cookieExpires,
    });

    response.cookies.set({
      name: "user",
      value: JSON.stringify(user),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: cookieExpires,
    });

    return response;
  } catch (error: any) {
    const statusCode = error.response?.status || 500;
    const errorMessage =
      error.response?.data?.message || "A server error occurred";
    const errorData = error.response?.data;

    // Log detailed error for debugging
    console.error("Backend login error details:", {
      status: statusCode,
      message: errorMessage,
      data: errorData,
      headers: error.config?.headers,
    });

    // Handle 403 Forbidden
    if (statusCode === 403) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Access denied. Please check CORS configuration or backend authentication.",
        },
        { status: 403 }
      );
    }

    if (error.response?.status === 400) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid username/email or password",
        },
        { status: 400 }
      );
    }

    // Handle 401 specifically
    if (statusCode === 401) {
      return NextResponse.json(
        {
          success: false,
          message: "Incorrect username/email or password",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
      },
      { status: statusCode }
    );
  }
}
