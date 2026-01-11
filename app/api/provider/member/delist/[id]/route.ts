import { NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    if (!token?.value) {
      return NextResponse.json(
        { status: "fail", message: "Token not found" },
        { status: 401 }
      );
    }

    if (!BACKEND_URL) {
      throw new Error("BACKEND_URL not configured");
    }

    const response = await axios.post(
      `${BACKEND_URL}/my/delist`,
      { userId: params.id },
      {
        headers: {
          Authorization: token.value.startsWith("Bearer ")
            ? token.value
            : `Bearer ${token.value}`,
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Delist error:", error);
    return NextResponse.json(
      {
        status: "fail",
        message: error.response?.data?.message || "Failed to delist member",
      },
      { status: error.response?.status || 500 }
    );
  }
}
