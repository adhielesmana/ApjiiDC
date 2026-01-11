import { NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";

export async function GET(request: Request) {
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

    // Extract query parameters from request URL
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";
    const provider = searchParams.get("provider");
    const datacenter = searchParams.get("datacenter");
    const search = searchParams.get("search");

    // Build query string for backend API
    const queryParams = new URLSearchParams();
    queryParams.append("page", page);
    queryParams.append("limit", limit);
    
    if (provider) queryParams.append("provider", provider);
    if (datacenter) queryParams.append("datacenter", datacenter);
    if (search) queryParams.append("search", search);

    const backendUrl = `${BACKEND_URL}/space/list?${queryParams.toString()}`;
    console.log("Making request to:", backendUrl);

    const response = await axios.get(backendUrl, {
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
