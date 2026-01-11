import { NextResponse } from "next/server";
import axios from "axios";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
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
        status: "error",
        message:
          error.response?.data?.message || "Failed to fetch datacenter list",
      },
      { status: error.response?.status || 500 }
    );
  }
}