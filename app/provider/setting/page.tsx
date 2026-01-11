"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useProfileImage } from "@/hooks/useS3Image";
import type { RootState } from "@/lib/store/store";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Spinner } from "@heroui/spinner";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { addToast } from "@heroui/toast";
import { Avatar } from "@heroui/avatar";
import {
  DocumentIcon,
  UserIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";

interface Provider {
  _id: string;
  name: string;
  description: string;
  address: string;
  city?: string;
  province?: string;
  pos?: string;
  logo?: string;
  contact: {
    email: string;
    phone: string;
  };
}

export default function ProviderSettingPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    pos: "",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  // Gunakan nama provider sebagai fallbackName untuk useProfileImage
  const { imageUrl: logoS3Url } = useProfileImage(
    provider?.logo,
    provider?.name || "Provider"
  );

  // Fetch provider data milik user dari /api/provider/dashboard
  useEffect(() => {
    const fetchProvider = async () => {
      setLoading(true);
      try {
        // 1. Ambil data user dari /api/provider/dashboard
        const dashboardRes = await axios.get("/api/provider/dashboard");
        console.log("Dashboard response full:", dashboardRes.data);

        if (dashboardRes.data?.status !== "ok") {
          setMessage("Gagal mengambil data user provider");
          setLoading(false);
          return;
        }

        // Cek apakah provider ada di data.provider._id atau data.user.provider
        let providerId;
        if (dashboardRes.data.data?.provider?._id) {
          providerId = dashboardRes.data.data.provider._id;
        } else if (dashboardRes.data.data?.user?.provider) {
          providerId = dashboardRes.data.data.user.provider;
        } else {
          setMessage("Provider ID tidak ditemukan di dashboard response");
          setLoading(false);
          return;
        }

        console.log("Provider ID to fetch:", providerId);

        // 2. Ambil detail provider dari /api/admin/providers?id=providerId
        const res = await axios.get(`/api/admin/providers`, {
          params: { id: providerId },
        });

        console.log("Provider detail response:", res.data);

        // Handle different response formats
        const responseData = res.data;

        if (responseData.status === "ok" && responseData.data) {
          // Check if there's nested error in successful response
          if (responseData.data.status === "error") {
            console.log("Nested error in response:", responseData.data);
            setMessage(responseData.data.message || "Provider tidak ditemukan");
          } else {
            // Response format: { status: "ok", data: {...} }
            const providerData = responseData.data;
            console.log("Provider data found:", providerData);
            setProvider(providerData);
            setEditForm({
              name: providerData.name || "",
              description: providerData.description || "",
              email: providerData.contact?.email || "",
              phone: providerData.contact?.phone || "",
              address: providerData.address || "",
              city: providerData.city || "",
              province: providerData.province || "",
              pos: providerData.pos || "",
            });
          }
        } else if (responseData.status === "error") {
          console.log("Direct error response:", responseData);
          setMessage(responseData.message || "Provider tidak ditemukan");
        } else {
          console.log("Unknown response format:", responseData);
          setMessage("Provider tidak ditemukan - unknown response format");
        }
      } catch (e: any) {
        console.error("Error fetching provider:", e);

        // Handle axios error responses
        if (e.response?.data) {
          const errorData = e.response.data;

          if (errorData.status === "error") {
            setMessage(errorData.message || "Gagal mengambil data provider");
          } else if (errorData.data && errorData.data.status === "error") {
            setMessage(
              errorData.data.message || "Gagal mengambil data provider"
            );
          } else {
            setMessage(
              "Gagal mengambil data provider: " +
                (errorData.message || e.message)
            );
          }
        } else {
          // Handle network or other errors
          setMessage("Gagal mengambil data provider: " + e.message);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProvider();
  }, []);

  // Handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle logo file
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      addToast({
        title: "Invalid File",
        color: "danger",
        description: "Please select an image file (JPG, PNG, GIF)",
      });
      setMessage("File harus berupa gambar");
      return;
    }

    if (file.size > 1 * 1024 * 1024) {
      addToast({
        title: "File Too Large",
        color: "danger",
        description: "Image size must be less than 1MB",
      });
      setMessage("Ukuran file maksimal 1MB");
      return;
    }

    setLogoFile(file);
    setMessage(null); // Clear any previous error messages

    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      if (!provider?._id) throw new Error("Provider tidak ditemukan");

      const formData = new FormData();
      formData.append("providerId", provider._id);
      formData.append("name", editForm.name);
      formData.append("description", editForm.description);
      formData.append("contact.email", editForm.email);
      formData.append("contact.phone", editForm.phone);
      formData.append("address", editForm.address);
      formData.append("city", editForm.city);
      formData.append("province", editForm.province);
      formData.append("pos", editForm.pos);

      if (logoFile) formData.append("logo", logoFile);

      const res = await axios.post("/api/admin/providers/edit", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Provider update response:", res.data);

      // Handle different response formats based on API route
      const responseData = res.data;

      // API route returns: { status: "ok", message: "Provider updated successfully", data: response.data }
      if (responseData.status === "ok") {
        // Check if backend response has nested error
        if (responseData.data && responseData.data.status === "error") {
          // Handle nested error from backend
          addToast({
            title: "Error",
            color: "danger",
            description:
              responseData.data.message || "Failed to update provider data",
          });
          setMessage(responseData.data.message || "Gagal update provider");
        } else if (responseData.data && responseData.data.error) {
          // Handle backend error format
          addToast({
            title: "Error",
            color: "danger",
            description:
              responseData.data.error || "Failed to update provider data",
          });
          setMessage(responseData.data.error || "Gagal update provider");
        } else {
          // Successful update
          addToast({
            title: "Success",
            color: "success",
            description:
              responseData.message || "Provider data updated successfully",
          });

          // Update local state with new data
          setProvider((prev) =>
            prev
              ? {
                  ...prev,
                  name: editForm.name,
                  description: editForm.description,
                  contact: {
                    email: editForm.email,
                    phone: editForm.phone,
                  },
                  address: editForm.address,
                  city: editForm.city,
                  province: editForm.province,
                  pos: editForm.pos,
                  // Update logo URL if new logo was uploaded
                  logo: responseData.data?.logo || prev.logo,
                }
              : prev
          );
          setLogoFile(null);
          setLogoPreview(null);
          setMessage("Data provider berhasil diperbarui");
        }
      } else if (responseData.status === "error") {
        // Handle direct error response from API route
        addToast({
          title: "Error",
          color: "danger",
          description: responseData.message || "Failed to update provider data",
        });
        setMessage(responseData.message || "Gagal update provider");
      } else {
        // Handle unknown response format
        addToast({
          title: "Error",
          color: "danger",
          description: "Unknown response format",
        });
        setMessage("Unknown response format");
      }
    } catch (e: any) {
      console.error("Error updating provider:", e);

      // Handle axios error responses
      if (e.response?.data) {
        const errorData = e.response.data;

        // Handle API route error format
        if (errorData.status === "error") {
          addToast({
            title: "Error",
            color: "danger",
            description: errorData.message || "An unexpected error occurred",
          });
          setMessage(errorData.message || "Gagal update provider");
        } else if (errorData.error) {
          // Handle direct error from backend
          addToast({
            title: "Error",
            color: "danger",
            description: errorData.error || "An unexpected error occurred",
          });
          setMessage(errorData.error || "Gagal update provider");
        } else {
          // Handle other error formats
          addToast({
            title: "Error",
            color: "danger",
            description: errorData.message || "An unexpected error occurred",
          });
          setMessage(errorData.message || "Gagal update provider");
        }
      } else {
        // Handle network or other errors
        addToast({
          title: "Error",
          color: "danger",
          description: e.message || "Network error occurred",
        });
        setMessage(e.message || "Network error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (!provider) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardBody className="text-center py-8">
          <div className="text-danger text-lg font-semibold mb-2">
            Provider tidak ditemukan
          </div>
          <div className="text-default-500">
            {message || "Tidak dapat menemukan data provider Anda"}
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <UserIcon className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-default-900">
              Provider Settings
            </h1>
            <p className="text-default-500">
              Manage your provider profile and information
            </p>
          </div>
        </div>
      </div>

      {/* Alert Message */}
      {message && (
        <Card className="border-l-4 border-l-primary">
          <CardBody className="py-3">
            <div className="flex items-center gap-3">
              <Chip
                color={message.includes("berhasil") ? "success" : "danger"}
                variant="flat"
                size="sm"
              >
                {message.includes("berhasil") ? "Success" : "Error"}
              </Chip>
              <span className="text-sm">{message}</span>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Profile Card */}
      <Card className="shadow-medium">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <Avatar
              src={logoPreview || logoS3Url || undefined}
              name={provider.name}
              size="lg"
              className="border-3 border-default-200"
            />
            <div>
              <h2 className="text-xl font-semibold text-default-900">
                {provider.name}
              </h2>
              <p className="text-default-500">{provider.contact?.email}</p>
            </div>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-default-800 mb-4 flex items-center gap-2">
                <BuildingOfficeIcon className="w-5 h-5 text-primary-500" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Provider Name"
                  name="name"
                  value={editForm.name}
                  onChange={handleChange}
                  placeholder="Enter provider name"
                  isRequired
                  variant="bordered"
                  labelPlacement="outside"
                  startContent={
                    <BuildingOfficeIcon className="w-4 h-4 text-default-400" />
                  }
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={editForm.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  isRequired
                  variant="bordered"
                  labelPlacement="outside"
                  startContent={
                    <EnvelopeIcon className="w-4 h-4 text-default-400" />
                  }
                />
                <Input
                  label="Phone Number"
                  name="phone"
                  value={editForm.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  isRequired
                  variant="bordered"
                  labelPlacement="outside"
                  startContent={
                    <PhoneIcon className="w-4 h-4 text-default-400" />
                  }
                />
              </div>
              <div className="mt-4">
                <Textarea
                  label="Description"
                  name="description"
                  value={editForm.description}
                  onChange={handleChange}
                  placeholder="Enter provider description"
                  variant="bordered"
                  labelPlacement="outside"
                  minRows={3}
                />
              </div>
            </div>

            <Divider />

            {/* Address Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-default-800 mb-4 flex items-center gap-2">
                <MapPinIcon className="w-5 h-5 text-primary-500" />
                Address Information
              </h3>
              <div className="space-y-4">
                <Input
                  label="Address"
                  name="address"
                  value={editForm.address}
                  onChange={handleChange}
                  placeholder="Enter complete address"
                  variant="bordered"
                  labelPlacement="outside"
                  startContent={
                    <MapPinIcon className="w-4 h-4 text-default-400" />
                  }
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="City"
                    name="city"
                    value={editForm.city}
                    onChange={handleChange}
                    placeholder="Enter city"
                    variant="bordered"
                    labelPlacement="outside"
                  />
                  <Input
                    label="Province"
                    name="province"
                    value={editForm.province}
                    onChange={handleChange}
                    placeholder="Enter province"
                    variant="bordered"
                    labelPlacement="outside"
                  />
                  <Input
                    label="Postal Code"
                    name="pos"
                    value={editForm.pos}
                    onChange={handleChange}
                    placeholder="Enter postal code"
                    variant="bordered"
                    labelPlacement="outside"
                  />
                </div>
              </div>
            </div>

            <Divider />

            {/* Logo Section */}
            <div>
              <h3 className="text-lg font-semibold text-default-800 mb-4 flex items-center gap-2">
                <PhotoIcon className="w-5 h-5 text-primary-500" />
                Logo
              </h3>
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-default-600">
                    Upload Logo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="block w-full text-sm text-default-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 file:cursor-pointer"
                  />
                  <div className="text-xs text-default-400">
                    Maximum file size: 1MB. Supported formats: JPG, PNG, GIF
                  </div>
                </div>

                {(logoPreview || logoS3Url) && (
                  <div className="flex items-center gap-4 p-4 bg-default-50 rounded-lg">
                    <img
                      src={logoPreview || logoS3Url}
                      alt="Logo Preview"
                      className="w-20 h-20 rounded-lg object-cover border-2 border-default-200"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-default-700">
                        {logoPreview ? "New Logo Preview" : "Current Logo"}
                      </div>
                      <div className="text-xs text-default-500 mt-1">
                        {logoPreview
                          ? "This will be uploaded when you save"
                          : "Current logo from server"}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="submit"
                color="primary"
                isLoading={isSubmitting}
                disabled={isSubmitting}
                className="px-8"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
