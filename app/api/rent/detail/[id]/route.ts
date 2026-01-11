import { NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { status: "error", message: "Order ID is required" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    if (!token?.value) {
      return NextResponse.json(
        { status: "error", message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Call the invoice endpoint with the provided ID
    const response = await axios.get(`${BACKEND_URL}/contract/invoice/${id}`, {
      headers: {
        Authorization: token.value.startsWith("Bearer ")
          ? token.value
          : `Bearer ${token.value}`,
      },
    });

    return NextResponse.json({
      status: "ok",
      data: response.data.data,
    });
  } catch (error: any) {
    if (error.response?.data?.message === "Token Expired") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    console.error("Order detail error:", {
      message: error.message,
      response: error.response?.data,
    });

    return NextResponse.json(
      {
        status: "error",
        message:
          error.response?.data?.message || "Failed to fetch order details",
      },
      { status: error.response?.status || 500 }
    );
  }
}
