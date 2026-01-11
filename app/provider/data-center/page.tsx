"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Building, Loader2 } from "lucide-react";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { addToast } from "@heroui/toast";
import { Skeleton } from "@heroui/skeleton";

interface DataCenter {
  _id: string;
  name: string;
  address: string;
  coordinate: string;
  description: string;
  provider: string;
}

export default function DataCenterPage() {
  const [dataCenters, setDataCenters] = useState<DataCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    coordinate: "",
    description: "",
  });
  const [editFormData, setEditFormData] = useState<{
    name: string;
    image: string | File;
    address?: string;
    coordinate?: string;
    description?: string;
  }>({
    name: "",
    image: "",
    address: "",
    coordinate: "",
    description: "",
  });

  const fetchDataCenters = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/provider/data-center");

      if (response.data.status === "ok") {
        setDataCenters(response.data.data || []);
      } else {
        addToast({
          title: "Warning",
          color: "warning",
          description: "Failed to load data centers",
        });
      }
    } catch (error: any) {
      console.error("Failed to fetch data centers:", error);
      addToast({
        title: "Error",
        color: "danger",
        description:
          error.response?.data?.message || "Failed to load data centers",
      });
      setDataCenters([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataCenters();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post(
        "/api/provider/data-center/new",
        formData
      );

      if (response.data.status === "ok") {
        addToast({
          title: "Success",
          color: "success",
          description: "Data center added successfully",
        });
        setFormData({ name: "", address: "", coordinate: "", description: "" });
        setIsOpen(false);
        fetchDataCenters();
      }
    } catch (error: any) {
      addToast({
        title: "Error",
        color: "danger",
        description:
          error.response?.data?.message || "Failed to add data center",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (dc: DataCenter) => {
    setSelectedId(dc._id);
    setEditFormData({
      name: dc.name,
      image: "", // Keep image as empty string for edit
      address: dc.address || "",
      coordinate: dc.coordinate || "",
      description: dc.description || "",
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", editFormData.name);
      formData.append("address", editFormData.address || "");
      formData.append("coordinate", editFormData.coordinate || "");
      formData.append("description", editFormData.description || "");

      if (editFormData.image instanceof File) {
        formData.append("image", editFormData.image);
      }

      const response = await axios.post(
        `/api/provider/data-center/update/${selectedId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.status === "ok") {
        addToast({
          title: "Success",
          color: "success",
          description: "Data center updated successfully",
        });
        setIsEditOpen(false);
        fetchDataCenters();
      }
    } catch (error: any) {
      addToast({
        title: "Error",
        color: "danger",
        description:
          error.response?.data?.message || "Failed to update data center",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 ">
      {/* Header Section with Gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-lg overflow-hidden mb-8">
        <div className="px-8 py-10 text-white">
          <h1 className="text-3xl font-bold mb-3">Data Center Management</h1>
          <p className="opacity-90 max-w-2xl">
            Create and manage your data centers to organize your products and
            services.
          </p>

          <Button
            color="default"
            className="mt-6 bg-white text-blue-700 font-medium px-6 py-3 rounded-xl hover:bg-blue-50 flex items-center gap-2 shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
            onPress={() => setIsOpen(true)}
            startContent={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
            }
          >
            Add New Data Center
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="border-0 shadow-md p-4">
              <CardBody>
                <Skeleton className="h-6 w-2/3 rounded mb-4" />
                <Skeleton className="h-4 w-full rounded mb-2" />
                <Skeleton className="h-4 w-full rounded mb-2" />
                <Skeleton className="h-4 w-3/4 rounded" />
              </CardBody>
            </Card>
          ))}
        </div>
      ) : dataCenters.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dataCenters.map((dc) => (
            <Card
              key={dc._id}
              className="border-0 shadow-md hover:shadow-lg transition-all rounded-xl overflow-hidden"
            >
              <CardBody className="p-0">
                <div className="bg-gradient-to-r from-blue-100 to-cyan-100 p-4 border-b">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                      <Building className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {dc.name}
                    </h3>
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Address</p>
                    <p className="text-sm text-gray-700">{dc.address}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Coordinate</p>
                    <p className="text-sm text-gray-700 font-mono">
                      {dc.coordinate}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Description</p>
                    <p className="text-sm text-gray-700">{dc.description}</p>
                  </div>

                  <Button
                    color="primary"
                    variant="light"
                    className="mt-4"
                    onPress={() => handleEdit(dc)}
                  >
                    Edit Data Center
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="bg-blue-100 p-4 rounded-full inline-flex mb-4">
            <Building className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">
            No Data Centers Found
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            You haven't created any data centers yet. Create your first data
            center to start organizing your spaces.
          </p>
          <Button color="primary" onPress={() => setIsOpen(true)}>
            Create Your First Data Center
          </Button>
        </div>
      )}

      {/* Modal remains largely the same with minor styling improvements */}
      <Modal
        isOpen={isOpen}
        onOpenChange={(open) => setIsOpen(open)}
        placement="center"
        backdrop="blur"
        classNames={{
          base: "rounded-xl",
          header: "border-b p-6",
          body: "p-6",
          footer: "border-t p-6",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleSubmit}>
              <ModalHeader className="flex flex-col gap-1">
                Add New Data Center
              </ModalHeader>
              <ModalBody className="space-y-4">
                <Input
                  label="Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
                <Input
                  label="Address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  required
                />
                <Input
                  label="Coordinate"
                  value={formData.coordinate}
                  onChange={(e) =>
                    setFormData({ ...formData, coordinate: e.target.value })
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

      {/* Edit Modal */}
      <Modal
        isOpen={isEditOpen}
        onOpenChange={(open) => setIsEditOpen(open)}
        placement="center"
        backdrop="blur"
        classNames={{
          base: "rounded-xl",
          header: "border-b p-6",
          body: "p-6",
          footer: "border-t p-6",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleEditSubmit}>
              <ModalHeader className="flex flex-col gap-1">
                Edit Data Center
              </ModalHeader>
              <ModalBody className="space-y-4">
                {/* edit same as create  */}
                <Input
                  label="Name"
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                  required
                />
                <Input
                  type="text"
                  label="Address"
                  value={editFormData.address}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      address: e.target.value,
                    })
                  }
                  required
                />
                <Input
                  type="text"
                  label="Coordinate"
                  value={editFormData.coordinate}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      coordinate: e.target.value,
                    })
                  }
                  required
                />
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
                  type="file"
                  label="Image"
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      image: e.target.files?.[0] || "",
                    })
                  }
                  // required
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" type="submit" isLoading={loading}>
                  Update
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
