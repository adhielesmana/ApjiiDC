import { NextResponse } from "next/server";
import axios from "axios";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
    const url = `${BACKEND_URL}/catalogue/datacenter/${params.id}`;

    const response = await axios.get(url);

    // Process spaces images - simplified version that only validates images
    if (response.data?.data?.spaces?.length > 0) {
      // Just validate image paths without creating imagesUrl
      response.data.data.spaces = response.data.data.spaces.map(
        (space: any) => {
          // Make a fresh copy of the space object
          const processedSpace = { ...space };

          if (
            space.images &&
            Array.isArray(space.images) &&
            space.images.length > 0
          ) {
            // Check if any images don't start with expected prefix
            const hasValidImages = space.images.every(
              (img: string) =>
                typeof img === "string" &&
                (img.startsWith("apjiidc/") || img.startsWith("https://"))
            );

            if (!hasValidImages) {
              console.warn(
                `Space ${space._id} (${space.name}) has potentially invalid image paths:`,
                space.images
              );
            }
          }

          return processedSpace;
        }
      );
    }

    // Log processed data summary
    if (response.data?.data?.spaces) {
      console.log(
        `Datacenter ${params.id} has ${response.data.data.spaces.length} spaces`
      );
    }

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("datacenter fetch error:", {
      message: error.message,
      response: error.response?.data,
    });

    return NextResponse.json(
      {
        status: "error",
        message:
          error.response?.data?.message || "Failed to fetch datacenter details",
      },
      { status: error.response?.status || 500 }
    );
  }
}
