"use client";

import { useEffect, useState, useContext, useMemo } from "react";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Pagination } from "@heroui/pagination";
import { Select, SelectItem } from "@heroui/select";
import axios from "axios";
import { addToast } from "@heroui/toast";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import Image from "next/image";
import { Skeleton } from "@heroui/skeleton";
import { Tabs, Tab } from "@heroui/tabs";
import { Input } from "@heroui/input";
import { AdminSettingsContext } from "../layout";

interface Invoice {
  invoiceId: string;
  price?: number;
  releaseDate: string;
  expired?: string;
  paidAt?: string;
  verifiedBy?: string;
  proofOfPaid?: string;
  status: string;
  _id: string;
}

interface Contract {
  _id: string;
  rent: string;
  space: string;
  provider: string;
  user: string;
  paidAttempt: boolean;
  paymentPlan: number;
  invoices: Invoice[];
  createdAt: string;
  updatedAt: string;
}

interface Space {
  _id: string;
  name: string;
  description: string;
  price: number;
  size: string;
  images: string[];
  provider?: string;
  datacenter?: string;
  _addedBy?: string;
  publish?: boolean;
  paymentPlan?: Record<string, number>;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  rentBy?: string;
}

interface Provider {
  _id: string;
  name: string;
  contact: {
    email: string;
    phone: string;
  };
  description?: string;
  province?: string;
  city?: string;
  pos?: number;
  address?: string;
  status?: string;
  __v?: number;
  logo?: string;
}

interface By {
  _id: string;
  username: string;
  fullName: string;
  phone: string;
  email: string;
  roleType: string;
  __v?: number;
}

interface Order {
  _id: string;
  by: By;
  space: Space;
  provider: Provider;
  price: number;
  status: string;
  handledBy: string[];
  createdAt: string;
  updatedAt: string;
  contract: Contract;
  __v?: number;
}

