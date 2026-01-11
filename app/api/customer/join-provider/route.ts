import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    // Get the Authorization header from the incoming request
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return NextResponse.json(
        { message: "Unauthorized: Token tidak ditemukan" },
        { status: 401 }
      );
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      return NextResponse.json(
        { message: "Backend URL tidak ditemukan" },
        { status: 500 }
      );
    }

    // Parse JSON request body
    const { referral } = await req.json();
    const referal = referral?.trim(); // Trim whitespace from referral code

    // Validate required field
    if (!referral) {
      return NextResponse.json(
        { message: "Kode referral tidak boleh kosong" },
        { status: 400 }
      );
    }

    // Set up request headers
    const headers = {
      Authorization: authHeader,
    };

    // Send request to backend
    const response = await axios.post(
      `${backendUrl}/my/join`,
      { referal },
      { headers }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error in join-provider API route:", error);

    // Log detailed error information for debugging
    if (error.response) {
      console.error("Response error details:", {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
    }

    return NextResponse.json(
      {
        message:
          error.response?.data?.message ||
          error.message ||
          "Gagal bergabung dengan provider",
      },
      { status: error.response?.status || 500 }
    );
  }
}
