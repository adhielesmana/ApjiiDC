import { NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";

export async function GET() {
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

    // Fetch users from backend
    const response = await axios.get(`${BACKEND_URL}/provider/users`, {
      headers: {
        Authorization: token.value.startsWith("Bearer ")
          ? token.value
          : `Bearer ${token.value}`,
      },
    });
    // Return as-is (frontend will filter isPj)
    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "fail",
        message: error.response?.data?.message || "Failed to fetch members",
        debug: error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}

export async function POST(req: Request) {
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
    const body = await req.json();
    const { userId } = body;
    if (!userId) {
      return NextResponse.json(
        { status: "fail", message: "userId is required" },
        { status: 400 }
      );
    }
    // Post to backend delist endpoint
    const response = await axios.post(
      `${BACKEND_URL}/my/delist`,
      { userId },
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
    return NextResponse.json(
      {
        status: "fail",
        message: error.response?.data?.message || "Failed to delist member",
        debug: error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}
