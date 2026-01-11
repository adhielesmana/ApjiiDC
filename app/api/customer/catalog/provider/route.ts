import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest) {
  try {
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    // Get parameters from query
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get("city");
    const province = searchParams.get("province");

    // Build URL with query parameters
    let url = `${BACKEND_URL}/catalogue/provider`;
    const params = new URLSearchParams();

    if (province) {
      params.append("province", province);
    }

    if (city) {
      params.append("city", city);
    }

    // Add parameters to URL if they exist
    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    const response = await axios.get(url);
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Provider fetch error:", {
      message: error.message,
      response: error.response?.data,
    });

    return NextResponse.json(
      {
        success: false,
        message: error.response?.data?.message || "Failed to fetch providers",
      },
      { status: error.response?.status || 500 }
    );
  }
}
