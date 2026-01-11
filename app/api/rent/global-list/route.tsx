import { NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";

export async function GET(req: Request) {
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

    const response = await axios.get(`${BACKEND_URL}/rent/list`, {
      headers: {
        Authorization: token.value.startsWith("Bearer ")
          ? token.value
          : `Bearer ${token.value}`,
      },
    });

    // Return the data directly
    return NextResponse.json(response.data);
  } catch (error: any) {
    if (error.response?.data?.message === "Token Expired") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.json(
      {
        status: "error",
        message: error.response?.data?.message || "Failed to fetch orders",
      },
      { status: error.response?.status || 500 }
    );
  }
}
