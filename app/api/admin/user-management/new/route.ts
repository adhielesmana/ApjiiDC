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
    } // Parse request body
    const requestData = await req.json();

    // Remove role field completely for customer users
    if (requestData.roleType === "user") {
      delete requestData.role;
    }

    // Log the incoming data for debugging
    console.log("User creation request:", {
      username: requestData.username,
      email: requestData.email,
      roleType: requestData.roleType,
      ...(requestData.roleType !== "user" && { role: requestData.role }),
    });

    // Validate required fields
    const requiredFields = ["username", "email", "password", "roleType"];
    for (const field of requiredFields) {
      if (!requestData[field]) {
        return NextResponse.json(
          { status: "error", message: `${field} is required` },
          { status: 400 }
        );
      }
    }
    // Validate role field only for non-customer users
    if (requestData.roleType !== "user" && !requestData.role) {
      return NextResponse.json(
        {
          status: "error",
          message: "Role is required for admin and provider users",
        },
        { status: 400 }
      );
    }

    // Ensure customer users have an empty role field
    if (requestData.roleType === "user" && requestData.role) {
      requestData.role = "";
    }

    // Send data to backend
    const response = await axios.post(
      `${BACKEND_URL}/admin/user/new`,
      requestData,
      {
        headers: {
          Authorization: token.value.startsWith("Bearer ")
            ? token.value
            : `Bearer ${token.value}`,
          "Content-Type": "application/json",
        },
        // Add timeout and status validation like in the space route
        timeout: 30000,
        validateStatus: (status) => status >= 200 && status < 500,
      }
    );

    // Handle 400 errors from backend specifically
    if (response.status === 400) {
      console.log("Validation error from backend:", response.data);
      return NextResponse.json(
        {
          status: "error",
          message: response.data.message || "Validation error",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Create user error:", {
      message: error.message,
      data: error.response?.data,
      status: error.response?.status,
      config: error.config,
    });

    return NextResponse.json(
      {
        status: "error",
        message: error.response?.data?.message || "Failed to create user",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: error.response?.status || 500 }
    );
  }
}
