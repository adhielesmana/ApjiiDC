import { NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    if (!token?.value) {
      return NextResponse.json(
        { status: "error", message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Extract query parameters
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    // If ID is provided, fetch specific provider
    if (id) {
      const response = await axios.get(
        `${BACKEND_URL}/catalogue/provider/${id}`,
        {
          headers: {
            Authorization: token.value.startsWith("Bearer ")
              ? token.value
              : `Bearer ${token.value}`,
          },
        }
      );
      return NextResponse.json(response.data);
    }

    // Otherwise, fetch paginated list
    const page = url.searchParams.get("page") || "1";
    const limit = url.searchParams.get("limit") || "10";

    // Forward pagination parameters to backend
    const response = await axios.get(`${BACKEND_URL}/catalogue/provider`, {
      params: {
        page,
        limit,
      },
      headers: {
        Authorization: token.value.startsWith("Bearer ")
          ? token.value
          : `Bearer ${token.value}`,
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: "Failed to fetch partner" },
      { status: 500 }
    );
  }
}
