import { NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    if (!token?.value) {
      return NextResponse.json({ error: "Token Expired" }, { status: 401 });
    }

    const formData = await req.formData();
    const datacenterId = formData.get("datacenter"); // Log the incoming data for debugging
    console.log("Request Data:", {
      datacenter: datacenterId,
      name: formData.get("name"),
      description: formData.get("description"),
      size: formData.get("size"),
      price: formData.get("price"),
      paymentPlan: formData.get("paymentPlan"),
      images: formData.getAll("images"),
    });

    if (!datacenterId) {
      return NextResponse.json(
        { success: false, message: "Datacenter ID is required" },
        { status: 400 }
      );
    }

    // Create the request payload
    const backendFormData = new FormData();
    backendFormData.append("datacenter", datacenterId.toString());
    backendFormData.append("name", formData.get("name") as string);
    backendFormData.append(
      "description",
      formData.get("description") as string
    );
    backendFormData.append("size", formData.get("size") as string);
    backendFormData.append("price", formData.get("price") as string); // Add payment plan if provided
    const paymentPlan = formData.get("paymentPlan");
    if (paymentPlan) {
      try {
        // Validate that it's valid JSON
        const planObj = JSON.parse(paymentPlan as string);
        backendFormData.append("paymentplan", paymentPlan as string);
        console.log("Valid payment plan added:", paymentPlan);
      } catch (e) {
        console.error("Invalid payment plan format:", paymentPlan, e);
        // Still add it, but log the error
        backendFormData.append("paymentplan", paymentPlan as string);
      }
    } else {
      // send empty json
      backendFormData.append("paymentplan", JSON.stringify({}));
    }

    // Handle images separately to ensure proper upload
    const images = formData.getAll("images");
    if (images.length > 0) {
      images.forEach((image) => {
        if (image instanceof Blob) {
          backendFormData.append("images", image);
        }
      });
    } // Log the outgoing request for debugging
    console.log("Sending to backend:", {
      url: `${BACKEND_URL}/space/new`,
      datacenter: backendFormData.get("datacenter"),
      name: backendFormData.get("name"),
      size: backendFormData.get("size"),
      price: backendFormData.get("price"),
      paymentPlan: backendFormData.get("paymentPlan"),
    });

    const response = await axios.post(
      `${BACKEND_URL}/space/new`,
      backendFormData,
      {
        headers: {
          Authorization: token.value.startsWith("Bearer ")
            ? token.value
            : `Bearer ${token.value}`,
          "Content-Type": "multipart/form-data",
        },
        // Add timeout and validate status
        timeout: 30000,
        validateStatus: (status) => status >= 200 && status < 500,
      }
    );
    if (response.status === 400) {
      console.log("Validation error from backend:", response.data);
      return NextResponse.json(
        {
          success: false,
          message: response.data.message || "Validation error",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Create space error:", {
      message: error.message,
      data: error.response?.data,
      status: error.response?.status,
      config: error.config,
    });

    return NextResponse.json(
      {
        success: false,
        message: error.response?.data?.message || "Failed to create space",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: error.response?.status || 500 }
    );
  }
}
