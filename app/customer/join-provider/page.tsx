"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";
import axios from "axios";
import { useAuthData } from "@/hooks/useAuthData";
import { AuthService } from "@/services/auth.service";
import Image from "next/image";

export default function JoinProviderPage() {
  const router = useRouter();
  const { user } = useAuthData();
  const [loading, setLoading] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Basic validation
    if (!referralCode.trim()) {
      setError("Referral code is required");
      setLoading(false);
      return;
    }

    try {
      const authHeader = AuthService.getAuthHeader();

      const response = await axios.post(
        "/api/customer/join-provider",
        { referral: referralCode.trim() },
        { headers: authHeader }
      );

      addToast({
        title: "Success",
        color: "success",
        description:
          "You have successfully joined the provider. Please log in again.",
      });

      // Redirect back to customer dashboard after successful join
      router.push("/customer");
    } catch (error: any) {
      console.error("Error joining provider:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to join provider";

      setError(errorMessage);

      addToast({
        title: "Failed",
        color: "danger",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen flex items-center justify-center ">
      <div className="w-full max-w-md">
        {/* Main Card */}
        <Card className="shadow-xl border-0 overflow-hidden rounded-xl">
          {/* Card Header with Accent Background */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <h1 className="text-xl font-bold mb-2">
              Join a Provider
            </h1>
            <p className="opacity-90">
              Enter the referral code provided by the provider to join
              their network
            </p>
          </div>

          <CardBody className="p-8">
            <div className="mb-8 flex justify-center">
              <div className="p-4 bg-blue-100 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Input
                  label="Referral Code"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  placeholder="Enter the referral code from provider"
                  required
                  isInvalid={!!error}
                  errorMessage={error}
                  className="text-lg py-6"
                  startContent={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  }
                />
                <p className="text-sm text-gray-500 ml-1">
                  This code is provided by the Provider you wish to join
                </p>
              </div>

              <Button
                type="submit"
                color="primary"
                className="w-full py-6 text-lg font-semibold rounded-xl transition-transform hover:scale-[1.02] active:scale-[0.98]"
                isLoading={loading}
              >
                {loading ? "Processing..." : "Join Provider"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button
                color="default"
                variant="light"
                className="text-sm"
                onClick={() => router.push("/customer")}
              >
                Back to Dashboard
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Info Card */}
        <Card className="mt-6 shadow-md border-0 rounded-xl overflow-hidden bg-indigo-50">
          <CardBody className="p-4">
            <div className="flex items-center">
              <div className="mr-3 text-indigo-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className="text-sm text-indigo-800">
                Joining a Provider will grant you access to the services
                they offer
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
