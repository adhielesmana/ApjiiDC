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

    const requestData = await req.json();
    const userId = requestData.userId;

    if (!userId) {
      return NextResponse.json(
        { status: "error", message: "User ID is required" },
        { status: 400 }
      );
    }

    // Remove userId from the data to be sent to backend
    delete requestData.userId; // Preserve original roleType but remove from request data
    const originalRoleType = requestData.originalRoleType;
    const isProvider = originalRoleType === "provider";
    delete requestData.originalRoleType;

    // For provider users, always keep the provider roleType
    if (isProvider) {
      requestData.roleType = "provider"; // Ensure roleType is always set to provider
    }

    console.log(`User update request for roleType: ${requestData.roleType}`);

    // Remove role field completely for customer users
    if (requestData.roleType === "user") {
      delete requestData.role;
    }

    // Log the incoming data for debugging
    console.log("User update request:", {
      userId,
      username: requestData.username,
      email: requestData.email,
      roleType: requestData.roleType,
      ...(requestData.role && { role: requestData.role }),
    });

    // Validate required fields
    const requiredFields = ["username", "email"];

    // Only require roleType field if it's not a provider user
    // For providers, we might exclude it if backend doesn't accept it
    if (!isProvider) {
      requiredFields.push("roleType");
    }

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
          message: "Role is required for admin users",
        },
        { status: 400 }
      );
    }

    // Ensure customer users have an empty role field
    if (requestData.roleType === "user" && requestData.role) {
      requestData.role = "";
    }

    // Check if password is provided and validate its length
    if (requestData.password !== undefined) {
      if (requestData.password === "") {
        // If empty string is provided, remove the password field
        delete requestData.password;
      } else if (requestData.password.length < 6) {
        return NextResponse.json(
          {
            status: "error",
            message: "Password must be at least 6 characters long",
          },
          { status: 400 }
        );
      }
    } // Send data to backend
    try {
      // For provider users, remove roleType field before sending to avoid validation errors
      let dataToSend = { ...requestData };

      // For provider users, we'll send the request without roleType field
      // to avoid backend validation errors
      if (isProvider) {
        delete dataToSend.roleType;
        console.log(
          "Provider user detected - removed roleType field to avoid validation errors"
        );
      }

      const response = await axios.post(
        `${BACKEND_URL}/admin/user/update/${userId}`,
        dataToSend,
        {
          headers: {
            Authorization: token.value.startsWith("Bearer ")
              ? token.value
              : `Bearer ${token.value}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
          validateStatus: (status) => status >= 200 && status < 500,
        }
      );

      // Handle 400 errors from backend specifically
      if (response.status === 400) {
        console.log("Validation error from backend:", response.data);

        interface ValidationError {
          path: string;
          value: string;
        }
        // For provider users with validation errors, try again without roleType
        if (isProvider) {
          // For provider users, we might have other validation errors unrelated to roleType
          // Let's try one more time with a simplified request
          try {
            const simpleData = {
              username: dataToSend.username,
              email: dataToSend.email,
              fullName: dataToSend.fullName || "",
              phone: dataToSend.phone || "",
              role: dataToSend.role,
            };

            // Try again with minimal data
            const retryResponse = await axios.post(
              `${BACKEND_URL}/admin/user/update/${userId}`,
              simpleData,
              {
                headers: {
                  Authorization: token.value.startsWith("Bearer ")
                    ? token.value
                    : `Bearer ${token.value}`,
                  "Content-Type": "application/json",
                },
                timeout: 30000,
              }
            );

            // Return success response with forced provider type
            return NextResponse.json({
              status: "ok",
              message: "Provider user updated successfully",
              data: { ...retryResponse.data?.data, roleType: "provider" },
            });
          } catch (retryErr) {
            console.error("Failed retry for provider update:", retryErr);
          }
        }

        // Return normal error if we reached here
        return NextResponse.json(
          {
            status: "error",
            message: response.data.message || "Validation error",
            errors: response.data.errors,
          },
          { status: 400 }
        );
      }

      // If successful, ensure provider status is preserved if needed
      if (isProvider && response.data.status === "ok") {
        if (response.data.data) {
          response.data.data.roleType = "provider";
        }
      }

      return NextResponse.json(response.data);
    } catch (error: any) {
      throw error;
    }
  } catch (error: any) {
    console.error("Update user error:", {
      message: error.message,
      data: error.response?.data,
      status: error.response?.status,
    });

    return NextResponse.json(
      {
        status: "error",
        message: error.response?.data?.message || "Failed to update user",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: error.response?.status || 500 }
    );
  }
}
