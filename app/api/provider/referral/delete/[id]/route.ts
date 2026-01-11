import { NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const cookieStore = cookies();
    const token = (await cookieStore).get("token");
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    if (!token?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await axios.post(
      `${backendUrl}/my/referal/delete`,
      { referal: id },
      {
        headers: {
          Authorization: token.value.startsWith("Bearer ")
            ? token.value
            : `Bearer ${token.value}`,
        },
      }
    );

    if (response.data.status === "ok") {
      return NextResponse.json(response.data);
    } else {
      return NextResponse.json(
        { error: "Format respons dari server tidak sesuai" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    if (error.response?.data?.message === "Token Expired") {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    console.error("Delete referral error:", {
      message: error.message,
      response: error.response?.data,
    });

    return NextResponse.json(
      {
        error:
          error.response?.data?.message ||
          "Gagal menghapus kode referral, silahkan coba lagi",
      },
      { status: error.response?.status || 500 }
    );
  }
}
