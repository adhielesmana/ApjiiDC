import { NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    if (!token?.value) {
      return NextResponse.json({ error: "Token Expired" }, { status: 401 });
    }

    const body = await req.json();

    const response = await axios.post(`${BACKEND_URL}/datacenter/new`, body, {
      headers: {
        Authorization: token.value.startsWith("Bearer ")
          ? token.value
          : `Bearer ${token.value}`,
        "Content-Type": "application/json",
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Create data center error:", {
      message: error.message,
      response: error.response?.data,
    });

    return NextResponse.json(
      {
        success: false,
        message:
          error.response?.data?.message || "Failed to create data center",
      },
      { status: error.response?.status || 500 }
    );
  }
}
