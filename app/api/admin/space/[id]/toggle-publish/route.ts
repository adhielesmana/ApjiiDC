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

    // Pastikan token ada, jika tidak return error 401
    if (!token?.value || token.value === "Bearer") {
      return NextResponse.json(
        { success: false, message: "Token tidak valid" },
        { status: 401 }
      );
    }

    const spaceId = params.id;
    const response = await axios.post(
      `${BACKEND_URL}/space/publish`,
      { spaceId },
      {
        headers: {
          Authorization: token.value.startsWith("Bearer ")
            ? token.value
            : `Bearer ${token.value}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Backend response:", response.data);
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Toggle publish error:", {
      message: error.message,
      response: error.response?.data,
    });
    return NextResponse.json(
      {
        success: false,
        message:
          error.response?.data?.message || "Gagal mengubah status publish",
      },
      { status: error.response?.status || 500 }
    );
  }
}
