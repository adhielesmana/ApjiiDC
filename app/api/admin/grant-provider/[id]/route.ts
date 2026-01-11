import { NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get cookies - using await correctly
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    if (!token?.value) {
      return NextResponse.json(
        { status: "error", message: "Unauthorized" },
        { status: 401 }
      );
    }

    const response = await axios.post(
      `${BACKEND_URL}/provider/grant`,
      { id: params.id },
      {
        headers: {
          Authorization: token.value.startsWith("Bearer ")
            ? token.value
            : `Bearer ${token.value}`,
        },
      }
    );

    console.log("Response data:", response.data); // Log the response data

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Provision error:", {
      message: error.message,
      response: error.response?.data,
    });

    return NextResponse.json(
      { status: "error", message: "Failed to grant provider access" },
      { status: error.response?.status || 500 }
    );
  }
}
