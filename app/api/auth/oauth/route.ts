import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
  const { code, state } = await req.json();
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  if (!BACKEND_URL) {
    return NextResponse.json(
      { success: false, message: "Backend URL tidak ditemukan" },
      { status: 500 }
    );
  }

  try {
    // Kirim kode ke backend
    const backendRes = await axios.post(
      `${BACKEND_URL}/auth/callbackOauthApjii`,
      {
        code,
        state,
      }
    );

    // Asumsikan backend mengembalikan token dan user
    const { token, user } = backendRes.data;

    // Set cookie jika perlu (opsional, mirip login biasa)
    const response = NextResponse.json({
      success: true,
      message: "Login MyAPJII berhasil",
      token,
      user,
    });
    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
    response.cookies.set({
      name: "user",
      value: JSON.stringify(user),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
    return response;
  } catch (error: any) {
    const statusCode = error.response?.status || 500;
    const errorMessage =
      error.response?.data?.message || "Terjadi kesalahan pada server";
    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
      },
      { status: statusCode }
    );
  }
}
