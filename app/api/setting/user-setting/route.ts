import { NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";

export async function POST(req: Request) {
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

    // Get form data from request
    const formData = await req.formData();
    console.log("Form data received:", Object.fromEntries(formData.entries())); // Debug form data

    // Create a new FormData to pass to the backend
    const backendFormData = new FormData();

    // Get username from form data
    const username = formData.get("username");
    if (username) {
      backendFormData.append("username", username.toString());
    }

    // Get fullName from form data
    const fullName = formData.get("fullName");
    if (fullName) {
      backendFormData.append("fullName", fullName.toString());
    }

    // Get phone from form data
    const phone = formData.get("phone");
    if (phone) {
      backendFormData.append("phone", phone.toString());
    }

    // Get profile picture from form data
    const profilePicture = formData.get("pp");
    if (profilePicture && profilePicture instanceof File) {
      backendFormData.append("pp", profilePicture);
    }

    // Send request to backend
    const response = await axios.post(
      `${BACKEND_URL}/my/update`,
      backendFormData,
      {
        headers: {
          Authorization: token.value.startsWith("Bearer ")
            ? token.value
            : `Bearer ${token.value}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("Backend response:", response.data); // Debug backend response
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("User setting update error:", {
      message: error.message,
      response: error.response?.data,
    });

    return NextResponse.json(
      {
        status: "error",
        message:
          error.response?.data?.message || "Failed to update user settings",
      },
      { status: error.response?.status || 500 }
    );
  }
}
