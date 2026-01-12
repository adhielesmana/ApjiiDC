import { NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";

export async function POST(request: Request) {
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

    const body = await request.json();

    const response = await axios.post(
      `${BACKEND_URL}/admin/provider/create`,
      body,
      {
        headers: {
          Authorization: token.value.startsWith("Bearer ")
            ? token.value
            : `Bearer ${token.value}`,
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error creating provider:", error.response?.data || error.message);
    return NextResponse.json(
      {
        status: "error",
        message: error.response?.data?.message || "Failed to create provider",
      },
      { status: error.response?.status || 500 }
    );
  }
}
