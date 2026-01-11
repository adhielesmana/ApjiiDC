import { NextRequest, NextResponse } from "next/server";

// Get the backend URL from environment variables
// Change this to match your actual backend URL - this is likely the source of the error
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
export async function GET(req: NextRequest) {
  try {
    // Get the key from query parameters
    const url = new URL(req.url);
    const key = url.searchParams.get("key");

    // Validate the key parameter
    if (!key) {
      return NextResponse.json(
        { error: "Key parameter is required" },
        { status: 400 }
      );
    }

    console.log(`Fetching S3 URL for key: ${key}`);
    console.log(`Backend URL: ${BACKEND_URL}`);

    // Make a request to the backend
    const backendUrl = `${BACKEND_URL}/catalogue/s3url?key=${encodeURIComponent(key)}`;
    console.log(`Making request to: ${backendUrl}`);

    const response = await fetch(backendUrl);
    console.log(`Backend response status: ${response.status}`);

    // Check if the response is OK
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend error: ${errorText}`);
      return NextResponse.json(
        { error: `Failed to fetch from backend: ${response.statusText}` },
        { status: response.status }
      );
    }

    // Parse the response
    const data = await response.json();
    console.log("Backend response data:", data);

    // Format the response for the frontend
    // Adapt this based on your backend's actual response structure
    if (data.status === "ok") {
      // Return the formatted response that matches what the frontend expects
      return NextResponse.json({
        status: "ok",
        url: data.data?.url || data.url || data.data,
      });
    }

    // If we get here, something went wrong with the response format
    return NextResponse.json(
      {
        error: "Invalid response format from backend",
        details: data,
      },
      { status: 500 }
    );
  } catch (error) {
    console.error("Error fetching S3 URL:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}