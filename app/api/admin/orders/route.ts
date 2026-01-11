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
        { status: "error", message: "Unauthorized" },
        { status: 401 }
      );
    }

    const response = await axios.get(`${BACKEND_URL}/contract/list/pending`, {
      headers: {
        Authorization: token.value.startsWith("Bearer ")
          ? token.value
          : `Bearer ${token.value}`,
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
