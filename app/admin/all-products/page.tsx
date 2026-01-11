"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Pagination } from "@heroui/pagination";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import axios from "axios";
import { addToast } from "@heroui/toast";
import {
  Building,
  Image,
  Loader2,
  Search,
  ChevronDown,
  Plus,
  Check,
  X,
  Pencil,
} from "lucide-react";
import { Card, CardBody } from "@heroui/card";
import { HiCube } from "react-icons/hi";
import { Switch } from "@heroui/switch";

interface Space {
  _id: string;
  name: string;
  description: string;
  size: string;
  price: number;
  images: string[];
  provider: {
    _id: string;
    name: string;
    contact?: {
      email: string;
      phone: string;
    };
    description?: string;
    province?: string;
    city?: string;
    address?: string;
    logo?: string;
  };
  datacenter: {
    _id: string;
    name: string;
    address: string;
    coordinate?: string;
    description?: string;
  };
  _addedBy: {
    _id: string;
    username: string;
    fullName: string;
    email: string;
  };
  publish: boolean;
  createdAt: string;
  updatedAt: string;
  paymentPlan?: {
    monthly?: number;
    quarterly?: number;
    annually?: number;
  };
}

export default function AdminProducts() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false); // Separate loading for table updates
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    size: "",
    price: "",
    datacenter: "",
    enableDiscount: false,
    quarterlyDiscount: "",
    annuallyDiscount: "",
  });
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterValue, setFilterValue] = useState("");

  // New pagination state from API
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsCount: 0,
  });

  // Add new state variables
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    size: "",
    price: "",
    datacenter: "",
  });
  const [editSelectedFiles, setEditSelectedFiles] = useState<FileList | null>(
    null
  );
  const [images, setImages] = useState<string[]>([]);

  // Filter states
  const [providerFilter, setProviderFilter] = useState("");
  const [datacenterFilter, setDatacenterFilter] = useState("");
  const [filterOptions, setFilterOptions] = useState({
    providers: [] as Array<{ _id: string; name: string }>,
    datacenters: [] as Array<{ _id: string; name: string }>,
  });

  const fetchFilterOptions = async () => {
    try {
      // Only fetch if we don't have filter options yet
      if (
        filterOptions.providers.length > 0 &&
        filterOptions.datacenters.length > 0
      ) {
        return;
      }

      // Fetch a larger set to get all providers and datacenters for filters
      const response = await axios.get("/api/admin/space/list?limit=1000");
      if (response.data.status === "ok") {
        const data = response.data.data || [];
        const uniqueProviders = Array.from(
          new Map(
            data
              .filter((space: Space) => space.provider != null)
              .map((space: Space) => [space.provider._id, space.provider])
          ).values()
        ) as Array<{ _id: string; name: string }>;
        const uniqueDatacenters = Array.from(
          new Map(
            data
              .map((space: Space) => [space.datacenter?._id, space.datacenter])
              .filter(
                (
                  entry: any
                ): entry is [
                  string,
                  { _id: string; name: string; address: string },
                ] => entry[0] !== undefined && entry[1] !== undefined
              )
          ).values()
        ) as Array<{ _id: string; name: string }>;

        setFilterOptions({
          providers: uniqueProviders,
          datacenters: uniqueDatacenters,
        });
      }
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  };

  const fetchSpaces = async (
    filters: {
      page?: number;
      limit?: number;
      provider?: string;
      datacenter?: string;
      search?: string;
    } = {},
    isInitialLoad = false
  ) => {
    try {
      if (isInitialLoad) {
        setLoading(true);
      } else {
        setTableLoading(true);
      }

      // Build query parameters
      const params = new URLSearchParams();
      params.append("page", (filters.page || page).toString());
      params.append("limit", (filters.limit || rowsPerPage).toString());

      if (filters.provider || providerFilter) {
        params.append("provider", filters.provider || providerFilter);
      }
      if (filters.datacenter || datacenterFilter) {
        params.append("datacenter", filters.datacenter || datacenterFilter);
      }
      if (filters.search || filterValue) {
        params.append("search", filters.search || filterValue);
      }

      const response = await axios.get(
        `/api/admin/space/list?${params.toString()}`
      );

      if (response.data.status === "ok") {
        const { data, total, pages, page: currentPage, count } = response.data;

        setSpaces(Array.isArray(data) ? data : []);
        setPagination({
          currentPage,
          totalPages: pages,
          totalItems: total,
          itemsCount: count,
        });

        // Update filter options when fetching initial data (page 1 without filters)
        if (
          currentPage === 1 &&
          !filters.provider &&
          !filters.datacenter &&
          !filters.search
        ) {
          const uniqueProviders = Array.from(
            new Map(
              data
                .filter((space: Space) => space.provider != null)
                .map((space: Space) => [space.provider._id, space.provider])
            ).values()
          ) as Array<{ _id: string; name: string }>;
          const uniqueDatacenters = Array.from(
            new Map(
              data
                .map((space: Space) => [
                  space.datacenter?._id,
                  space.datacenter,
                ])
                .filter(
                  (
                    entry: any
                  ): entry is [
                    string,
                    { _id: string; name: string; address: string },
                  ] => entry[0] !== undefined && entry[1] !== undefined
                )
            ).values()
          ) as Array<{ _id: string; name: string }>;

          setFilterOptions({
            providers: uniqueProviders,
            datacenters: uniqueDatacenters,
          });
        }
      } else {
        setSpaces([]);
        if (isInitialLoad) {
          addToast({
            title: "Warning",
            color: "warning",
            description: response.data.message || "No spaces found",
          });
        }
      }
    } catch (error: any) {
      console.error("Error fetching spaces:", error);
      setSpaces([]);
      if (isInitialLoad) {
        addToast({
          title: "Error",
          color: "danger",
          description: error.response?.data?.message || "Failed to load spaces",
        });
      }
    } finally {
      setLoading(false);
      setTableLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchFilterOptions();
    fetchSpaces({}, true); // Initial load
  }, []);

  // Handle filter changes (not initial load)
  useEffect(() => {
    if (loading) return; // Skip if still in initial loading

    const currentFilters = {
      page,
      limit: rowsPerPage,
      provider: providerFilter,
      datacenter: datacenterFilter,
      search: filterValue,
    };

    fetchSpaces(currentFilters, false);
  }, [page, rowsPerPage, providerFilter, datacenterFilter]);

  // Debounced search effect
  useEffect(() => {
    if (loading) return; // Skip if still in initial loading

    const timer = setTimeout(() => {
      if (page !== 1) {
        setPage(1); // Reset to first page when searching
      } else {
        fetchSpaces({ search: filterValue }, false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [filterValue]);

  console.log("Spaces fetched:", spaces);
  console.log("Pagination:", pagination);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formPayload = new FormData();

      if (
        !formData.datacenter ||
        !formData.name ||
        !formData.size ||
        !formData.price
      ) {
        addToast({
          title: "Warning",
          color: "warning",
          description: "Please fill in all required fields",
        });
        return;
      }
      formPayload.append("datacenter", formData.datacenter);
      formPayload.append("name", formData.name);
      formPayload.append("description", formData.description);
      formPayload.append("size", formData.size.toString());
      formPayload.append("price", formData.price.toString()); // Add payment plan data if discount is enabled
      if (formData.enableDiscount) {
        try {
          // Create a simpler payment plan object structure
          let planObj: any = {};

          // Only add fields with valid values
          if (
            formData.quarterlyDiscount &&
            formData.quarterlyDiscount.trim() !== ""
          ) {
            const qValue = parseInt(formData.quarterlyDiscount);
            if (!isNaN(qValue) && qValue >= 0 && qValue <= 100) {
              planObj.quarterly = qValue;
            }
          }

          if (
            formData.annuallyDiscount &&
            formData.annuallyDiscount.trim() !== ""
          ) {
            const aValue = parseInt(formData.annuallyDiscount);
            if (!isNaN(aValue) && aValue >= 0 && aValue <= 100) {
              planObj.annually = aValue;
            }
          }

          // Only proceed if we have at least one valid discount
          if (Object.keys(planObj).length > 0) {
            const paymentPlanString = JSON.stringify(planObj);
            formPayload.append("paymentPlan", paymentPlanString);
            console.log("Payment plan JSON string:", paymentPlanString);
          } else {
            console.log(
              "No valid discount values found, skipping payment plan"
            );
          }
        } catch (err) {
          console.error("Error preparing payment plan:", err);
        }
      }

      if (selectedFiles) {
        Array.from(selectedFiles).forEach((file) => {
          formPayload.append("images", file);
        });
      } // Detailed logging for debugging
      console.log("Form data being sent:", {
        datacenter: formData.datacenter,
        name: formData.name,
        description: formData.description,
        size: formData.size,
        price: formData.price,
        enableDiscount: formData.enableDiscount,
        quarterlyDiscount: formData.quarterlyDiscount,
        annuallyDiscount: formData.annuallyDiscount,
      });

      // Log all form data entries for debugging
      console.log("FormData entries:");
      Array.from(formPayload.entries()).forEach((pair) => {
        console.log(pair[0], pair[1]);
      });

      const response = await axios.post("/api/admin/space/new", formPayload);

      if (response.data.success === false) {
        throw new Error(response.data.message);
      }

      if (response.data.status === "ok" && response.data.data?._id) {
        addToast({
          title: "Success",
          color: "success",
          description: response.data.message,
        });
        setFormData({
          name: "",
          description: "",
          size: "",
          price: "",
          datacenter: "",
          enableDiscount: false,
          quarterlyDiscount: "",
          annuallyDiscount: "",
        });

        setSelectedFiles(null);
        setIsOpen(false);

        // Refresh the spaces list and filter options
        fetchSpaces();
        fetchFilterOptions();
      } else {
        addToast({
          title: "Warning",
          color: "warning",
          description: response.data.message || "Unexpected response format",
        });
      }
    } catch (error: any) {
      console.error("Space creation error:", error);
      addToast({
        title: "Error",
        color: "danger",
        description:
          error.response?.data?.message ||
          error.message ||
          "Failed to create space",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (
    spaceId: string,
    currentStatus: boolean
  ) => {
    try {
      const response = await axios.post(
        `/api/admin/space/${spaceId}/toggle-publish`
      );
      if (response.data?.status === "ok") {
        addToast({
          title: "Success",
          color: "success",
          description: `Space successfully ${currentStatus ? "unpublished" : "published"}`,
        });
        fetchSpaces();
      } else {
        addToast({
          title: "Warning",
          color: "warning",
          description: response.data?.message || "Status could not be changed",
        });
      }
    } catch (error: any) {
      console.error("Toggle error:", error);
      addToast({
        title: "Failed",
        color: "danger",
        description: error.response?.data?.message || "Failed to change status",
      });
    }
  };
  const handleEdit = async (space: Space) => {
    try {
      setSelectedSpace(space);
      setEditFormData({
        name: space.name,
        description: space.description,
        size: space.size,
        price: space.price.toString(),
        datacenter: space.datacenter._id || "",
      });
      setIsEditOpen(true);
    } catch (error) {
      console.error("Error in handleEdit:", error);
      addToast({
        title: "Error",
        color: "danger",
        description: "Failed to prepare edit form",
      });
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpace) return;

    try {
      setLoading(true);
      const formData = new FormData();

      // Add all form fields to FormData
      formData.append("name", editFormData.name);
      formData.append("description", editFormData.description);
      formData.append("size", editFormData.size);
      formData.append("price", editFormData.price);
      formData.append("datacenter", editFormData.datacenter);

      // Add any new images
      if (editSelectedFiles && editSelectedFiles.length > 0) {
        Array.from(editSelectedFiles).forEach((file) => {
          formData.append("images", file);
        });
      }

      const response = await axios.post(
        `/api/admin/space/update/${selectedSpace._id}`,
        formData
      );

      if (response.data.status === "ok") {
        addToast({
          title: "Success",
          color: "success",
          description: "Space updated successfully",
        });
        setIsEditOpen(false);
        fetchSpaces();
      }
    } catch (error: any) {
      addToast({
        title: "Error",
        color: "danger",
        description: error.response?.data?.message || "Failed to update space",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section with Gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-lg overflow-hidden mb-8">
        <div className="px-8 py-10 text-white">
          <h1 className="text-3xl font-bold mb-3">Product Management</h1>
          <p className="opacity-90 max-w-2xl">
            Create and manage your products to offer to customers. You can
            publish or unpublish products as needed.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <Card className="border-0 shadow-lg rounded-xl overflow-hidden">
            <CardBody className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="flex flex-wrap gap-3 flex-1">
                  <Input
                    placeholder="Search by name..."
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                    startContent={<Search className="text-default-300" />}
                    className="w-full max-w-xs"
                    size="md"
                    isClearable
                    onClear={() => setFilterValue("")}
                  />
                  {/* Provider Filter */}
                  <Select
                    placeholder="All Providers"
                    selectedKeys={providerFilter ? [providerFilter] : []}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;
                      setProviderFilter(selected || "");
                      setPage(1);
                    }}
                    className="w-48"
                    size="md"
                    startContent={
                      <Building size={16} className="text-default-400" />
                    }
                    isLoading={tableLoading}
                  >
                    {filterOptions.providers.map((provider) => (
                      <SelectItem key={provider._id}>
                        {provider.name}
                      </SelectItem>
                    ))}
                  </Select>
                  {/* Datacenter Filter */}
                  <Select
                    placeholder="All Datacenters"
                    selectedKeys={datacenterFilter ? [datacenterFilter] : []}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;
                      setDatacenterFilter(selected || "");
                      setPage(1);
                    }}
                    className="w-48"
                    size="md"
                    startContent={
                      <HiCube size={16} className="text-default-400" />
                    }
                    isLoading={tableLoading}
                  >
                    {filterOptions.datacenters.map((datacenter) => (
                      <SelectItem key={datacenter._id}>
                        {datacenter.name}
                      </SelectItem>
                    ))}
                  </Select>
                  {/* Clear Filters Button */}
                  {(filterValue || providerFilter || datacenterFilter) && (
                    <Button
                      size="md"
                      variant="flat"
                      color="default"
                      onPress={() => {
                        setFilterValue("");
                        setProviderFilter("");
                        setDatacenterFilter("");
                        setPage(1);
                      }}
                      startContent={<X size={16} />}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>

                {/* Add New Product Button */}
                <div className="flex gap-2">
                  <Button
                    color="primary"
                    size="md"
                    onPress={() => setIsOpen(true)}
                    startContent={<Plus size={18} />}
                    className="font-semibold min-w-[140px]"
                  >
                    Add New Product
                  </Button>
                </div>
              </div>

              {spaces.length > 0 ? (
                <div className="relative">
                  {/* Loading Overlay untuk mengurangi flickering */}
                  {tableLoading && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                      <div className="flex items-center gap-2 bg-white shadow-md px-4 py-2 rounded-lg">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        <span className="text-sm text-default-600">
                          Loading...
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="overflow-x-auto">
                    <Table
                      aria-label="Products table"
                      className="min-w-full"
                      classNames={{
                        wrapper: "min-h-[400px]",
                        table: "min-w-full",
                        thead: "bg-default-50",
                        tbody: tableLoading ? "opacity-70" : "",
                      }}
                    >
                      <TableHeader>
                        <TableColumn className="w-[100px] text-xs font-semibold uppercase text-default-600">
                          Image
                        </TableColumn>
                        <TableColumn className="w-[200px] text-xs font-semibold uppercase text-default-600">
                          Name
                        </TableColumn>
                        <TableColumn className="w-[250px] text-xs font-semibold uppercase text-default-600">
                          Provider
                        </TableColumn>
                        <TableColumn className="w-[250px] text-xs font-semibold uppercase text-default-600">
                          Data Center
                        </TableColumn>
                        <TableColumn className="w-[300px] text-xs font-semibold uppercase text-default-600">
                          Description
                        </TableColumn>
                        <TableColumn className="w-[80px] text-xs font-semibold uppercase text-default-600">
                          Size
                        </TableColumn>
                        <TableColumn className="w-[120px] text-xs font-semibold uppercase text-default-600">
                          Price
                        </TableColumn>
                        <TableColumn className="w-[100px] text-xs font-semibold uppercase text-default-600">
                          Status
                        </TableColumn>
                        <TableColumn className="w-[180px] text-xs font-semibold uppercase text-default-600">
                          Actions
                        </TableColumn>
                      </TableHeader>
                      <TableBody>
                        {spaces.map((space) => (
                          <TableRow
                            key={space._id}
                            className="hover:bg-default-50 transition-colors"
                          >
                            <TableCell className="py-4">
                              {space.images?.[0] ? (
                                <div className="relative w-[80px] h-[50px] rounded-lg overflow-hidden shadow-sm border border-default-200">
                                  <img
                                    src={space.images[0]}
                                    alt={space.name}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                  />
                                </div>
                              ) : (
                                <div className="w-[80px] h-[50px] bg-default-100 flex items-center justify-center rounded-lg border border-default-200">
                                  <Image
                                    size={20}
                                    className="text-default-400"
                                  />
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="max-w-[180px]">
                                <p
                                  className="font-semibold text-sm text-default-900 truncate"
                                  title={space.name}
                                >
                                  {space.name}
                                </p>
                                <p className="text-xs text-default-500 mt-1">
                                  ID: {space._id.slice(-6)}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="flex items-center gap-3 max-w-[230px]">
                                {space.provider?.logo ? (
                                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-default-200">
                                    <img
                                      src={
                                        space.provider.logo.startsWith(
                                          "apjiidc/"
                                        )
                                          ? `https://maxnet-dev-bucket.is3.cloudhost.id/${space.provider.logo}`
                                          : space.provider.logo
                                      }
                                      alt={space.provider.name}
                                      className="w-full h-full object-cover"
                                      loading="lazy"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Building
                                      size={16}
                                      className="text-primary"
                                    />
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <p
                                    className="font-semibold text-sm text-default-900 truncate"
                                    title={space.provider?.name || "N/A"}
                                  >
                                    {space.provider?.name || "No Provider"}
                                  </p>
                                  <p className="text-xs text-default-500 truncate">
                                    {space.provider?.city &&
                                    space.provider?.province
                                      ? `${space.provider.city}, ${space.provider.province}`
                                      : space.provider?.contact?.phone ||
                                        "Provider not found / inactive"}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="max-w-[230px]">
                                <p
                                  className="text-sm font-semibold text-default-900 truncate"
                                  title={space.datacenter?.name}
                                >
                                  {space.datacenter?.name || "-"}
                                </p>
                                <p
                                  className="text-xs text-default-500 truncate"
                                  title={space.datacenter?.address}
                                >
                                  {space.datacenter?.address || "No address"}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="max-w-[280px]">
                                <p
                                  className="text-sm text-default-600 line-clamp-2 leading-relaxed"
                                  title={space.description}
                                >
                                  {space.description || "No description"}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="flex justify-center">
                                <span className="inline-flex items-center px-2.5 py-1.5 text-sm font-semibold text-primary-700 bg-primary-50 border border-primary-200 rounded-lg">
                                  {space.size}U
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="text-right">
                                <p className="text-sm font-bold text-success-600">
                                  Rp{" "}
                                  {Number(space.price).toLocaleString("id-ID")}
                                </p>
                                <p className="text-xs text-default-500 mt-1">
                                  per month
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="flex justify-center">
                                <Chip
                                  color={space.publish ? "success" : "warning"}
                                  variant="flat"
                                  size="sm"
                                  className={`font-semibold text-xs px-3 py-1 ${
                                    space.publish
                                      ? "text-success-700 bg-success-50 border border-success-200"
                                      : "text-warning-700 bg-warning-50 border border-warning-200"
                                  }`}
                                  startContent={
                                    space.publish ? (
                                      <Check size={12} />
                                    ) : (
                                      <X size={12} />
                                    )
                                  }
                                >
                                  {space.publish ? "Published" : "Draft"}
                                </Chip>
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  color={space.publish ? "danger" : "success"}
                                  variant="flat"
                                  size="sm"
                                  radius="md"
                                  className="min-w-[85px] h-8 text-xs font-semibold"
                                  onPress={() =>
                                    handleTogglePublish(
                                      space._id,
                                      space.publish
                                    )
                                  }
                                  isLoading={tableLoading}
                                >
                                  {space.publish ? (
                                    <>
                                      <X className="h-3 w-3" />
                                      Unpublish
                                    </>
                                  ) : (
                                    <>
                                      <Check className="h-3 w-3" />
                                      Publish
                                    </>
                                  )}
                                </Button>
                                <Button
                                  color="primary"
                                  variant="light"
                                  size="sm"
                                  radius="md"
                                  className="min-w-[50px] h-8 text-xs font-semibold"
                                  onPress={() => handleEdit(space)}
                                  isDisabled={tableLoading}
                                >
                                  <Pencil className="h-3 w-3" />
                                  Edit
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 px-4">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-full p-6 inline-block mb-6 border border-blue-100">
                    <HiCube className="h-12 w-12 text-blue-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-default-800 mb-3">
                    {filterValue || providerFilter || datacenterFilter
                      ? "No Products Found"
                      : "No Products Yet"}
                  </h3>
                  <p className="text-default-600 mb-8 max-w-md text-center leading-relaxed">
                    {filterValue || providerFilter || datacenterFilter
                      ? `No products match your current filters. Try adjusting your search criteria or clearing the filters.`
                      : "Get started by creating your first product. Add spaces, set pricing, and publish them for customers to rent."}
                  </p>
                  <div className="flex gap-3">
                    {filterValue || providerFilter || datacenterFilter ? (
                      <Button
                        color="primary"
                        variant="flat"
                        size="lg"
                        onPress={() => {
                          setFilterValue("");
                          setProviderFilter("");
                          setDatacenterFilter("");
                          setPage(1);
                        }}
                        startContent={<X size={18} />}
                      >
                        Clear All Filters
                      </Button>
                    ) : (
                      <Button
                        color="primary"
                        size="lg"
                        onPress={() => setIsOpen(true)}
                        startContent={<Plus size={18} />}
                        className="font-semibold px-8"
                      >
                        Create Your First Product
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardBody>
          </Card>{" "}
          {pagination.totalItems > 0 && (
            <Card className="border-0 shadow-sm">
              <CardBody className="p-4">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-sm text-default-600 order-2 sm:order-1">
                    Showing{" "}
                    <span className="font-semibold text-default-900">
                      {(pagination.currentPage - 1) * rowsPerPage + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-semibold text-default-900">
                      {Math.min(
                        pagination.currentPage * rowsPerPage,
                        pagination.totalItems
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-default-900">
                      {pagination.totalItems}
                    </span>{" "}
                    results
                  </div>

                  <div className="flex items-center gap-4 order-1 sm:order-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-default-600">
                        Rows per page:
                      </span>
                      <Select
                        size="sm"
                        selectedKeys={[rowsPerPage.toString()]}
                        onSelectionChange={(keys) => {
                          const selected = Array.from(keys)[0] as string;
                          setRowsPerPage(parseInt(selected));
                          setPage(1);
                        }}
                        className="w-20"
                        classNames={{
                          trigger: "min-h-8 h-8",
                        }}
                        isDisabled={tableLoading}
                      >
                        <SelectItem key="5">5</SelectItem>
                        <SelectItem key="10">10</SelectItem>
                        <SelectItem key="20">20</SelectItem>
                        <SelectItem key="50">50</SelectItem>
                      </Select>
                    </div>

                    <Pagination
                      total={pagination.totalPages}
                      page={pagination.currentPage}
                      onChange={setPage}
                      classNames={{
                        cursor: "bg-primary text-white font-semibold shadow-md",
                        base: "gap-1",
                        item: "w-9 h-9 font-medium",
                        prev: "bg-default-100 hover:bg-default-200",
                        next: "bg-default-100 hover:bg-default-200",
                      }}
                      showControls
                      size="sm"
                      radius="md"
                      variant="flat"
                      isDisabled={tableLoading}
                    />
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </>
      )}

      {/* Add New Product Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        size="2xl"
        scrollBehavior="inside"
        placement="center"
        backdrop="blur"
      >
        <ModalContent>
          <form onSubmit={handleSubmit}>
            <ModalHeader className="text-xl font-bold">
              Add New Product
            </ModalHeader>
            <ModalBody className="gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Product Name"
                  placeholder="Enter product name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  isRequired
                />
                <Input
                  label="Size (U)"
                  placeholder="Enter size"
                  type="number"
                  value={formData.size}
                  onChange={(e) =>
                    setFormData({ ...formData, size: e.target.value })
                  }
                  isRequired
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Price (IDR)"
                  placeholder="Enter price"
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  isRequired
                />
                <Select
                  label="Datacenter"
                  placeholder="Select datacenter"
                  selectedKeys={
                    formData.datacenter ? [formData.datacenter] : []
                  }
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setFormData({ ...formData, datacenter: selected || "" });
                  }}
                  isRequired
                >
                  {filterOptions.datacenters.map((datacenter) => (
                    <SelectItem key={datacenter._id}>
                      {datacenter.name}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              <Textarea
                label="Description"
                placeholder="Enter product description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                minRows={3}
              />

              <Input
                type="file"
                label="Product Images"
                accept="image/*"
                multiple
                onChange={(e) => setSelectedFiles(e.target.files)}
              />

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Switch
                    isSelected={formData.enableDiscount}
                    onValueChange={(checked) =>
                      setFormData({ ...formData, enableDiscount: checked })
                    }
                  />
                  <span className="text-sm font-medium">
                    Enable discount plans
                  </span>
                </div>

                {formData.enableDiscount && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                    <Input
                      label="Quarterly Discount (%)"
                      placeholder="Enter quarterly discount"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.quarterlyDiscount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          quarterlyDiscount: e.target.value,
                        })
                      }
                    />
                    <Input
                      label="Annual Discount (%)"
                      placeholder="Enter annual discount"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.annuallyDiscount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          annuallyDiscount: e.target.value,
                        })
                      }
                    />
                  </div>
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                variant="flat"
                onPress={() => setIsOpen(false)}
                isDisabled={loading}
              >
                Cancel
              </Button>
              <Button
                color="primary"
                type="submit"
                isLoading={loading}
                className="font-semibold"
              >
                Create Product
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditFormData({
            name: "",
            description: "",
            size: "",
            price: "",
            datacenter: "",
          });
          setImages([]);
        }}
        scrollBehavior="inside"
        placement="center"
        className="max-w-2xl"
      >
        <ModalContent>
          <form onSubmit={handleEditSubmit}>
            <ModalHeader>Edit Space</ModalHeader>
            <ModalBody className="gap-4">
              <Input
                label="Name"
                placeholder="Enter space name"
                value={editFormData.name}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    name: e.target.value,
                  })
                }
              />
              {/* <Select
                label="Data Center"
                placeholder="Select Data Center"
                selectedKeys={
                  editFormData.datacenter ? [editFormData.datacenter] : []
                }
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setEditFormData({
                    ...editFormData,
                    datacenter: selected || "",
                  });
                }}
                startContent={<Building size={18} className="text-primary" />}
              >
                {datacenters.map((dc) => (
                  <SelectItem key={dc._id}>{dc.name}</SelectItem>
                ))}
              </Select> */}
              <Textarea
                label="Description"
                value={editFormData.description}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    description: e.target.value,
                  })
                }
                required
              />
              <Input
                label="Size (unit/m)"
                type="number"
                value={editFormData.size}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, size: e.target.value })
                }
                required
              />
              <Input
                label="Price"
                type="number"
                value={editFormData.price}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, price: e.target.value })
                }
                required
              />
              <Input
                type="file"
                label="Images"
                accept="image/*"
                multiple
                onChange={(e) => setEditSelectedFiles(e.target.files)}
              />
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                variant="light"
                onPress={() => setIsEditOpen(false)}
              >
                Cancel
              </Button>
              <Button color="primary" type="submit" isLoading={loading}>
                Update
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </div>
  );
}
