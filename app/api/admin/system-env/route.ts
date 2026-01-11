import { NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get("token");
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    if (!token?.value) {
      return NextResponse.json(
        { status: "error", message: "Unauthorized" },
        { status: 401 }
      );
    }

    const authHeader = token.value.startsWith("Bearer ")
      ? token.value
      : `Bearer ${token.value}`;

    const response = await axios.get(`${BACKEND_URL}/admin/definitelynotenv`, {
      headers: { Authorization: authHeader },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message:
          error.response?.data?.message ||
          "Failed to fetch environment variables",
      },
      { status: error.response?.status || 500 }
    );
  }
}
