import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest) {
  try {
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    // Build URL for datacenter endpoint
    const url = `${BACKEND_URL}/catalogue/datacenter`;

    const response = await axios.get(url);
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Datacenter fetch error:", {
      message: error.message,
      response: error.response?.data,
    });

    return NextResponse.json(
      {
        success: false,
        message: error.response?.data?.message || "Failed to fetch datacenters",
      },
      { status: error.response?.status || 500 }
    );
  }
}
