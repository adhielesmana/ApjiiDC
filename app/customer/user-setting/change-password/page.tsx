"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { addToast } from "@heroui/toast";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords
    if (newPassword !== confirmPassword) {
      addToast({
        title: "Error",
        color: "danger",
        description: "New passwords do not match",
      });
      return;
    }

    if (newPassword.length < 6) {
      addToast({
        title: "Error",
        color: "danger",
        description: "Password must be at least 6 characters long",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("/api/setting/reset-password", {
        oldPassword,
        newPassword,
      });

      if (response.data.status === "ok") {
        addToast({
          title: "Success",
          color: "success",
          description: "Password changed successfully",
        });
        router.push("/customer/user-setting");
      }
    } catch (error: any) {
      addToast({
        title: "Error",
        color: "danger",
        description:
          error.response?.data?.message || "Failed to change password",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl min-h-full mb-24 mt-10">
      <h1 className="text-3xl font-bold mb-6">Change Password</h1>

      <Card>
        <CardHeader className="pb-0">
          <h2 className="text-xl font-semibold">Update Your Password</h2>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                type="password"
                label="Current Password"
                placeholder="Enter your current password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                fullWidth
              />
            </div>

            <div>
              <Input
                type="password"
                label="New Password"
                placeholder="Enter your new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                fullWidth
              />
            </div>

            <div>
              <Input
                type="password"
                label="Confirm New Password"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                fullWidth
              />
            </div>

            <div className="flex justify-end">
              <Button
                color="primary"
                type="submit"
                isDisabled={loading}
                isLoading={loading}
              >
                {loading ? "Changing Password..." : "Change Password"}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
