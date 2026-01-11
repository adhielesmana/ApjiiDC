import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "100";

    const url = `${BACKEND_URL}/catalogue/provider/${params.id}/spaces?page=${page}&limit=${limit}`;

    const response = await axios.get(url);
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("pertner spaces fetch error:", {
      message: error.message,
      response: error.response?.data,
    });

    return NextResponse.json(
      {
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch pertner spaces",
      },
      { status: error.response?.status || 500 }
    );
  }
}
