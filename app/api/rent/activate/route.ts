import { NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";

export async function POST(req: Request) {
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

    const formData = await req.formData();

    const response = await axios.post(
      `${BACKEND_URL}/rent/activate`,
      formData,
      {
        headers: {
          Authorization: token.value.startsWith("Bearer ")
            ? token.value
            : `Bearer ${token.value}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Activation error:", {
      message: error.message,
      response: error.response?.data,
    });

    return NextResponse.json(
      {
        status: "error",
        message: error.response?.data?.message || "Failed to activate order",
      },
      { status: error.response?.status || 500 }
    );
  }
}
