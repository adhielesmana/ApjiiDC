import { NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";

export async function POST(req: Request) {
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
    const requestData = await req.json();
    const { contractId, invoiceId, action, paid } = requestData;

    if (!contractId || !invoiceId) {
      return NextResponse.json(
        { status: "error", message: "Contract ID and Invoice ID are required" },
        { status: 400 }
      );
    }

    const response = await axios.post(
      `${BACKEND_URL}/contract/verify`,
      { contractId, invoiceId, action, paid },
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
    console.error("Verify contract error:", {
      message: error.message,
      response: error.response?.data,
    });

    return NextResponse.json(
      {
        status: "error",
        message: error.response?.data?.message || "Failed to verify contract",
      },
      { status: error.response?.status || 500 }
    );
  }
}
