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

    const response = await axios.get(`${backendUrl}/my/referal/new`, {
      headers: {
        Authorization: token.value.startsWith("Bearer ")
          ? token.value
          : `Bearer ${token.value}`,
      },
    });

    if (response.data.status === "ok" && response.data.data) {
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

    console.error("Generate referral error:", {
      message: error.message,
      response: error.response?.data,
    });

    return NextResponse.json(
      {
        error:
          error.response?.data?.message ||
          "Gagal membuat kode referral baru, silahkan coba lagi",
      },
      { status: error.response?.status || 500 }
    );
  }
}
