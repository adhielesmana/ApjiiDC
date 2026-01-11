import { NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    const response = await axios.get(`${BACKEND_URL}/catalogue/settings`, {});

    // Ensure PPN is properly included in the response
    if (response.data.status === "ok" && response.data.data) {
      // If PPN isn't set in the response but should be, set a default
      if (
        response.data.data.ppn === undefined ||
        response.data.data.ppn === null
      ) {
        console.log("PPN not found in response, using default value");
        response.data.data.ppn = 11; // Default PPN value (11%)
      }
    }

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Settings API error:", error.message);
    return NextResponse.json(
      {
        status: "error",
        message: error.response?.data?.message || "Failed to fetch settings",
      },
      { status: error.response?.status || 500 }
    );
  }
}
