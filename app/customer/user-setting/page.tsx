"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Avatar } from "@heroui/avatar";
import { addToast } from "@heroui/toast";
import { Spinner } from "@heroui/spinner";
import { useSelector, useDispatch } from "react-redux";
import { useAuthData } from "@/hooks/useAuthData";
import axios from "axios";
import { setCredentials } from "@/lib/store/auth/authSlice";
import { RootState } from "@/lib/store/store";
import { AuthService } from "@/services/auth.service";
import { useProfileImage } from "@/hooks/useS3Image";
import Link from "next/link";

export default function UserSettingPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { imageUrl } = useProfileImage(user?.pp, user?.fullName || "");

  // Initialize form state from user data
  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setFullName(user.fullName || "");
      setPhone(user.phone || "");
    }
    setMounted(true);
  }, [user]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        addToast({
          title: "Error",
          color: "danger",
          description: "Image size exceeds 2MB limit",
        });
        return;
      }

      // Validate file type
      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!validTypes.includes(file.type)) {
        addToast({
          title: "Error",
          color: "danger",
          description: "Only JPG, PNG, GIF, and WebP files are accepted",
        });
        return;
      }

      setProfilePic(file);

      // Create preview URL
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("fullName", fullName);
      formData.append("phone", phone);
      if (profilePic) {
        formData.append("pp", profilePic);
      }

      const response = await axios.post("/api/setting/user-setting", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.status === "ok") {
        addToast({
          title: "Success",
          color: "success",
          description: "Profile updated successfully",
        });

        if (response.data.data) {
          const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
          const updatedUser = {
            ...currentUser,
            ...response.data.data,
          };

          // Update localStorage
          AuthService.updateUserData(updatedUser);

          // Refresh halaman untuk memuat ulang state dari localStorage
          window.location.reload();
        }
      } else {
        throw new Error(response.data.message || "Failed to update profile");
      }
    } catch (error: any) {
      console.error("Update profile error:", error);
      addToast({
        title: "Error",
        color: "danger",
        description:
          error.response?.data?.message || "Failed to update profile",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl min-h-full mb-24 mt-10">
      <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>

      <Card className="mb-6">
        <CardHeader className="pb-0">
          <h2 className="text-xl font-semibold">Personal Information</h2>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Profile Picture Section */}
              <div className="flex flex-col items-center space-y-4">
                <Avatar
                  size="lg"
                  src={previewUrl || imageUrl}
                  className="w-32 h-32 object-cover"
                  fallback={
                    user?.fullName?.charAt(0) || username?.charAt(0) || "U"
                  }
                />
                <div>
                  <Button
                    as="label"
                    color="primary"
                    variant="flat"
                    className="cursor-pointer"
                    size="sm"
                  >
                    Change Photo
                    <input
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handleFileChange}
                    />
                  </Button>
                </div>
              </div>

              {/* Form Fields Section */}
              <div className="flex-1 space-y-4">
                <div>
                  <Input
                    type="text"
                    label="Username"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    fullWidth
                  />
                </div>

                <div>
                  <Input
                    type="text"
                    label="Full Name"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    fullWidth
                  />
                </div>

                <div>
                  <Input
                    type="text"
                    label="Phone Number"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    fullWidth
                  />
                </div>

                <div>
                  <Input
                    type="email"
                    label="Email Address"
                    placeholder="Enter your email"
                    value={user?.email || ""}
                    disabled
                    fullWidth
                  />
                  <p className="text-xs text-default-500 mt-1">
                    Email address cannot be changed
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                color="primary"
                type="submit"
                isDisabled={loading}
                isLoading={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
            <div className="flex justify-start">
              <Link href="/customer/user-setting/change-password">
                <p className="text-blue-600 hover:text-blue-800 cursor-pointer text-sm px-3 py-5">
                  Reset Password ?
                </p>
              </Link>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
