import axios from "axios";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    if (!token?.value) {
      return NextResponse.json(
        { status: "error", message: "Unauthorized" },
        { status: 401 }
      );
    }

    const requestData = await req.json();

    // Validate required fields
    if (!requestData.id || requestData.activate === undefined) {
      return NextResponse.json(
        { status: "error", message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Send data to backend
    const response = await axios.post(
      `${BACKEND_URL}/admin/user/activate`,
      requestData,
      {
        headers: {
          Authorization: token.value.startsWith("Bearer ")
            ? token.value
            : `Bearer ${token.value}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
        validateStatus: (status) => status >= 200 && status < 500,
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Activate/deactivate user error:", {
      message: error.message,
      data: error.response?.data,
      status: error.response?.status,
    });

    return NextResponse.json(
      {
        status: "error",
        message:
          error.response?.data?.message || "Failed to update user status",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: error.response?.status || 500 }
    );
  }
}
