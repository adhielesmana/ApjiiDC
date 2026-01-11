import { NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    console.log("Debug - Token:", token?.value);
    console.log("Debug - Backend URL:", BACKEND_URL);

    if (!token?.value) {
      return NextResponse.json(
        { success: false, message: "Token not found" },
        { status: 401 }
      );
    }

    if (!BACKEND_URL) {
      throw new Error("BACKEND_URL not configured");
    }

    console.log("Making request to:", `${BACKEND_URL}/space/list`);

    const response = await axios.get(`${BACKEND_URL}/space/list`, {
      headers: {
        Authorization: token.value.startsWith("Bearer ")
          ? token.value
          : `Bearer ${token.value}`,
      },
    });

    // Return raw response from backend without modification
    return NextResponse.json(response.data);
  } catch (error: any) {
    // Detailed error logging
    console.error("Space list detailed error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        headers: error.config?.headers,
      },
    });

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch spaces",
        debug: {
          error: error.message,
          response: error.response?.data,
        },
      },
      { status: error.response?.status || 500 }
    );
  }
}
