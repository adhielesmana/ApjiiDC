import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    const url = new URL(`${BACKEND_URL}/catalogue`);

    // Copy all search parameters directly to maintain &search= format
    searchParams.forEach((value, key) => {
      url.searchParams.append(key, value);
    });

    console.log("Catalog API URL with params:", url.toString());

    const response = await axios.get(url.toString());
    console.log("Catalog API Response:", {
      status: response.data.status,
      total: response.data.total,
      count: response.data.count,
      dataLength: response.data.data?.length
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Catalog fetch error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    return NextResponse.json(
      {
        status: "error",
        message: error.response?.data?.message || "Failed to fetch catalog",
      },
      { status: error.response?.status || 500 }
    );
  }
}
