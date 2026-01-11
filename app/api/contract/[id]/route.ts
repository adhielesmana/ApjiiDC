import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get cookies for authentication
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    if (!token?.value) {
      return NextResponse.json(
        { status: "error", message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Extract contract ID from params
    const contractId = params.id;

    if (!contractId) {
      return NextResponse.json(
        { status: "error", message: "Contract ID is required" },
        { status: 400 }
      );
    }

    // Make request to backend API to get the contract details
    const response = await axios.get(
      `${BACKEND_URL}/contract/invoice/${contractId}`,
      {
        headers: {
          Authorization: token.value.startsWith("Bearer ")
            ? token.value
            : `Bearer ${token.value}`,
        },
      }
    );

    // Return the contract data
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error fetching contract:", {
      message: error.message,
      response: error.response?.data,
    });

    // Handle token expiration
    if (error.response?.data?.error === "Token Expired") {
      return NextResponse.json(
        { 
          status: "error", 
          error: "Token Expired", 
          message: "Your session has expired"
        },
        { status: 401 }
      );
    }

    // Return appropriate error response
    return NextResponse.json(
      {
        status: "error",
        message: error.response?.data?.message || "Failed to fetch contract details",
      },
      { status: error.response?.status || 500 }
    );
  }
}
