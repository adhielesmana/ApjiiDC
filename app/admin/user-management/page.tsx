"use client";

import { useEffect, useState, useContext, useMemo } from "react";
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Input } from "@heroui/input";
import { Pagination } from "@heroui/pagination";
import { Select, SelectItem } from "@heroui/select";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import axios from "axios";
import { addToast } from "@heroui/toast";
import { Skeleton } from "@heroui/skeleton";
import { Tabs, Tab } from "@heroui/tabs";
import { Divider } from "@heroui/divider";
import { AdminSettingsContext } from "../layout";

interface User {
  _id: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  roleType: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  _isActive: boolean;
  _isDeleted: boolean;
  company: string;
  provider?: {
    _id: string;
    name: string;
    status: string;
    _isActive: boolean;

    // other provider fields might be available but not used here
  }; // Updated provider structure
}

export default function AdminUserManagementPage() {
  const { settings } = useContext(AdminSettingsContext);
  const [users, setUsers] = useState<User[]>([]); // All users for counting
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]); // Filtered users for display
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  // Pagination states
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // Add User Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  // Edit User Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<{
    username: string;
    fullName: string;
    phone: string;
    email: string;
    password: string;
    roleType: string;
    company: string;
    role?: string; // Make role optional with '?'
  }>({
    username: "",
    fullName: "",
    phone: "",
    email: "",
    password: "",
    roleType: "user",
    company: "",
    role: "", // Empty role for user roleType (customer)
  });

  // Edit form data state
  const [editFormData, setEditFormData] = useState<{
    userId: string;
    username: string;
    fullName: string;
    phone: string;
    email: string;
    password?: string;
    roleType: string;
    originalRoleType?: string; // Add this to track the original role type
    company: string;
    role?: string;
  }>({
    userId: "",
    username: "",
    fullName: "",
    phone: "",
    email: "",
    password: "", // Initialize with empty string
    roleType: "user",
    originalRoleType: "",
    company: "",
    role: "",
  });

  // Replace provider activation states with simpler ones
  const [isProviderActionDialogOpen, setIsProviderActionDialogOpen] =
    useState(false);
  const [providerActionTarget, setProviderActionTarget] = useState<{
    userId: string;
    userName: string;
    providerId: string;
    providerName: string;
    isActive: boolean;
  } | null>(null);
  const [providerActionLoading, setProviderActionLoading] = useState<
    string | null
  >(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      // Always fetch all users first to keep consistent counts
      const response = await axios.get("/api/admin/user-management");

      if (response.data.status === "ok") {
        const allUsers = response.data.data || [];
        setUsers(allUsers); // Store all users for counting

        // Apply the current filter
        filterUsersByTab(allUsers, activeTab);
      } else {
        addToast({
          title: "Error",
          color: "danger",
          description: response.data.message || "Failed to fetch users",
        });
      }
    } catch (error: any) {
      console.error("Error fetching users:", error);
      addToast({
        title: "Error",
        color: "danger",
        description: error.response?.data?.message || "Failed to fetch users",
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to filter users by tab
  const filterUsersByTab = (userList: User[], tab: string) => {
    let filtered: User[] = [];

    switch (tab) {
      case "customers":
        filtered = userList.filter((user) => user.roleType === "user");
        break;
      case "superadmin":
        filtered = userList.filter(
          (user) => user.roleType === "admin" && user.role === "admin"
        );
        break;
      case "adminStaff":
        filtered = userList.filter(
          (user) => user.roleType === "admin" && user.role === "staff"
        );
        break;
      case "providerAdmin":
        filtered = userList.filter(
          (user) => user.roleType === "provider" && user.role === "admin"
        );
        break;
      case "providerMember":
        filtered = userList.filter(
          (user) => user.roleType === "provider" && user.role === "staff"
        );
        break;
      case "all":
      default:
        filtered = [...userList];
        break;
    }

    setFilteredUsers(filtered);
  };

  // Initial data fetch on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle tab changes to filter users
  useEffect(() => {
    if (!loading && users.length > 0) {
      filterUsersByTab(users, activeTab);
    }
  }, [activeTab, users]);

  // Filter users based on search query within current tab
  const searchFilteredUsers = useMemo(() => {
    if (!searchQuery) return filteredUsers;

    const query = searchQuery.toLowerCase();
    return filteredUsers.filter(
      (user) =>
        user.username?.toLowerCase().includes(query) ||
        user.fullName?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.phone?.toLowerCase().includes(query) ||
        user.roleType?.toLowerCase().includes(query) ||
        user.role?.toLowerCase().includes(query)
    );
  }, [filteredUsers, searchQuery]);

  // Count for tab badges - always calculate based on the complete users list
  const statusCounts = useMemo(() => {
    return {
      all: users.length,
      customers: users.filter((user) => user.roleType === "user").length,
      superAdmin: users.filter(
        (user) => user.roleType === "admin" && user.role === "admin"
      ).length,
      adminStaff: users.filter(
        (user) => user.roleType === "admin" && user.role === "staff"
      ).length,
      providerAdmin: users.filter(
        (user) => user.roleType === "provider" && user.role === "admin"
      ).length,
      providerMember: users.filter(
        (user) => user.roleType === "provider" && user.role === "staff"
      ).length,
    };
  }, [users]); // Only recalculate when all users array changes

  // Calculate paginated users
  const paginatedUsers = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return searchFilteredUsers.slice(startIndex, endIndex);
  }, [searchFilteredUsers, page, rowsPerPage]);

  // Reset to first page when filter changes
  useEffect(() => {
    setPage(1);
  }, [activeTab, searchQuery]);

  // Form input handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "roleType") {
      // For customers (roleType "user"), set empty role
      // For admin and providers, let the admin choose a role
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        role: value === "user" ? "" : "", // For customer users, set empty role
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Reset form when modal closes
  const handleModalClose = () => {
    setFormData({
      username: "",
      fullName: "",
      phone: "",
      email: "",
      password: "",
      roleType: "user",
      company: "",
      role: "", // Empty role for customer users (roleType="user")
    });
    setIsAddModalOpen(false);
  };

  // Handler for opening the edit modal
  const handleOpenEditModal = (user: User) => {
    setSelectedUser(user);
    setEditFormData({
      userId: user._id,
      username: user.username,
      fullName: user.fullName || "",
      phone: user.phone || "",
      email: user.email,
      password: "",
      roleType: user.roleType,
      originalRoleType: user.roleType, // Store the original role type
      company: user.company || "",
      role: user.role,
    });
    setIsEditModalOpen(true);
  };

  // Handle edit form input changes
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  // Handle edit form select changes
  const handleEditSelectChange = (name: string, value: string) => {
    if (name === "roleType") {
      // If current user is a provider, ensure roleType remains "provider"
      if (selectedUser?.roleType === "provider") {
        // Silently keep the provider roleType without showing warning
        setEditFormData((prev) => ({
          ...prev,
          roleType: "provider", // Always preserve provider type
        }));
        return;
      }

      setEditFormData((prev) => ({
        ...prev,
        [name]: value,
        role: value === "user" ? "" : prev.role,
      }));
    } else {
      setEditFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Reset edit form when modal closes
  const handleEditModalClose = () => {
    setSelectedUser(null);
    setIsEditModalOpen(false);
  };

  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Create a copy of form data and remove role field for customer users
      const dataToSubmit = { ...formData };
      if (formData.roleType === "user") {
        delete dataToSubmit.role;
      }

      // Validate required fields
      const requiredFields = [
        { name: "username", label: "Username" },
        { name: "fullName", label: "Full Name" },
        { name: "email", label: "Email" },
        { name: "password", label: "Password" },
        { name: "roleType", label: "Role Type" },
      ];

      // Only check role field for admin and provider users
      if (formData.roleType !== "user") {
        requiredFields.push({ name: "role", label: "Role" });
      }

      const missingFields = requiredFields.filter(
        (field) => !dataToSubmit[field.name as keyof typeof dataToSubmit]
      );

      if (missingFields.length > 0) {
        addToast({
          title: "Validation Error",
          color: "danger",
          description: `Please fill in the following required fields: ${missingFields.map((f) => f.label).join(", ")}`,
        });
        setIsSubmitting(false);
        return;
      }
      // Simple email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        addToast({
          title: "Validation Error",
          color: "danger",
          description: "Please enter a valid email address",
        });
        setIsSubmitting(false);
        return;
      }

      // Password validation
      if (formData.password.length < 6) {
        addToast({
          title: "Validation Error",
          color: "danger",
          description: "Password must be at least 6 characters long",
        });
        setIsSubmitting(false);
        return;
      }

      console.log("Submitting user data:", dataToSubmit);

      // Submit form data with better error handling
      try {
        const response = await axios.post(
          "/api/admin/user-management/new",
          dataToSubmit,
          {
            headers: {
              "Content-Type": "application/json",
            },
            timeout: 30000,
          }
        );

        if (response.data.status === "ok" || response.data.success === true) {
          addToast({
            title: "Success",
            color: "success",
            description: "User created successfully",
          });
          // Reset form and close modal
          handleModalClose();

          // Refresh user list - fetch ALL users
          fetchUsers();
        } else {
          addToast({
            title: "Error",
            color: "danger",
            description: response.data.message || "Failed to create user",
          });
        }
      } catch (apiError: any) {
        console.error(
          "API Error:",
          apiError.response?.data || apiError.message
        );
        addToast({
          title: "Error",
          color: "danger",
          description:
            apiError.response?.data?.message ||
            "Failed to create user. Please try again.",
        });
      }
    } catch (error: any) {
      console.error("Error creating user:", error);
      addToast({
        title: "Error",
        color: "danger",
        description:
          error.response?.data?.message || "An unexpected error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  // Handle edit form submission
  const handleEditSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Create a copy of form data
      const dataToSubmit = { ...editFormData };

      // If the original user was a provider, enforce provider roleType
      if (dataToSubmit.originalRoleType === "provider") {
        dataToSubmit.roleType = "provider"; // Always enforce provider type
      }

      // Validate required fields
      const requiredFields = [
        { name: "username", label: "Username" },
        { name: "fullName", label: "Full Name" },
        { name: "email", label: "Email" },
        { name: "roleType", label: "Role Type" },
      ];

      // Only check role field for admin and provider users
      if (editFormData.roleType !== "user") {
        requiredFields.push({ name: "role", label: "Role" });
      }

      const missingFields = requiredFields.filter(
        (field) => !dataToSubmit[field.name as keyof typeof dataToSubmit]
      );

      if (missingFields.length > 0) {
        addToast({
          title: "Validation Error",
          color: "danger",
          description: `Please fill in the following required fields: ${missingFields.map((f) => f.label).join(", ")}`,
        });
        setIsSubmitting(false);
        return;
      }

      // Simple email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editFormData.email)) {
        addToast({
          title: "Validation Error",
          color: "danger",
          description: "Please enter a valid email address",
        });
        setIsSubmitting(false);
        return;
      }

      // Password validation (only if password is provided)
      if (
        editFormData.password &&
        editFormData.password.length > 0 &&
        editFormData.password.length < 6
      ) {
        addToast({
          title: "Validation Error",
          color: "danger",
          description: "Password must be at least 6 characters long",
        });
        setIsSubmitting(false);
        return;
      }

      console.log("Submitting edit user data:", dataToSubmit);

      // Submit form data
      const response = await axios.post(
        "/api/admin/user-management/edit",
        dataToSubmit,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      if (response.data.status === "ok" || response.data.success === true) {
        addToast({
          title: "Success",
          color: "success",
          description: "User updated successfully",
        });
        // Reset form and close modal
        handleEditModalClose();

        // Refresh user list
        fetchUsers();
      } else {
        addToast({
          title: "Error",
          color: "danger",
          description: response.data.message || "Failed to update user",
        });
      }
    } catch (error: any) {
      console.error("Error updating user:", error);
      addToast({
        title: "Error",
        color: "danger",
        description:
          error.response?.data?.message || "An unexpected error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleTypeLabel = (roleType: string, role?: string) => {
    // Handle undefined role
    if (!role) {
      return roleType === "user" ? "Customer" : `${roleType}`;
    }

    if (roleType === "user") return "Customer";
    if (roleType === "admin" && role === "admin") return "Super Admin";
    if (roleType === "admin" && role === "staff") return "Admin Staff";
    if (roleType === "provider" && role === "admin") return "Provider Admin";
    if (roleType === "provider" && role === "staff") return "Provider Member";
    return `${roleType} - ${role}`;
  };

  const getRoleColor = (roleType: string, role?: string) => {
    // Handle undefined role
    if (!role) {
      return roleType === "user" ? "secondary" : "default";
    }

    // More modern, flat color scheme
    if (roleType === "user") return "secondary";
    if (roleType === "admin" && role === "admin") return "danger";
    if (roleType === "admin" && role === "staff") return "warning";
    if (roleType === "provider" && role === "admin") return "success";
    if (roleType === "provider" && role === "staff") return "primary";
    return "default";
  };

  const getStatusColor = (status: boolean) => {
    return status ? "success" : "danger";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // New function to show provider activation/deactivation confirmation using the nested provider object
  const showProviderActionDialog = async (user: User) => {
    if (!user.provider) {
      addToast({
        title: "Error",
        color: "danger",
        description: "No provider ID associated with this user",
      });
      return;
    }

    try {
      // Access isActive status from the provider object
      const isProviderActive = user.provider._isActive;

      setProviderActionTarget({
        userId: user._id,
        userName: user.fullName || user.username,
        providerId: user.provider._id,
        providerName: user.provider.name || user.company || "Unknown Provider",
        isActive: isProviderActive,
      });

      setIsProviderActionDialogOpen(true);
    } catch (error: any) {
      console.error("Error processing provider data:", error);
      addToast({
        title: "Error",
        color: "danger",
        description: "Failed to process provider details",
      });
    } finally {
      setProviderActionLoading(null);
    }
  };
  // Function to execute provider activation/deactivation
  const executeProviderAction = async () => {
    if (!providerActionTarget) return;

    const { providerId, isActive } = providerActionTarget;

    try {
      setProviderActionLoading(providerId);

      const response = await axios.post("/api/admin/providers/activate", {
        id: providerId,
        active: !isActive,
      });

      if (response.data.status === "ok") {
        addToast({
          title: "Success",
          color: "success",
          description: isActive
            ? "Provider deactivated successfully"
            : "Provider activated successfully",
        });
        // Refresh user list to get updated provider status
        setTimeout(() => {
          fetchUsers();
        }, 500); // Add a small delay to ensure backend has updated
      } else {
        addToast({
          title: "Error",
          color: "danger",
          description:
            response.data.message ||
            `Failed to ${isActive ? "deactivate" : "activate"} provider`,
        });
      }
    } catch (error: any) {
      console.error("Error toggling provider activation:", error);
      addToast({
        title: "Error",
        color: "danger",
        description:
          error.response?.data?.message ||
          `Failed to ${isActive ? "deactivate" : "activate"} provider`,
      });
    } finally {
      setProviderActionLoading(null);
      setIsProviderActionDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header Section with Gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-lg overflow-hidden mb-8">
        <div className="px-8 py-10 text-white">
          <h1 className="text-3xl font-bold mb-3">User Management</h1>
          <div className="opacity-90 max-w-2xl mb-6">
            Manage user accounts, roles, and permissions. Monitor user
            activities and control access levels.
          </div>{" "}
          <div className="flex flex-wrap gap-3">
            <Button
              color="default"
              className="bg-white text-cyan-700 font-medium px-6 py-3 rounded-xl hover:bg-cyan-50 flex items-center gap-2 shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
              onPress={() => fetchUsers()}
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
              Refresh Users
            </Button>
            <Button
              color="default"
              className="bg-white text-cyan-700 font-medium px-6 py-3 rounded-xl flex items-center gap-2 shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
              onPress={() => setIsAddModalOpen(true)}
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
              Add New User
            </Button>
          </div>
        </div>
      </div>
      {/* Status Filter Tabs and Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between bg-white p-4 rounded-xl shadow-sm mb-6">
        <Tabs
          aria-label="User categories"
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as string)}
          color="primary"
          variant="underlined"
          classNames={{
            tabList: "gap-6",
            cursor: "w-full bg-cyan-500",
            tab: "max-w-fit px-0 h-12",
          }}
        >
          <Tab
            key="all"
            title={
              <div className="flex items-center gap-2">
                <span>All Users</span>
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
            key="customers"
            title={
              <div className="flex items-center gap-2">
                <span>Customers</span>
                <Chip
                  size="sm"
                  variant="flat"
                  color="secondary"
                  classNames={{
                    base: "bg-blue-100 text-blue-800",
                    content: "font-medium text-xs",
                  }}
                >
                  {statusCounts.customers}
                </Chip>
              </div>
            }
          />
          <Tab
            key="superadmin"
            title={
              <div className="flex items-center gap-2">
                <span>Super Admin</span>
                <Chip
                  size="sm"
                  variant="flat"
                  color="danger"
                  classNames={{
                    base: "bg-red-100 text-red-800",
                    content: "font-medium text-xs",
                  }}
                >
                  {statusCounts.superAdmin}
                </Chip>
              </div>
            }
          />
          <Tab
            key="adminStaff"
            title={
              <div className="flex items-center gap-2">
                <span>Admin Staff</span>
                <Chip
                  size="sm"
                  variant="flat"
                  color="warning"
                  classNames={{
                    base: "bg-orange-100 text-orange-800",
                    content: "font-medium text-xs",
                  }}
                >
                  {statusCounts.adminStaff}
                </Chip>
              </div>
            }
          />
          <Tab
            key="providerAdmin"
            title={
              <div className="flex items-center gap-2">
                <span>Provider Admin</span>
                <Chip
                  size="sm"
                  variant="flat"
                  color="success"
                  classNames={{
                    base: "bg-green-100 text-green-800",
                    content: "font-medium text-xs",
                  }}
                >
                  {statusCounts.providerAdmin}
                </Chip>
              </div>
            }
          />
          <Tab
            key="providerMember"
            title={
              <div className="flex items-center gap-2">
                <span>Provider Member</span>
                <Chip
                  size="sm"
                  variant="flat"
                  color="primary"
                  classNames={{
                    base: "bg-blue-100 text-blue-800",
                    content: "font-medium text-xs",
                  }}
                >
                  {statusCounts.providerMember}
                </Chip>
              </div>
            }
          />
        </Tabs>

        <div className="w-full md:max-w-xs">
          <Input
            placeholder="Search users..."
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
          />{" "}
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
                  <div className="flex space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-4 w-72" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        ) : searchFilteredUsers.length === 0 ? (
          <Card className="border-0 shadow-md rounded-xl overflow-hidden">
            <CardBody className="p-0">
              <div className="text-center py-16 px-6">
                <div className="text-3xl font-bold text-gray-400 mb-2">
                  No Users Found
                </div>
                <p className="text-gray-500">
                  There are no users matching your current filter criteria.
                </p>
              </div>
            </CardBody>
          </Card>
        ) : (
          <Card className="border-0 shadow-md rounded-xl overflow-hidden">
            <CardBody className="border-0 ">
              {" "}
              <Table aria-label="Users table">
                <TableHeader>
                  <TableColumn>NAME</TableColumn>
                  <TableColumn>USERNAME</TableColumn>
                  <TableColumn>EMAIL</TableColumn>
                  <TableColumn>PHONE</TableColumn>
                  <TableColumn>ROLE</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>JOINED DATE</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody emptyContent="No users found">
                  {paginatedUsers.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <div className="font-medium">
                          {user.fullName || "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>{user.username}</div>
                      </TableCell>
                      <TableCell>
                        <div>{user.email}</div>
                      </TableCell>
                      <TableCell>
                        <div>{user.phone || "-"}</div>
                      </TableCell>
                      <TableCell>
                        <Chip
                          color={getRoleColor(user.roleType, user.role)}
                          size="sm"
                          variant="flat"
                          classNames={{
                            base: "border border-transparent",
                            content: "font-medium text-xs px-1.5",
                          }}
                        >
                          {getRoleTypeLabel(user.roleType, user.role)}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <Chip
                          color={getStatusColor(user._isActive)}
                          size="sm"
                          variant="flat"
                          classNames={{
                            base: "border border-transparent",
                            content: "font-medium text-xs px-1.5",
                          }}
                        >
                          {user._isActive ? "Active" : "Inactive"}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <div>{formatDate(user.createdAt)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            color="primary"
                            variant="flat"
                            onPress={() => handleOpenEditModal(user)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            color={user._isActive ? "danger" : "success"}
                            variant="flat"
                            onPress={async () => {
                              try {
                                const response = await axios.post(
                                  "/api/admin/user-management/activate",
                                  {
                                    id: user._id,
                                    activate: !user._isActive,
                                  }
                                );

                                if (response.data.status === "ok") {
                                  addToast({
                                    title: "Success",
                                    color: "success",
                                    description: `User ${user._isActive ? "deactivated" : "activated"} successfully`,
                                  });
                                  fetchUsers(); // Refresh the list
                                } else {
                                  addToast({
                                    title: "Error",
                                    color: "danger",
                                    description:
                                      response.data.message ||
                                      "Failed to update user status",
                                  });
                                }
                              } catch (error: any) {
                                addToast({
                                  title: "Error",
                                  color: "danger",
                                  description:
                                    error.response?.data?.message ||
                                    "Failed to update user status",
                                });
                              }
                            }}
                          >
                            {user._isActive ? "Deactivate" : "Activate"}
                          </Button>

                          {/* Updated Provider Status button showing only when provider.status is "true" */}
                          {user.roleType === "provider" &&
                            user.role === "admin" &&
                            user.provider &&
                            user.provider.status === "granted" && (
                              <Button
                                size="sm"
                                color={
                                  user.provider._isActive ? "success" : "danger"
                                }
                                variant="flat"
                                className={
                                  user.provider._isActive
                                    ? "bg-green-100 text-green-800 border border-green-300"
                                    : "bg-red-100 text-red-800 border border-red-300"
                                }
                                isLoading={
                                  providerActionLoading === user.provider._id
                                }
                                isDisabled={
                                  providerActionLoading === user.provider._id
                                }
                                startContent={
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="15"
                                    height="15"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M12 2v10" />
                                    <path d="M18.4 6.6a9 9 0 1 1-12.77.04" />
                                  </svg>
                                }
                                onPress={() => showProviderActionDialog(user)}
                              >
                                {user.provider._isActive
                                  ? "Provider Active"
                                  : "Provider Inactive"}
                              </Button>
                            )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {/* Pagination Component */}
              <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 rounded-b-xl mt-4">
                <div className="text-sm text-gray-500 mb-3 sm:mb-0">
                  Showing{" "}
                  <span className="font-medium">
                    {searchFilteredUsers.length > 0
                      ? (page - 1) * rowsPerPage + 1
                      : 0}
                  </span>
                  {" - "}
                  <span className="font-medium">
                    {Math.min(page * rowsPerPage, searchFilteredUsers.length)}
                  </span>
                  {" of "}
                  <span className="font-medium">
                    {searchFilteredUsers.length}
                  </span>{" "}
                  users
                </div>

                <div className="flex justify-center">
                  <Pagination
                    total={Math.ceil(searchFilteredUsers.length / rowsPerPage)}
                    page={page}
                    onChange={setPage}
                    size="sm"
                    classNames={{
                      wrapper: "gap-1",
                      item: "w-8 h-8 text-sm",
                      cursor: "bg-cyan-600 text-white font-medium",
                    }}
                  />
                </div>

                <div className="hidden sm:block w-32">
                  <Select
                    size="sm"
                    label="Rows"
                    value={rowsPerPage.toString()}
                    onChange={(e) => setRowsPerPage(Number(e.target.value))}
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
        )}{" "}
      </div>{" "}
      {/* Add User Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) handleModalClose();
        }}
        scrollBehavior="inside"
        size="3xl"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h2 className="text-xl font-bold">Add New User</h2>
            <p className="text-sm text-gray-500">
              Create a new user account with specific role and permissions.
            </p>
          </ModalHeader>

          <ModalBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Username */}
              <div>
                <Input
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Enter username"
                  isRequired
                  variant="bordered"
                  labelPlacement="outside"
                />
              </div>

              {/* Full Name */}
              <div>
                <Input
                  label="Full Name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  isRequired
                  variant="bordered"
                  labelPlacement="outside"
                />
              </div>

              {/* Email */}
              <div>
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  isRequired
                  variant="bordered"
                  labelPlacement="outside"
                />
              </div>

              {/* Phone */}
              <div>
                <Input
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                  variant="bordered"
                  labelPlacement="outside"
                />
              </div>

              {/* Password */}
              <div>
                <Input
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter password (min 6 characters)"
                  isRequired
                  variant="bordered"
                  labelPlacement="outside"
                  description="Password must be at least 6 characters"
                />
              </div>

              {/* Role Type */}
              <div>
                <Select
                  label="Role Type"
                  placeholder="Select role type"
                  selectedKeys={
                    formData.roleType
                      ? new Set([formData.roleType])
                      : new Set([])
                  }
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    if (selected) {
                      setFormData((prev) => ({
                        ...prev,
                        roleType: selected,
                        role: selected === "user" ? "" : prev.role,
                      }));
                    }
                  }}
                  isRequired
                  variant="bordered"
                  labelPlacement="outside"
                >
                  <SelectItem key="user">Customer</SelectItem>
                  <SelectItem key="admin">Admin</SelectItem>
                </Select>
              </div>

              {/* Role */}
              <div>
                {formData.roleType === "user" ? (
                  <Input
                    label="Role"
                    value="(No role required)"
                    isReadOnly
                    isDisabled
                    description="Customer users don't need a specific role"
                    variant="bordered"
                    labelPlacement="outside"
                  />
                ) : (
                  <Select
                    label="Role"
                    placeholder="Select role"
                    selectedKeys={
                      formData.role ? new Set([formData.role]) : new Set([])
                    }
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;
                      if (selected) {
                        setFormData((prev) => ({
                          ...prev,
                          role: selected,
                        }));
                      }
                    }}
                    isRequired
                    variant="bordered"
                    labelPlacement="outside"
                  >
                    <SelectItem key="admin">Admin</SelectItem>
                    <SelectItem key="staff">Staff</SelectItem>
                  </Select>
                )}
              </div>

              {/* Company */}
              <div>
                <Input
                  label="Company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="Enter company name (optional)"
                  variant="bordered"
                  labelPlacement="outside"
                />
              </div>
            </div>
          </ModalBody>

          <ModalFooter>
            <Button color="default" variant="flat" onPress={handleModalClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleSubmit}
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              Create User
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {/* Edit User Modal */}
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
            <h2 className="text-xl font-bold">Edit User</h2>
            <p className="text-sm text-gray-500">
              Update user account details and permissions.
            </p>
          </ModalHeader>

          <ModalBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Username */}
              <div>
                <Input
                  label="Username"
                  name="username"
                  value={editFormData.username}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  placeholder="Enter username"
                  isRequired
                  variant="bordered"
                  labelPlacement="outside"
                />
              </div>

              {/* Full Name */}
              <div>
                <Input
                  label="Full Name"
                  name="fullName"
                  value={editFormData.fullName}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      fullName: e.target.value,
                    }))
                  }
                  placeholder="Enter full name"
                  isRequired
                  variant="bordered"
                  labelPlacement="outside"
                />
              </div>

              {/* Email */}
              <div>
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  placeholder="Enter email address"
                  isRequired
                  variant="bordered"
                  labelPlacement="outside"
                />
              </div>

              {/* Phone */}
              <div>
                <Input
                  label="Phone Number"
                  name="phone"
                  value={editFormData.phone}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  placeholder="Enter phone number"
                  variant="bordered"
                  labelPlacement="outside"
                />
              </div>

              {/* Password - Add password field */}
              <div>
                <Input
                  label="Password"
                  name="password"
                  type="password"
                  value={editFormData.password}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  placeholder="Enter new password (leave empty to keep current)"
                  variant="bordered"
                  labelPlacement="outside"
                  description="Minimum 6 characters if changing password"
                />
              </div>

              {/* Role Type */}
              <div>
                <Select
                  label="Role Type"
                  placeholder="Select role type"
                  selectedKeys={
                    editFormData.roleType
                      ? new Set([editFormData.roleType])
                      : new Set([])
                  }
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    if (selected) {
                      if (selectedUser?.roleType === "provider") {
                        addToast({
                          title: "Warning",
                          color: "warning",
                          description:
                            "Provider users cannot change their role type",
                        });
                        return;
                      }
                      setEditFormData((prev) => ({
                        ...prev,
                        roleType: selected,
                        role: selected === "user" ? "" : prev.role,
                      }));
                    }
                  }}
                  isRequired
                  variant="bordered"
                  labelPlacement="outside"
                  isDisabled={selectedUser?.roleType === "provider"}
                >
                  <SelectItem key="user">Customer</SelectItem>
                  <SelectItem key="admin">Admin</SelectItem>
                  {selectedUser?.roleType === "provider" ? (
                    <SelectItem key="provider">Provider</SelectItem>
                  ) : null}
                </Select>
              </div>

              {/* Role */}
              <div>
                {editFormData.roleType === "user" ? (
                  <Input
                    label="Role"
                    value="(No role required)"
                    isReadOnly
                    isDisabled
                    description="Customer users don't need a specific role"
                    variant="bordered"
                    labelPlacement="outside"
                  />
                ) : (
                  <Select
                    label="Role"
                    placeholder="Select role"
                    selectedKeys={
                      editFormData.role
                        ? new Set([editFormData.role])
                        : new Set([])
                    }
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;
                      if (selected) {
                        setEditFormData((prev) => ({
                          ...prev,
                          role: selected,
                        }));
                      }
                    }}
                    isRequired
                    variant="bordered"
                    labelPlacement="outside"
                  >
                    <SelectItem key="admin">Admin</SelectItem>
                    <SelectItem key="staff">Staff</SelectItem>
                  </Select>
                )}
              </div>

              {/* Company */}
              <div>
                <Input
                  label="Company"
                  name="company"
                  value={editFormData.company}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      company: e.target.value,
                    }))
                  }
                  placeholder="Enter company name (optional)"
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
              Update User
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {/* Provider Activation Confirmation Dialog */}
      <Modal
        isOpen={isProviderActionDialogOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) setIsProviderActionDialogOpen(false);
        }}
        size="sm"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold">
              {providerActionTarget?.isActive
                ? "Deactivate Provider"
                : "Activate Provider"}
            </h3>
          </ModalHeader>
          <ModalBody>
            <div className="py-2">
              <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 gap-2">
                  <div>
                    <span className="font-semibold text-gray-700">
                      Provider:
                    </span>{" "}
                    <span className="text-gray-900">
                      {providerActionTarget?.providerName}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">
                      Admin User:
                    </span>{" "}
                    <span className="text-gray-900">
                      {providerActionTarget?.userName}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">
                      Current Status:
                    </span>{" "}
                    <Chip
                      color={
                        providerActionTarget?.isActive ? "success" : "danger"
                      }
                      size="sm"
                      variant="flat"
                      className={
                        providerActionTarget?.isActive
                          ? "bg-green-100 text-green-800 border border-green-300"
                          : "bg-red-100 text-red-800 border border-red-300"
                      }
                    >
                      {providerActionTarget?.isActive ? "Active" : "Inactive"}
                    </Chip>
                  </div>
                </div>
              </div>

              {providerActionTarget?.isActive ? (
                <div>
                  <p className="text-gray-700">
                    Are you sure you want to{" "}
                    <span className="font-semibold text-red-600">
                      deactivate
                    </span>{" "}
                    this provider?
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    <span className="font-medium text-red-600">Warning:</span>{" "}
                    Deactivated providers will not appear in provider listings.
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-gray-700">
                    Are you sure you want to{" "}
                    <span className="font-semibold text-green-600">
                      activate
                    </span>{" "}
                    this provider?
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    Active providers will be visible in provider listings.
                  </p>
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="default"
              variant="flat"
              onPress={() => setIsProviderActionDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              color={providerActionTarget?.isActive ? "danger" : "success"}
              className={
                providerActionTarget?.isActive
                  ? "bg-red-500 text-white"
                  : "bg-green-500 text-white"
              }
              onPress={executeProviderAction}
              isLoading={
                providerActionLoading === providerActionTarget?.providerId
              }
            >
              {providerActionTarget?.isActive
                ? "Yes, Deactivate"
                : "Yes, Activate"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