export default function AdminAllOrdersPage() {
  const { ppn } = useContext(AdminSettingsContext);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentFilter, setCurrentFilter] = useState<string>("all");
  const [totalOrders, setTotalOrders] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination states
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/rent/global-list");
      if (response.data.status === "ok") {
        setOrders(response.data.data || []);
        setFilteredOrders(response.data.data || []);
        setTotalOrders(response.data.count || 0);
      } else {
        addToast({
          title: "Error",
          color: "danger",
          description: response.data.message || "Failed to fetch orders",
        });
      }
    } catch (error: any) {
      addToast({
        title: "Error",
        color: "danger",
        description: error.response?.data?.message || "Failed to fetch orders",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (currentFilter === "all") {
      const filtered = searchQuery
        ? orders.filter(
            (order) =>
              order.space?.name
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
              order.space?.description
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
              order.provider?.name
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
              order.by?.fullName
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
              order.by?.email?.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : orders;
      setFilteredOrders(filtered);
    } else {
      const filtered = orders.filter((order) => order.status === currentFilter);
      setFilteredOrders(
        searchQuery
          ? filtered.filter(
              (order) =>
                order.space?.name
                  ?.toLowerCase()
                  .includes(searchQuery.toLowerCase()) ||
                order.space?.description
                  ?.toLowerCase()
                  .includes(searchQuery.toLowerCase()) ||
                order.provider?.name
                  ?.toLowerCase()
                  .includes(searchQuery.toLowerCase()) ||
                order.by?.fullName
                  ?.toLowerCase()
                  .includes(searchQuery.toLowerCase()) ||
                order.by?.email
                  ?.toLowerCase()
                  .includes(searchQuery.toLowerCase())
            )
          : filtered
      );
    }
  }, [currentFilter, orders, searchQuery]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "provisioned":
        return "primary";
      case "active":
        return "success";
      case "pending":
        return "warning";
      case "suspend":
        return "danger";
      case "dismantle":
        return "default";
      default:
        return "default";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const statusCounts = {
    all: orders.length,
    pending: orders.filter((order) => order.status === "pending").length,
    provisioned: orders.filter((order) => order.status === "provisioned")
      .length,
    active: orders.filter((order) => order.status === "active").length,
    suspend: orders.filter((order) => order.status === "suspend").length,
    dismantle: orders.filter((order) => order.status === "dismantle").length,
  };

  // Function to calculate price with PPN
  const calculatePriceWithPPN = (basePrice: number) => {
    if (ppn === null) return basePrice;

    const taxAmount = (basePrice * ppn) / 100;
    return basePrice + taxAmount;
  };

  // Format price with tax details
  const formatPriceWithTax = (price: number) => {
    const formattedPrice = new Intl.NumberFormat("id-ID").format(price);

    if (ppn === null) return `Rp ${formattedPrice}`;

    const withTax = calculatePriceWithPPN(price);
    const formattedWithTax = new Intl.NumberFormat("id-ID").format(withTax);

    return (
      <>
        <span className="font-medium">Rp {formattedWithTax}</span>
        <span className="text-xs text-gray-500 block">(incl. {ppn}% tax)</span>
      </>
    );
  };

  // Calculate paginated orders
  const paginatedOrders = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredOrders.slice(startIndex, endIndex);
  }, [filteredOrders, page, rowsPerPage]);

  // Reset to first page when filter changes
  useEffect(() => {
    setPage(1);
  }, [currentFilter, searchQuery]);

  return (
    <div className="space-y-6 admin-container">
      {/* Header Section dengan Gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-lg overflow-hidden mb-8">
        <div className="px-8 py-10 text-white">
          <h1 className="text-3xl font-bold mb-3">All Orders</h1>
          <div className="opacity-90 max-w-2xl mb-6">
            View and manage all customer orders across different statuses.
            Filter orders by their current status.
            {ppn !== null && (
              <span className="ml-2 bg-white text-cyan-700 px-2 py-0.5 rounded-md text-sm font-medium">
                Current PPN rate: {ppn}%
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              color="default"
              className="bg-white text-cyan-700 font-medium px-6 py-3 rounded-xl hover:bg-cyan-50 flex items-center gap-2 shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
              onPress={fetchOrders}
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
              Refresh Orders
            </Button>
          </div>
        </div>
      </div>

      {/* Status Filter Tabs dan Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between bg-white p-4 rounded-xl shadow-sm mb-6">
        <Tabs
          aria-label="Order status"
          selectedKey={currentFilter}
          onSelectionChange={(key) => setCurrentFilter(key as string)}
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
                <span>All Orders</span>
                <Chip size="sm" variant="flat" color="default">
                  {statusCounts.all}
                </Chip>
              </div>
            }
          />
          <Tab
            key="pending"
            title={
              <div className="flex items-center gap-2">
                <span>Pending</span>
                <Chip size="sm" variant="flat" color="warning">
                  {statusCounts.pending}
                </Chip>
              </div>
            }
          />
          <Tab
            key="provisioned"
            title={
              <div className="flex items-center gap-2">
                <span>Provisioned</span>
                <Chip size="sm" variant="flat" color="primary">
                  {statusCounts.provisioned}
                </Chip>
              </div>
            }
          />
          <Tab
            key="active"
            title={
              <div className="flex items-center gap-2">
                <span>Active</span>
                <Chip size="sm" variant="flat" color="success">
                  {statusCounts.active}
                </Chip>
              </div>
            }
          />
          <Tab
            key="suspend"
            title={
              <div className="flex items-center gap-2">
                <span>Suspended</span>
                <Chip size="sm" variant="flat" color="danger">
                  {statusCounts.suspend}
                </Chip>
              </div>
            }
          />
          <Tab
            key="dismantle"
            title={
              <div className="flex items-center gap-2">
                <span>Dismantled</span>
                <Chip size="sm" variant="flat" color="default">
                  {statusCounts.dismantle}
                </Chip>
              </div>
            }
          />
        </Tabs>

        <div className="w-full md:max-w-xs">
          <Input
            placeholder="Search orders..."
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

      <div className="space-y-6 max-w-full">
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
        ) : filteredOrders.length === 0 ? (
          <Card className="border-0 shadow-md rounded-xl overflow-hidden">
            <CardBody className="p-0">
              <div className="text-center py-16 px-6">
                <div className="bg-cyan-50 rounded-full p-4 inline-block mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-cyan-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-700 mb-2">
                  {currentFilter === "all"
                    ? "No Orders Found"
                    : `No ${currentFilter.charAt(0).toUpperCase() + currentFilter.slice(1)} Orders Found`}
                </h3>
                <p className="text-gray-500 mb-4 max-w-md mx-auto">
                  {currentFilter === "all"
                    ? "There are no customer orders in the system yet."
                    : `There are currently no orders with "${currentFilter}" status.`}
                </p>
              </div>
            </CardBody>
          </Card>
        ) : (
          <div className="rounded-xl shadow-md bg-white overflow-hidden">
            {/* Mobile View - Card based layout */}
            <div className="md:hidden">
              {paginatedOrders.map((order) => (
                <div key={order._id} className="border-b border-gray-100 p-4">
                  <div className="mb-2 flex justify-between items-start">
                    <h3 className="font-medium text-gray-900">
                      {order.space?.name || "Unnamed Space"}
                    </h3>
                    <Chip
                      color={getStatusColor(order.status) as any}
                      variant="flat"
                      className="font-medium"
                    >
                      {order.status}
                    </Chip>
                  </div>

                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {order.space?.description || "No description"}
                  </p>

                  <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                    <div>
                      <span className="block text-gray-500">Size</span>
                      <span className="font-medium">
                        {order.space?.size || "N/A"}U
                      </span>
                    </div>
                    <div>
                      <span className="block text-gray-500">Price</span>
                      <div>
                        {order.contract &&
                        order.contract.invoices &&
                        order.contract.invoices.length > 0 &&
                        typeof order.contract.invoices[0].price === "number" &&
                        order.contract.invoices[0].price !==
                          order.space?.price ? (
                          <div>
                            {formatPriceWithTax(
                              order.contract.invoices[0].price
                            )}
                            <span className="text-xs text-gray-400 line-through block">
                              Rp {order.space?.price?.toLocaleString() || "0"}
                            </span>
                          </div>
                        ) : (
                          formatPriceWithTax(order.space?.price || 0)
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="block text-gray-500">Provider</span>
                      <span className="font-medium">
                        {order.provider?.name || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-gray-500">Customer</span>
                      <span className="font-medium">
                        {order.by?.fullName || "N/A"}
                      </span>
                    </div>
                  </div>

                  <Button
                    color="primary"
                    size="sm"
                    className="w-full mt-2"
                    as="a"
                    href={`/admin/orders/detail/${order.contract?._id}`}
                  >
                    View Details
                  </Button>
                </div>
              ))}
            </div>

            {/* Desktop View - Table layout dengan overflow control */}
            <div className="overflow-x-auto table-container">
              <table className="min-w-full divide-y divide-gray-200 hidden md:table">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Space
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Provider
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Updated
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {paginatedOrders.map((order, idx) => (
                    <tr
                      key={order._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {(page - 1) * rowsPerPage + idx + 1}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {order.space?.name || "Unnamed Space"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                        {order.space?.description || "No description"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {order.space?.size || "N/A"}U
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {order.contract &&
                        order.contract.invoices &&
                        order.contract.invoices.length > 0 &&
                        typeof order.contract.invoices[0].price === "number" &&
                        order.contract.invoices[0].price !==
                          order.space?.price ? (
                          <div className="flex flex-col">
                            {formatPriceWithTax(
                              order.contract.invoices[0].price
                            )}
                            <span className="text-xs text-gray-400 line-through">
                              Rp {order.space?.price?.toLocaleString() || "0"}
                            </span>
                          </div>
                        ) : (
                          <div>
                            {formatPriceWithTax(order.space?.price || 0)}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Chip
                          color={getStatusColor(order.status) as any}
                          variant="flat"
                          className="font-medium"
                        >
                          {order.status}
                        </Chip>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {order.provider ? (
                          <>
                            <div className="font-medium">
                              {order.provider.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {order.provider.contact?.email || "N/A"}
                            </div>
                          </>
                        ) : (
                          <div className="text-gray-500">
                            No provider information
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {order.by ? (
                          <>
                            <div className="font-medium">
                              {order.by.fullName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {order.by.email}
                            </div>
                          </>
                        ) : (
                          <div className="text-gray-500">
                            No customer information
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {formatDate(order.updatedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          color="primary"
                          className="flex items-center gap-2"
                          as="a"
                          href={`/admin/orders/detail/${order.contract?._id}`}
                          size="sm"
                          isDisabled={!order.contract?._id}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Component */}
            <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 rounded-b-xl">
              <div className="text-sm text-gray-500 mb-3 sm:mb-0">
                Showing{" "}
                <span className="font-medium">
                  {filteredOrders.length > 0 ? (page - 1) * rowsPerPage + 1 : 0}
                </span>
                {" - "}
                <span className="font-medium">
                  {Math.min(page * rowsPerPage, filteredOrders.length)}
                </span>
                {" of "}
                <span className="font-medium">
                  {filteredOrders.length}
                </span>{" "}
                orders
              </div>

              <div className="flex justify-center">
                <Pagination
                  total={Math.ceil(filteredOrders.length / rowsPerPage)}
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
                </Select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
