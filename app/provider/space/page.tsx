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
  provider: string;
  _addedBy: string;
  publish: boolean;
  createdAt: string;
  updatedAt: string;
  datacenter: string;
}

interface Datacenter {
  _id: string;
  name: string;
  address: string;
}

export default function SpacePage() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [datacenters, setDatacenters] = useState<Datacenter[]>([]);
  const [loading, setLoading] = useState(true);
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
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filterValue, setFilterValue] = useState("");

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

  const fetchSpaces = async () => {
    try {
      const response = await axios.get("/api/provider/space/list");
      if (response.data.status === "ok") {
        const spacesData = response.data.data || [];
        setSpaces(Array.isArray(spacesData) ? spacesData : []);
      }
    } catch (error: any) {
      console.error("Error fetching spaces:", error);
      setSpaces([]);
      addToast({
        title: "Error",
        color: "danger",
        description: error.response?.data?.message || "Failed to load spaces",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDatacenters = async () => {
    try {
      const response = await axios.get("/api/provider/data-center");
      if (response.data.status === "ok") {
        setDatacenters(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching datacenters:", error);
      addToast({
        title: "Error",
        color: "danger",
        description: "Failed to load datacenters",
      });
    }
  };

  useEffect(() => {
    fetchSpaces();
  }, []);
  console.log("Spaces fetched:", spaces);
  // Ubah useEffect untuk fetch datacenters
  useEffect(() => {
    fetchDatacenters();
  }, []); // Panggil fetchDatacenters saat komponen dimount

  useEffect(() => {
    if (isOpen || isEditOpen) {
      fetchDatacenters();
    }
  }, [isOpen, isEditOpen]);

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

      const response = await axios.post("/api/provider/space/new", formPayload);

      if (response.data.success === false) {
        throw new Error(response.data.message);
      }

      if (response.data.status === "ok" && response.data.data?._id) {
        const newSpace: Space = response.data.data;

        setSpaces((prev) => [newSpace, ...prev]);

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
        `/api/provider/space/${spaceId}/toggle-publish`
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
      // Fetch datacenters terlebih dahulu
      await fetchDatacenters();

      setSelectedSpace(space);
      setEditFormData({
        name: space.name,
        description: space.description,
        size: space.size,
        price: space.price.toString(),
        datacenter: space.datacenter || "",
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
        `/api/provider/space/update/${selectedSpace._id}`,
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
  const filteredItems = React.useMemo(() => {
    let filtered = [...spaces];
    if (filterValue) {
      filtered = filtered.filter((space) =>
        space.name.toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    return filtered;
  }, [spaces, filterValue]);

  const currentItems = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredItems.slice(start, end);
  }, [filteredItems, page, rowsPerPage]);

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

          <Button
            color="default"
            className="mt-6 bg-white text-cyan-700 font-medium px-6 py-3 rounded-xl hover:bg-cyan-50 flex items-center gap-2 shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
            onPress={() => setIsOpen(true)}
            startContent={<Plus className="h-5 w-5" />}
          >
            Add New Product
          </Button>
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
                <Input
                  placeholder="Search by name..."
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  startContent={<Search className="text-default-300" />}
                  className="w-full max-w-xs"
                  size="lg"
                />
              </div>

              {filteredItems.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table aria-label="Products table" className="min-w-full">
                    <TableHeader>
                      <TableColumn className="w-[120px] text-xs uppercase">
                        Image
                      </TableColumn>
                      <TableColumn className="text-xs uppercase">
                        Name
                      </TableColumn>
                      <TableColumn className="text-xs uppercase">
                        Data Center
                      </TableColumn>
                      <TableColumn className="w-[250px] text-xs uppercase">
                        Description
                      </TableColumn>
                      <TableColumn className="text-xs uppercase">
                        Size
                      </TableColumn>
                      <TableColumn className="text-xs uppercase">
                        Price
                      </TableColumn>
                      <TableColumn className="text-xs uppercase">
                        Status
                      </TableColumn>
                      <TableColumn className="w-[180px] text-xs uppercase">
                        Actions
                      </TableColumn>
                    </TableHeader>
                    <TableBody>
                      {currentItems.map((space) => (
                        <TableRow key={space._id}>
                          <TableCell>
                            {space.images?.[0] ? (
                              <div className="relative w-[100px] h-[60px] rounded-lg overflow-hidden">
                                <img
                                  src={space.images[0]}
                                  alt={space.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-[100px] h-[60px] bg-default-100 flex items-center justify-center rounded-lg">
                                <Image size={24} className="text-default-400" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <p className="font-medium text-sm">{space.name}</p>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm">
                              {datacenters.find(
                                (dc) => dc._id === space.datacenter
                              )?.name || "-"}
                            </p>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm text-default-600 line-clamp-2">
                              {space.description}
                            </p>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-medium bg-default-100 px-2 py-1 rounded">
                              {space.size}U
                            </span>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm font-semibold text-primary">
                              Rp {Number(space.price).toLocaleString()}
                            </p>
                          </TableCell>
                          <TableCell>
                            <Chip
                              color={space.publish ? "success" : "warning"}
                              variant="flat"
                              size="sm"
                              className="font-medium text-xs"
                            >
                              {space.publish ? "Published" : "Not Published"}
                            </Chip>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <Button
                                color={space.publish ? "danger" : "success"}
                                variant="flat"
                                size="sm"
                                radius="lg"
                                className="min-w-[90px] h-7 text-xs font-medium flex items-center gap-1"
                                onPress={() =>
                                  handleTogglePublish(space._id, space.publish)
                                }
                              >
                                {space.publish ? (
                                  <>
                                    <X className="h-3.5 w-3.5" />
                                    Unpublish
                                  </>
                                ) : (
                                  <>
                                    <Check className="h-3.5 w-3.5" />
                                    Publish
                                  </>
                                )}
                              </Button>
                              {space.publish && (
                                <Button
                                  color="primary"
                                  variant="light"
                                  size="sm"
                                  radius="lg"
                                  className="min-w-[60px] h-7 text-xs font-medium bg-primary/10 flex items-center gap-1"
                                  onPress={() => handleEdit(space)}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                  Edit
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-blue-50 rounded-full p-4 inline-block mb-4">
                    <HiCube className="h-8 w-8 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-700 mb-2">
                    No Products Found
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    {filterValue
                      ? `No products matching "${filterValue}" were found. Try a different search term.`
                      : "You haven't created any products yet. Click the 'Add New Product' button to get started."}
                  </p>
                  {filterValue && (
                    <Button
                      color="primary"
                      variant="light"
                      onPress={() => setFilterValue("")}
                    >
                      Clear Search
                    </Button>
                  )}
                </div>
              )}
            </CardBody>
          </Card>{" "}
          {filteredItems.length > 0 && (
            <div className="flex justify-center mt-8">
              <Pagination
                total={Math.ceil(filteredItems.length / rowsPerPage)}
                page={page}
                onChange={setPage}
                classNames={{
                  cursor: "bg-primary text-white font-medium",
                  base: "gap-1",
                  item: "w-8 h-8",
                  prev: "bg-default-100",
                  next: "bg-default-100",
                }}
                showControls
                size="sm"
                radius="lg"
                variant="flat"
              />
            </div>
          )}
        </>
      )}

      <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleSubmit}>
              <ModalHeader className="flex flex-col gap-1">
                Add New Product
              </ModalHeader>
              <ModalBody className="space-y-4">
                <div className="w-full">
                  <Select
                    label="Data Center"
                    placeholder="Select Data Center"
                    selectedKeys={
                      formData.datacenter ? [formData.datacenter] : []
                    }
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;
                      setFormData({
                        ...formData,
                        datacenter: selected || "",
                      });
                    }}
                    startContent={
                      <Building size={18} className="text-primary" />
                    }
                    classNames={{
                      trigger: "border-primary/20",
                    }}
                    isRequired
                  >
                    {datacenters.map((dc) => (
                      <SelectItem key={dc._id}>{dc.name}</SelectItem>
                    ))}
                  </Select>
                </div>
                <Input
                  label="Name"
                  placeholder="Colocation 1U"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
                <Textarea
                  label="Description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                />
                <Input
                  label="Size (unit/m)"
                  type="number"
                  value={formData.size}
                  onChange={(e) =>
                    setFormData({ ...formData, size: e.target.value })
                  }
                  required
                />{" "}
                <Input
                  label="Price"
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    {" "}
                    <div>
                      <p className="text-medium font-medium">
                        Enable Discount Plans
                      </p>
                      <p className="text-tiny text-default-500">
                        Offer quarterly and/or annual discounts
                      </p>
                    </div>
                    <Switch
                      isSelected={formData.enableDiscount}
                      onValueChange={(value) =>
                        setFormData({ ...formData, enableDiscount: value })
                      }
                    />
                  </div>

                  {formData.enableDiscount && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                      {" "}
                      <Input
                        label="Quarterly Discount (%)"
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
                        startContent={
                          <div className="pointer-events-none flex items-center">
                            <span className="text-default-400 text-small">
                              %
                            </span>
                          </div>
                        }
                        description="Optional - 3-month payment discount"
                      />
                      <Input
                        label="Annually Discount (%)"
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
                        startContent={
                          <div className="pointer-events-none flex items-center">
                            <span className="text-default-400 text-small">
                              %
                            </span>
                          </div>
                        }
                        description="Optional - 12-month payment discount"
                      />
                    </div>
                  )}
                </div>
                <Input
                  type="file"
                  label="Images"
                  accept="image/*"
                  multiple
                  onChange={(e) => setSelectedFiles(e.target.files)}
                  required
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" type="submit" isLoading={loading}>
                  Save
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>

      {/* Add Edit Modal */}
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
              <Select
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
              </Select>
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
