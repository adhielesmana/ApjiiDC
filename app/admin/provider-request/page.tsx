"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import axios from "axios";
import { addToast } from "@heroui/toast";
import { Input } from "@heroui/input";
import { Tabs, Tab } from "@heroui/tabs";
import { Skeleton } from "@heroui/skeleton";
import { Pagination } from "@heroui/pagination";
import { Select, SelectItem } from "@heroui/select";
import { Textarea } from "@heroui/input";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useS3Image } from "@/hooks/useS3Image";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";

interface Provider {
  name: string;
  _id: string;
  contact: {
    email: string;
    phone: string;
  };
  description: string;
  address: string;
  city?: string;
  province?: string;
  pos?: string;
  logo?: string;
  _isActive?: boolean;
  status?: string; // Updated field with possible values: "in review", "granted"
}

// Add interface for pagination from backend
interface PaginationData {
  total: number;
  page: string;
  limit: number;
  pages: number;
}

export default function AdminProvidersPage() {
  const router = useRouter();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activatingProvider, setActivatingProvider] = useState<string | null>(
    null
  );
  const [deactivatingProvider, setDeactivatingProvider] = useState<
    string | null
  >(null);

  // Update pagination states for server-side pagination
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // Add state for backend pagination data
  const [paginationData, setPaginationData] = useState<PaginationData>({
    total: 0,
    page: "1",
    limit: 10,
    pages: 1,
  });

  // Edit Provider Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Add state for S3 image
  const [currentLogoKey, setCurrentLogoKey] = useState<string | undefined>(
    undefined
  );
  const { imageUrl: logoS3Url, isLoading: isLogoLoading } =
    useS3Image(currentLogoKey);

  // Edit form data state
  const [editFormData, setEditFormData] = useState<{
    providerId: string;
    name: string;
    description: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    pos: string;
  }>({
    providerId: "",
    name: "",
    description: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    pos: "",
  });

  // Add state for confirmation dialog
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [providerToDeactivate, setProviderToDeactivate] = useState<{
    id: string;
    name: string;
    isActive: boolean;
  } | null>(null);

  // Add state for the provider to activate (for initial activation)
  const [providerToActivate, setProviderToActivate] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      // Update API call to include pagination parameters
      const response = await axios.get("/api/admin/providers", {
        params: {
          page,
          limit: rowsPerPage,
        },
      });

      if (response.data.status === "ok") {
        setProviders(response.data.data || []);

        // Store pagination data from backend
        if (response.data.pagination) {
          setPaginationData(response.data.pagination);
        }
      }
    } catch (error: any) {
      addToast({
        title: "Error",
        color: "danger",
        description: "Failed to fetch Providers",
      });
    } finally {
      setLoading(false);
    }
  };

  // Refetch providers when page or rowsPerPage changes
  useEffect(() => {
    fetchProviders();
  }, [page, rowsPerPage]);

  // Initial data fetch
  useEffect(() => {
    fetchProviders();
  }, []);

  // Filter providers based on activeTab and search query - but don't paginate client-side
  const filteredProviders = providers.filter((provider) => {
    if (activeTab === "active" && provider.status !== "granted") {
      return false;
    }
    if (activeTab === "inactive" && provider.status !== "in review") {
      return false;
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        provider.name.toLowerCase().includes(query) ||
        provider.description.toLowerCase().includes(query) ||
        provider.address.toLowerCase().includes(query) ||
        provider.contact.email.toLowerCase().includes(query) ||
        provider.contact.phone.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // When activeTab or searchQuery changes, reset to page 1 and apply filters
  useEffect(() => {
    setPage(1);
    // If using filters, we may need to refetch with those filters
    // This would require updating your backend to accept filter parameters
    fetchProviders();
  }, [activeTab, searchQuery]);

  // Handle provider activation/deactivation
  const handleToggleActivation = async (
    providerId: string,
    currentActiveState: boolean
  ) => {
    try {
      setDeactivatingProvider(providerId);
      const response = await axios.post("/api/admin/providers/activate", {
        id: providerId,
        active: !currentActiveState,
      });

      if (response.data.status === "ok") {
        addToast({
          title: "Success",
          color: "success",
          description: currentActiveState
            ? "Partner deactivated successfully"
            : "Partner activated successfully",
        });
        fetchProviders(); // Refresh the list
      } else {
        addToast({
          title: "Error",
          color: "danger",
          description: `Failed to ${currentActiveState ? "deactivate" : "activate"} partner`,
        });
      }
    } catch (error: any) {
      console.error("Error toggling provider activation:", error);
      addToast({
        title: "Error",
        color: "danger",
        description:
          error.response?.data?.message ||
          `Failed to ${currentActiveState ? "deactivate" : "activate"} partner`,
      });
    } finally {
      setDeactivatingProvider(null);
    }
  };

  const getStatusColor = (grantStatus: string) => {
    switch (grantStatus) {
      case "granted":
        return "success";
      case "in review":
        return "warning";
      case "rejected":
        return "danger";
      default:
        return "default";
    }
  };

  // Update the status counts logic
  const statusCounts = {
    all: paginationData.total || providers.length,
    active: providers.filter((provider) => provider.status === "granted")
      .length,
    inactive: providers.filter((provider) => provider.status === "in review")
      .length,
  };

  // Open edit modal and populate form
  const handleOpenEditModal = (provider: Provider) => {
    setSelectedProvider(provider);
    setEditFormData({
      providerId: provider._id,
      name: provider.name,
      description: provider.description || "",
      email: provider.contact.email || "",
      phone: provider.contact.phone || "",
      address: provider.address || "",
      city: provider.city || "",
      province: provider.province || "",
      pos: provider.pos || "",
    });

    // Set logo key for S3 image retrieval
    setCurrentLogoKey(provider.logo);

    // Set logo preview if it's a local file, otherwise S3 will handle it
    if (
      provider.logo &&
      (provider.logo.startsWith("blob:") || provider.logo.startsWith("data:"))
    ) {
      setLogoPreview(provider.logo);
    } else if (provider.logo) {
      // Let S3 hook handle the loading - we'll use logoS3Url when rendering
      setLogoPreview(null);
    } else {
      setLogoPreview(null);
    }

    setLogoFile(null); // Reset logo file when opening modal
    setIsEditModalOpen(true);
  };

  // Handle logo file selection
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      addToast({
        title: "Error",
        color: "danger",
        description: "File harus berupa gambar (JPG, PNG, etc.)",
      });
      return;
    }

    // Check file size (limit to 1MB)
    const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB
    if (file.size > MAX_FILE_SIZE) {
      addToast({
        title: "Error",
        color: "danger",
        description: `Ukuran file tidak boleh lebih dari ${MAX_FILE_SIZE / (1024 * 1024)}MB. File yang dipilih: ${(file.size / (1024 * 1024)).toFixed(2)}MB`,
      });
      return;
    }

    setLogoFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    addToast({
      title: "Logo dipilih",
      color: "success",
      description: `File ${file.name} (${(file.size / 1024).toFixed(2)}KB) berhasil dipilih`,
    });
  };

  // Handle edit form input changes
  const handleEditInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Reset edit form when modal closes
  const handleEditModalClose = () => {
    setSelectedProvider(null);
    setLogoFile(null);
    setLogoPreview(null);
    setIsEditModalOpen(false);
  };

  // Handle edit form submission
  const handleEditSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Basic validation
      if (!editFormData.name.trim()) {
        throw new Error("Nama partner harus diisi");
      }

      if (!isValidEmail(editFormData.email)) {
        throw new Error("Format email tidak valid");
      }

      // if (!isValidPhone(editFormData.phone)) {
      //   throw new Error(
      //     "Format nomor telepon tidak valid (gunakan format: 08xx atau +62xx)"
      //   );
      // }

      // Create FormData object for multipart/form-data submission
      const formDataObj = new FormData();

      // Add all form fields
      formDataObj.append("providerId", editFormData.providerId);
      formDataObj.append("name", editFormData.name);
      formDataObj.append("description", editFormData.description);
      formDataObj.append("contact.email", editFormData.email.trim());
      formDataObj.append(
        "contact.phone",
        editFormData.phone.trim().replace(/\s+/g, "")
      );
      formDataObj.append("address", editFormData.address);
      formDataObj.append("city", editFormData.city);
      formDataObj.append("province", editFormData.province);
      formDataObj.append("pos", editFormData.pos);

      // Add logo file if exists
      if (logoFile) {
        formDataObj.append("logo", logoFile);
      }

      // Add toast to inform user the upload is in progress
      if (logoFile) {
        addToast({
          title: "Mengunggah Data",
          color: "default",
          description: `Sedang mengunggah logo (${(logoFile.size / 1024).toFixed(2)}KB), mohon tunggu...`,
        });
      }

      const response = await axios.post(
        "/api/admin/providers/edit",
        formDataObj,
        {
          headers: {
            // Don't set Content-Type here, it will be set automatically with the boundary
          },
          onUploadProgress: (progressEvent) => {
            // Calculate and show upload progress if needed
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              console.log(`Upload Progress: ${percentCompleted}%`);
            }
          },
        }
      );

      if (response.data.status === "ok" || response.data.success === true) {
        addToast({
          title: "Success",
          color: "success",
          description: "Provider updated successfully",
        });
        // Reset form and close modal
        handleEditModalClose();

        // Refresh providers list
        fetchProviders();
      } else {
        addToast({
          title: "Error",
          color: "danger",
          description: response.data.message || "Failed to update provider",
        });
      }
    } catch (error: any) {
      console.error("Error updating provider:", error);
      addToast({
        title: "Error",
        color: "danger",
        description: error.message || "Failed to update provider",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhone = (phone: string) => {
    const phoneRegex = /^(?:\+62|08)[0-9]{9,13}$/;
    return phoneRegex.test(phone);
  };

  // Modify to show confirmation dialog first
  const showDeactivateConfirmation = (provider: Provider) => {
    setProviderToDeactivate({
      id: provider._id,
      name: provider.name,
      isActive: provider._isActive === true,
    });
    setIsConfirmDialogOpen(true);
  };

  // Modified to show confirmation dialog first
  const showActivationConfirmation = (provider: Provider) => {
    setProviderToActivate({
      id: provider._id,
      name: provider.name,
    });
    setIsConfirmDialogOpen(true);
  };

  // Actual activation function (renamed from handleActivation)
  const executeActivation = async (providerId: string) => {
    try {
      setActivatingProvider(providerId);
      const response = await axios.post(
        `/api/admin/grant-provider/${providerId}`
      );
      if (response.data.status === "ok") {
        addToast({
          title: "Success",
          color: "success",
          description: "Partner activated successfully",
        });
        fetchProviders();
      }
    } catch (error: any) {
      addToast({
        title: "Error",
        color: "danger",
        description: "Failed to grant partner access",
      });
    } finally {
      setActivatingProvider(null);
    }
  };

  // Existing toggle function renamed to actually perform the action
  const executeToggleActivation = async (
    providerId: string,
    currentActiveState: boolean
  ) => {
    try {
      setDeactivatingProvider(providerId);
      const response = await axios.post("/api/admin/providers/activate", {
        id: providerId,
        active: !currentActiveState,
      });

      if (response.data.status === "ok") {
        addToast({
          title: "Success",
          color: "success",
          description: currentActiveState
            ? "Partner deactivated successfully"
            : "Partner activated successfully",
        });
        fetchProviders(); // Refresh the list
      } else {
        addToast({
          title: "Error",
          color: "danger",
          description: `Failed to ${currentActiveState ? "deactivate" : "activate"} partner`,
        });
      }
    } catch (error: any) {
      console.error("Error toggling provider activation:", error);
      addToast({
        title: "Error",
        color: "danger",
        description:
          error.response?.data?.message ||
          `Failed to ${currentActiveState ? "deactivate" : "activate"} partner`,
      });
    } finally {
      setDeactivatingProvider(null);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header Section with Gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-lg overflow-hidden mb-8">
        <div className="px-8 py-10 text-white">
          <h1 className="text-3xl font-bold mb-3">Partners</h1>
          <div className="opacity-90 max-w-2xl mb-6">
            Manage partner activation requests. Review and approve partner
            applications to join the platform.
          </div>

          <Button
            color="default"
            className="bg-white text-blue-700 font-medium px-6 py-3 rounded-xl hover:bg-blue-50 flex items-center gap-2 shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
            onPress={fetchProviders}
            startContent={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                  clipRule="evenodd"
                />
              </svg>
            }
          >
            Refresh Partners
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between bg-white p-4 rounded-xl shadow-sm mb-6">
        <Tabs
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as string)}
          color="primary"
          variant="underlined"
          classNames={{
            tabList: "gap-6",
            cursor: "w-full bg-blue-500",
            tab: "max-w-fit px-0 h-12",
          }}
        >
          <Tab
            key="all"
            title={
              <div className="flex items-center gap-2">
                <span>All Partners</span>
                <Chip
                  size="sm"
                  variant="flat"
                  color="default"
                  classNames={{
                    base: "bg-gray-100 text-gray-800",
                    content: "font-medium text-xs",
                  }}
                >
                  {statusCounts.all}
                </Chip>
              </div>
            }
          />
          <Tab
            key="active"
            title={
              <div className="flex items-center gap-2">
                <span>Active</span>
                <Chip
                  size="sm"
                  variant="flat"
                  color="success"
                  classNames={{
                    base: "bg-green-100 text-green-800",
                    content: "font-medium text-xs",
                  }}
                >
                  {statusCounts.active}
                </Chip>
              </div>
            }
          />
          <Tab
            key="inactive"
            title={
              <div className="flex items-center gap-2">
                <span>Requests</span>
                <Chip
                  size="sm"
                  variant="flat"
                  color="warning"
                  classNames={{
                    base: "bg-yellow-100 text-yellow-800",
                    content: "font-medium text-xs",
                  }}
                >
                  {statusCounts.inactive}
                </Chip>
              </div>
            }
          />
        </Tabs>

        <div className="w-full md:max-w-xs">
          <Input
            placeholder="Search partners..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            isClearable
            onClear={() => setSearchQuery("")}
            startContent={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            }
          />
        </div>
      </div>

      <div className="space-y-6">
        {loading ? (
          // Skeleton loading state
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card
                key={i}
                className="border-0 shadow-md rounded-xl overflow-hidden"
              >
                <CardBody>
                  <Skeleton className="h-6 w-1/3 rounded mb-4" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Skeleton className="h-4 w-3/4 rounded mb-2" />
                      <Skeleton className="h-4 w-1/2 rounded" />
                    </div>
                    <div>
                      <Skeleton className="h-4 w-3/4 rounded mb-2" />
                      <Skeleton className="h-4 w-1/2 rounded" />
                    </div>
                    <div>
                      <Skeleton className="h-4 w-3/4 rounded mb-2" />
                      <Skeleton className="h-4 w-1/2 rounded" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        ) : filteredProviders.length === 0 ? (
          <Card className="border-0 shadow-md rounded-xl overflow-hidden">
            <CardBody className="p-0">
              <div className="text-center py-16 px-6">
                <div className="bg-blue-50 rounded-full p-4 inline-block mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-700 mb-2">
                  No Partners Found
                </h3>
                <p className="text-gray-500 mb-4 max-w-md mx-auto">
                  No partners matching your criteria were found. Try adjusting
                  your filters or check back later.
                </p>
              </div>
            </CardBody>
          </Card>
        ) : (
          <Card className="border-0 shadow-md rounded-xl overflow-hidden">
            <CardBody className="border-0 p-0">
              <Table
                aria-label="Partners table"
                removeWrapper
                classNames={{
                  base: "min-h-[400px]",
                  table: "min-w-full",
                  thead: "bg-gray-50",
                  th: "text-xs font-semibold text-default-500 bg-gray-50 px-4 py-3",
                  tbody: "divide-y divide-gray-200",
                  tr: "hover:bg-gray-50/60 transition-colors",
                  td: "px-4 py-3 whitespace-normal",
                }}
              >
                <TableHeader>
                  <TableColumn width={200}>PARTNER NAME</TableColumn>
                  <TableColumn width={180}>CONTACT INFO</TableColumn>
                  <TableColumn width={180}>LOCATION</TableColumn>
                  <TableColumn width={220}>DESCRIPTION</TableColumn>
                  <TableColumn width={140}>STATUS</TableColumn>
                  <TableColumn width={200} align="center">
                    ACTIONS
                  </TableColumn>
                </TableHeader>
                <TableBody emptyContent="No partners found">
                  {/* Use filteredProviders directly without client-side pagination */}
                  {filteredProviders.map((provider) => (
                    <TableRow key={provider._id}>
                      <TableCell>
                        <div className="font-medium text-sm">
                          {provider.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-xs flex items-center gap-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3.5 w-3.5 text-blue-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                            <span>{provider.contact.email}</span>
                          </div>
                          <div className="text-xs flex items-center gap-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3.5 w-3.5 text-green-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                              />
                            </svg>
                            <span>{provider.contact.phone}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-gray-600 line-clamp-2 flex items-start gap-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3.5 w-3.5 text-gray-500 mt-0.5 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <span>{provider.address}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-gray-600 line-clamp-3">
                          {provider.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1.5">
                          {/* Status chip - updated to use status with meaningful labels */}
                          <Chip
                            color={getStatusColor(provider.status || "") as any}
                            size="sm"
                            variant="flat"
                            classNames={{
                              base: "border border-transparent max-w-[110px]",
                              content: "font-medium text-xs px-1.5",
                            }}
                          >
                            {provider.status === "granted"
                              ? "Approved"
                              : provider.status === "in review"
                                ? "Pending Review"
                                : "Unknown"}
                          </Chip>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          {/* Show Initial Activate button for providers with status = "in review" */}
                          {provider.status === "in review" && (
                            <Button
                              color="primary"
                              size="sm"
                              className="bg-blue-500 text-white"
                              isLoading={activatingProvider === provider._id}
                              isDisabled={activatingProvider === provider._id}
                              onPress={() =>
                                showActivationConfirmation(provider)
                              }
                              startContent={
                                !activatingProvider && (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                )
                              }
                            >
                              {activatingProvider === provider._id
                                ? "Activating..."
                                : "Initial Activate"}
                            </Button>
                          )}

                          {/* Show Edit and Activate/Deactivate buttons for providers with status = "granted" */}
                          {provider.status === "granted" && (
                            <>
                              {/* Edit button */}
                              <Button
                                color="primary"
                                size="sm"
                                variant="flat"
                                className="bg-blue-100 text-blue-700"
                                onPress={() => handleOpenEditModal(provider)}
                                startContent={
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                  </svg>
                                }
                              >
                                Edit
                              </Button>

                              {/* Activate/Deactivate button */}
                              <Button
                                color={
                                  provider._isActive ? "danger" : "success"
                                }
                                size="sm"
                                variant="flat"
                                className={
                                  provider._isActive
                                    ? "bg-red-100 text-red-700"
                                    : "bg-green-100 text-green-700"
                                }
                                isLoading={
                                  deactivatingProvider === provider._id
                                }
                                isDisabled={
                                  deactivatingProvider === provider._id
                                }
                                onPress={() =>
                                  showDeactivateConfirmation(provider)
                                }
                                startContent={
                                  !deactivatingProvider && (
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-4 w-4"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      {provider._isActive ? (
                                        <path
                                          fillRule="evenodd"
                                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                          clipRule="evenodd"
                                        />
                                      ) : (
                                        <path
                                          fillRule="evenodd"
                                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                          clipRule="evenodd"
                                        />
                                      )}
                                    </svg>
                                  )
                                }
                              >
                                {deactivatingProvider === provider._id
                                  ? "Processing..."
                                  : provider._isActive
                                    ? "Deactivate"
                                    : "Activate"}
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Update Pagination Component to use backend pagination data */}
              <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 sm:px-6">
                <div className="text-sm text-gray-500 mb-3 sm:mb-0">
                  Showing{" "}
                  <span className="font-medium">
                    {providers.length > 0
                      ? (parseInt(paginationData.page) - 1) *
                          paginationData.limit +
                        1
                      : 0}
                  </span>
                  {" - "}
                  <span className="font-medium">
                    {Math.min(
                      parseInt(paginationData.page) * paginationData.limit,
                      paginationData.total
                    )}
                  </span>
                  {" of "}
                  <span className="font-medium">
                    {paginationData.total}
                  </span>{" "}
                  partners
                </div>

                <div className="flex justify-center">
                  <Pagination
                    total={paginationData.pages}
                    page={parseInt(paginationData.page)}
                    onChange={(newPage) => setPage(newPage)}
                    size="sm"
                    showControls
                    classNames={{
                      wrapper: "gap-1",
                      item: "w-8 h-8 text-sm",
                      cursor: "bg-blue-600 text-white font-medium",
                    }}
                  />
                </div>

                <div className="hidden sm:block w-32">
                  <Select
                    size="sm"
                    label="Rows"
                    value={rowsPerPage.toString()}
                    onChange={(e) => {
                      const newRowsPerPage = Number(e.target.value);
                      setRowsPerPage(newRowsPerPage);
                      setPage(1); // Reset to first page when changing rows per page
                    }}
                    className="max-w-xs"
                  >
                    <SelectItem key="5">5</SelectItem>
                    <SelectItem key="10">10</SelectItem>
                    <SelectItem key="15">15</SelectItem>
                    <SelectItem key="20">20</SelectItem>
                    <SelectItem key="25">25</SelectItem>
                  </Select>
                </div>
              </div>
            </CardBody>
          </Card>
        )}
      </div>

      {/* Edit Provider Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) handleEditModalClose();
        }}
        scrollBehavior="inside"
        size="3xl"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h2 className="text-xl font-bold">Edit Partner</h2>
            <p className="text-sm text-gray-500">
              Update partner information and details.
            </p>
          </ModalHeader>

          <ModalBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="Partner Name"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditInputChange}
                  placeholder="Enter partner name"
                  isRequired
                  variant="bordered"
                  labelPlacement="outside"
                />
              </div>

              {/* Logo Upload Section */}
              <div className="md:col-span-2 space-y-2">
                <label className="block text-base font-medium mb-2">
                  Logo Partner
                </label>
                <div className="flex flex-col space-y-4">
                  {/* Show logo from S3 or local preview */}
                  {(logoPreview || logoS3Url) && (
                    <div className="relative w-32 h-32 mx-auto border rounded-lg overflow-hidden bg-gray-100 shadow-md">
                      <Image
                        src={logoPreview || logoS3Url}
                        alt="Logo Preview"
                        fill
                        style={{ objectFit: "contain" }}
                      />
                    </div>
                  )}

                  {/* Show loading state for S3 images */}
                  {isLogoLoading && !logoPreview && (
                    <div className="flex justify-center items-center h-32">
                      <Skeleton className="w-32 h-32 rounded-lg" />
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-3 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-primary-50 file:text-primary-700
                      hover:file:bg-primary-100 
                      cursor-pointer"
                  />
                  <p className="text-sm text-gray-500">
                    Upload a new logo (format JPG/PNG, max 2MB) or keep existing
                  </p>
                </div>
              </div>

              <div className="md:col-span-2">
                <Textarea
                  label="Description"
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditInputChange}
                  placeholder="Enter description"
                  minRows={3}
                  variant="bordered"
                  labelPlacement="outside"
                />
              </div>

              <div>
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={editFormData.email}
                  onChange={handleEditInputChange}
                  placeholder="Enter email address"
                  isRequired
                  variant="bordered"
                  labelPlacement="outside"
                />
              </div>

              <div>
                <Input
                  label="Phone Number"
                  name="phone"
                  value={editFormData.phone}
                  onChange={handleEditInputChange}
                  placeholder="Enter phone number"
                  isRequired
                  variant="bordered"
                  labelPlacement="outside"
                />
              </div>

              <div>
                <Input
                  label="City"
                  name="city"
                  value={editFormData.city}
                  onChange={handleEditInputChange}
                  placeholder="Enter city"
                  variant="bordered"
                  labelPlacement="outside"
                />
              </div>

              <div>
                <Input
                  label="Province"
                  name="province"
                  value={editFormData.province}
                  onChange={handleEditInputChange}
                  placeholder="Enter province"
                  variant="bordered"
                  labelPlacement="outside"
                />
              </div>

              <div>
                <Input
                  label="Postal Code"
                  name="pos"
                  value={editFormData.pos}
                  onChange={handleEditInputChange}
                  placeholder="Enter postal code"
                  variant="bordered"
                  labelPlacement="outside"
                />
              </div>

              <div className="md:col-span-2">
                <Textarea
                  label="Address"
                  name="address"
                  value={editFormData.address}
                  onChange={handleEditInputChange}
                  placeholder="Enter full address"
                  variant="bordered"
                  labelPlacement="outside"
                />
              </div>
            </div>
          </ModalBody>

          <ModalFooter>
            <Button
              color="default"
              variant="flat"
              onPress={handleEditModalClose}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleEditSubmit}
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              Update Partner
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add Confirmation Dialog Modal */}
      <Modal
        isOpen={isConfirmDialogOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) setIsConfirmDialogOpen(false);
        }}
        size="sm"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold">
              {providerToDeactivate?.isActive
                ? "Deactivate Provider"
                : providerToDeactivate
                  ? "Activate Provider"
                  : "Initial Activation"}
            </h3>
          </ModalHeader>
          <ModalBody>
            {providerToDeactivate?.isActive ? (
              <div className="py-2">
                <p>
                  Are you sure you want to deactivate{" "}
                  <span className="font-semibold">
                    {providerToDeactivate?.name}
                  </span>
                  ?
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Deactivated providers will not be able to access the system or
                  provide services.
                </p>
              </div>
            ) : providerToDeactivate ? (
              <div className="py-2">
                <p>
                  Are you sure you want to activate{" "}
                  <span className="font-semibold">
                    {providerToDeactivate?.name}
                  </span>
                  ?
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Activated providers will be able to access the system and
                  provide services.
                </p>
              </div>
            ) : (
              <div className="py-2">
                <p>
                  Are you sure you want to grant initial activation to{" "}
                  <span className="font-semibold">
                    {providerToActivate?.name}
                  </span>
                  ?
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  This provider will be approved and able to access the system
                  and provide services.
                </p>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              color="default"
              variant="flat"
              onPress={() => setIsConfirmDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              color={providerToDeactivate?.isActive ? "danger" : "success"}
              onPress={() => {
                if (providerToDeactivate) {
                  executeToggleActivation(
                    providerToDeactivate.id,
                    providerToDeactivate.isActive
                  );
                  setIsConfirmDialogOpen(false);
                } else if (providerToActivate) {
                  executeActivation(providerToActivate.id);
                  setIsConfirmDialogOpen(false);
                }
              }}
              className={
                providerToDeactivate?.isActive
                  ? "bg-red-500 text-white"
                  : "bg-green-500 text-white"
              }
            >
              {providerToDeactivate?.isActive
                ? "Yes, Deactivate"
                : providerToDeactivate
                  ? "Yes, Activate"
                  : "Yes, Grant Access"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
