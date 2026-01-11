import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
    const url = `${BACKEND_URL}/catalogue/provider/${params.id}`;

    const response = await axios.get(url);
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("partner fetch error:", {
      message: error.message,
      response: error.response?.data,
    });

    return NextResponse.json(
      {
        success: false,
        message: error.response?.data?.message || "Failed to fetch partner",
      },
      { status: error.response?.status || 500 }
    );
  }
}
