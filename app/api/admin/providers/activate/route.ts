import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    if (!token?.value) {
      return NextResponse.json({ error: "Token Expired" }, { status: 401 });
    }

    // Get the request body
    const body = await req.json();
    const { id, active } = body;

    if (!id) {
      return NextResponse.json({ 
        status: "error",
        message: "Provider ID is required" 
      }, { status: 400 });
    }

    // Create a clean token for the header
    const authToken = token.value.startsWith("Bearer ")
      ? token.value
      : `Bearer ${token.value}`;

    // Make the request to activate/deactivate the provider
    const response = await axios.post(
      `${BACKEND_URL}/admin/provider/activate`,
      { id, active },
      {
        headers: {
          Authorization: authToken,
          "Content-Type": "application/json"
        }
      }
    );

    return NextResponse.json({
      status: "ok",
      message: active 
        ? "Provider activated successfully" 
        : "Provider deactivated successfully",
      data: response.data
    });
  } catch (error: any) {
    console.error("Provider activation error:", error.message);

    if (error.response) {
      console.error("Response error:", {
        status: error.response.status,
        data: error.response.data,
      });
    }

    return NextResponse.json(
      {
        status: "error",
        message: error.response?.data?.message || "Failed to update provider activation status",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: error.response?.status || 500 }
    );
  }
}
