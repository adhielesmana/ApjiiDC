import { NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  try {
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
    const url = `${BACKEND_URL}/my/dashboard`;

    // Ambil token dari cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    // Jika tidak ada token, return error 401
    if (!token?.value || token.value === "Bearer") {
      return NextResponse.json(
        { success: false, message: "Token tidak valid" },
        { status: 401 }
      );
    }

    // Kirim token ke backend via Authorization header
    const headers: any = {
      Authorization: token.value.startsWith("Bearer ")
        ? token.value
        : `Bearer ${token.value}`,
    };

    const response = await axios.get(url, { headers });
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("partner dashboard fetch error:", {
      message: error.message,
      response: error.response?.data,
    });

    return NextResponse.json(
      {
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch partner dashboard",
      },
      { status: error.response?.status || 500 }
    );
  }
}
