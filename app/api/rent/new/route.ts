import { NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    if (!token?.value) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { spaceId, plan } = await req.json();

    if (!spaceId) {
      return NextResponse.json(
        { success: false, message: "Space ID is required" },
        { status: 400 }
      );
    }

    const response = await axios.post(
      `${BACKEND_URL}/rent/new`,
      { spaceId, plan },
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
    console.error("Create rent error:", {
      message: error.message,
      response: error.response?.data,
    });

    // Check if token expired and redirect to login page
    if (error.response?.data?.message === "Token Expired") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.json(
      {
        success: false,
        message: error.response?.data?.message || "Failed to create rent",
      },
      { status: error.response?.status || 500 }
    );
  }
}
