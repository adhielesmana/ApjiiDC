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
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    const formData = await req.formData(); // Log the entire FormData for debugging
    // console.log("FormData entries:");

    const contractId = formData.get("contractId");
    const invoiceId = formData.get("invoiceId");
    const proof = formData.get("proof") || formData.get("file"); // Accept both "proof" or "file" parameter names
    const paymentMethod = formData.get("paymentMethod") || "bank_transfer"; // Default to bank_transfer
    const bankCode = formData.get("bankCode") || null; // Bank code for bank transfer

    console.log("Extracted values:", {
      contractId,
      invoiceId,
      hasProof: !!proof,
      proofType: proof ? typeof proof : null,
      isFile: proof instanceof File,
      paymentMethod,
      bankCode,
    });

    console.log("Extracted values:", {
      contractId,
      invoiceId,
      hasProof: !!proof,
      proofType: proof ? typeof proof : null,
      isFile: proof instanceof File,
      paymentMethod,
      bankCode,
    });

    if (!contractId || !invoiceId) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Payment proof is required for all payment methods
    if (!proof) {
      return NextResponse.json(
        { success: false, message: "Payment proof is required" },
        { status: 400 }
      );
    }

    // Log the file information for debugging
    if (proof instanceof File) {
      console.log("File info:", {
        name: proof.name,
        type: proof.type,
        size: proof.size,
      });
    }

    // Clone the FormData to ensure proper file handling
    const newFormData = new FormData();
    newFormData.append("contractId", contractId as string);
    newFormData.append("invoiceId", invoiceId as string);
    newFormData.append("paymentMethod", paymentMethod as string);

    // Add bank code if payment method is bank_transfer
    if (paymentMethod === "bank_transfer" && bankCode) {
      newFormData.append("bankCode", bankCode as string);
    }

    // Ensure we're handling the file correctly
    if (proof instanceof File) {
      // For specific file types, ensure correct mime type is set
      newFormData.append("proof", proof, proof.name);
    } else if (proof && typeof proof === "string") {
      const blob = new Blob([proof], { type: "text/plain" });
      newFormData.append("proof", blob);
    }

    try {
      console.log("Sending request to:", `${BACKEND_URL}/contract/pay`);
      console.log("Contract ID:", contractId);
      console.log("Invoice ID:", invoiceId);

      const response = await axios.post(
        `${BACKEND_URL}/contract/pay`,
        newFormData,
        {
          headers: {
            Authorization: token.value.startsWith("Bearer ")
              ? token.value
              : `Bearer ${token.value}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Backend response:", response.data);
      return NextResponse.json(response.data);
    } catch (axiosError: any) {
      console.error("Axios payment error:", {
        message: axiosError.message,
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data,
        requestPayload: {
          contractId,
          invoiceId,
          proofProvided: !!proof,
          proofType: proof ? typeof proof : null,
          isFile: proof instanceof File,
        },
      });

      if (axiosError.response?.data?.message === "Token Expired") {
        return NextResponse.redirect(new URL("/login", req.url));
      }

      return NextResponse.json(
        {
          success: false,
          status: "error",
          message:
            axiosError.response?.data?.message || "Failed to process payment",
          details:
            axiosError.response?.data || "No additional details provided",
        },
        { status: axiosError.response?.status || 500 }
      );
    }
  } catch (error: any) {
    console.error("General payment error:", {
      message: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        success: false,
        status: "error",
        message: "Server error while processing payment",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
