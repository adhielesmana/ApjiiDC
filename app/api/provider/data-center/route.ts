import { NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    if (!token?.value) {
      return NextResponse.json({ error: "Token Expired" }, { status: 401 });
    }

    const response = await axios.get(`${BACKEND_URL}/datacenter`, {
      headers: {
        Authorization: token.value.startsWith("Bearer ")
          ? token.value
          : `Bearer ${token.value}`,
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Fetch data center error:", {
      message: error.message,
      response: error.response?.data,
    });

    return NextResponse.json(
      {
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch data centers",
      },
      { status: error.response?.status || 500 }
    );
  }
}
