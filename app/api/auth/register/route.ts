import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
  const { username, fullName, phone, email, password, company } =
    await req.json();

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  if (!BACKEND_URL) {
    return NextResponse.json(
      { message: "Backend URL tidak ditemukan" },
      { status: 500 }
    );
  }

  if (!username || !fullName || !phone || !email || !password) {
    return NextResponse.json(
      { message: "Semua field harus diisi" },
      { status: 400 }
    );
  }

  try {
    const backendRes = await axios.post(`${BACKEND_URL}/auth/register`, {
      username,
      company,
      fullName,
      phone,
      email,
      password,
    });

    return NextResponse.json(
      { message: "Registrasi berhasil" },
      { status: 200 }
    );
  } catch (error: any) {
    const statusCode = error.response?.status || 500;
    const backendMessage =
      error.response?.data?.message || "Terjadi kesalahan pada server";

    return NextResponse.json(
      { message: backendMessage },
      { status: statusCode }
    );
  }
}
