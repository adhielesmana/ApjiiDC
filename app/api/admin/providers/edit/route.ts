import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    if (!token?.value) {
      return NextResponse.json({ error: "Token Expired" }, { status: 401 });
    }

    // Get the form data from the request
    const formData = await req.formData();

    // Get provider ID
    const providerId = formData.get("providerId") as string;

    if (!providerId) {
      return NextResponse.json(
        {
          error: "Provider ID is required",
        },
        { status: 400 }
      );
    }

    // Log the request data for debugging
    console.log("Edit Provider Request Data:", {
      providerId: providerId,
      name: formData.get("name"),
      description: formData.get("description"),
      contactEmail: formData.get("contact.email"),
      contactPhone: formData.get("contact.phone"),
      city: formData.get("city"),
      province: formData.get("province"),
      pos: formData.get("pos"),
      address: formData.get("address"),
      logo: formData.get("logo")
        ? `${(formData.get("logo") as File).name}, size: ${(formData.get("logo") as File).size}`
        : null,
    });

    // Create a new FormData object to ensure proper formatting for the backend
    const backendFormData = new FormData();

    // Add the text fields
    backendFormData.append("name", formData.get("name") as string);
    backendFormData.append(
      "description",
      formData.get("description") as string
    );
    backendFormData.append(
      "contact.email",
      formData.get("contact.email") as string
    );
    backendFormData.append(
      "contact.phone",
      formData.get("contact.phone") as string
    );
    backendFormData.append("city", formData.get("city") as string);
    backendFormData.append("province", formData.get("province") as string);
    backendFormData.append("pos", formData.get("pos") as string);
    backendFormData.append("address", formData.get("address") as string);

    // Handle the logo file if present
    const logo = formData.get("logo");
    if (logo instanceof Blob) {
      backendFormData.append("logo", logo);
      console.log(
        `Adding logo: ${(logo as File).name}, size: ${(logo as File).size} bytes`
      );
    }

    console.log(
      `Sending to backend: ${BACKEND_URL}/provider/update/${providerId}`
    );

    // Create a clean token for the header
    const authToken = token.value.startsWith("Bearer ")
      ? token.value
      : `Bearer ${token.value}`;

    // Make the request to update the provider
    const response = await axios.post(
      `${BACKEND_URL}/provider/update/${providerId}`,
      backendFormData,
      {
        headers: {
          Authorization: authToken,
        },
        timeout: 30000,
        validateStatus: (status) => status >= 200 && status < 500,
      }
    );

    if (response.status === 400) {
      console.log("Validation error from backend:", response.data);
      return NextResponse.json(response.data, { status: 400 });
    }

    return NextResponse.json({
      status: "ok",
      message: "Provider updated successfully",
      data: response.data,
    });
  } catch (error: any) {
    console.error("Edit provider error:", error.message);

    if (error.response) {
      console.error("Response error:", {
        status: error.response.status,
        data: error.response.data,
      });
    }

    return NextResponse.json(
      {
        status: "error",
        message: error.response?.data?.message || "Failed to update provider",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: error.response?.status || 500 }
    );
  }
}
