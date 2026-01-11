import { NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get cookies - using await correctly
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    if (!token?.value) {
      return NextResponse.json(
        { status: "error", message: "Unauthorized" },
        { status: 401 }
      );
    }
    const requestData = await request.json();
    const { paid, isPaid = true } = requestData; // Default isPaid to true if not provided

    const response = await axios.post(
      `${BACKEND_URL}/space/provision`,
      {
        contractId: params.id,
        paid: paid,
        isPaid: isPaid, // Add the isPaid parameter
      },
      {
        headers: {
          Authorization: token.value.startsWith("Bearer ")
            ? token.value
            : `Bearer ${token.value}`,
        },
      }
    );
    console.log("Provision response:", response.data);
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Provision error:", {
      message: error.message,
      response: error.response?.data,
    });

    return NextResponse.json(
      {
        status: "error",
        message: error.response?.data?.message || "Failed to provision order",
      },
      { status: error.response?.status || 500 }
    );
  }
}
