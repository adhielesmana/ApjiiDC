import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
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
        status: "ok",
        data: [],
      },
      { status: 200 }
    );
  }
}
