import { NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get("token");
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    if (!token?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await axios.get(`${backendUrl}/my/referal/`, {
      headers: {
        Authorization: token.value.startsWith("Bearer ")
          ? token.value
          : `Bearer ${token.value}`,
      },
    });

    if (response.data.status === "ok" && Array.isArray(response.data.data)) {
      return NextResponse.json(response.data);
    } else {
      return NextResponse.json(
        { error: "Format respons dari server tidak sesuai" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    if (error.response?.data?.message === "Token Expired") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    console.error("List referrals error:", {
      message: error.message,
      response: error.response?.data,
    });

    // Check for the specific PJ-only error
    if (error.response?.data?.message === "This routes is pj-only") {
      return NextResponse.json(
        { error: "Maaf, fitur ini hanya tersedia untuk Penanggung Jawab" },
        { status: 403 }
      );
    } else {
      return NextResponse.json(
        {
          error:
            error.response?.data?.message ||
            "Gagal mengambil data referral, silahkan coba lagi",
        },
        { status: error.response?.status || 500 }
      );
    }
  }
}
