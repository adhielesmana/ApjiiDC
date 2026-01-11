import { NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get("token");
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
    const body = await request.json();

    if (!token?.value) {
      return NextResponse.json(
        { status: "error", message: "Unauthorized" },
        { status: 401 }
      );
    }

    const authHeader = token.value.startsWith("Bearer ")
      ? token.value
      : `Bearer ${token.value}`;

    let response;

    // Handle maintenance mode update
    if (body.hasOwnProperty("maintenance")) {
      response = await axios.post(
        `${BACKEND_URL}/admin/set-maintenance`,
        { maintenance: body.maintenance },
        {
          headers: { Authorization: authHeader },
        }
      );
    }
    // Handle PPN update
    else if (body.hasOwnProperty("ppn")) {
      response = await axios.post(
        `${BACKEND_URL}/admin/set-ppn`,
        { ppn: body.ppn },
        {
          headers: { Authorization: authHeader },
        }
      );
    } else {
      return NextResponse.json(
        { status: "error", message: "Invalid request body" },
        { status: 400 }
      );
    }

    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: error.response?.data?.message || "Failed to update setting",
      },
      { status: error.response?.status || 500 }
    );
  }
}
