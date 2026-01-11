"use client";

import { useEffect, useState, useContext } from "react";
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Input } from "@heroui/input";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import axios from "axios";
import { addToast } from "@heroui/toast";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Divider } from "@heroui/divider";
import { Avatar } from "@heroui/avatar";
import { Badge } from "@heroui/badge";
import Image from "next/image";
import { Spinner } from "@heroui/spinner";
import { Skeleton } from "@heroui/skeleton";
import { Tabs, Tab } from "@heroui/tabs";
import { AdminSettingsContext } from "../layout";

interface Invoice {
  invoiceId: string;
  releaseDate: string;
  status: string;
  paidAt?: string;
  proofOfPaid?: string;
  _id: string;
  price?: number; // Add price field to Invoice interface
}

interface Order {
  _id: string;
  rent: string;
  user: {
    _id: string;
    username: string;
    fullName: string;
    email: string;
    phone: string;
  };
  space: {
    _id: string;
    name: string;
    description: string;
    price: number;
    size: string;
  };
  provider: {
    _id: string;
    name: string;
    contact: {
      email: string;
      phone: string;
    };
  };
  paidAttempt: boolean;
  invoices: Invoice[];
  createdAt: string;
  updatedAt: string;
}

export default function AdminOrdersPage() {
  const { ppn } = useContext(AdminSettingsContext);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [proofImageUrl, setProofImageUrl] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [provisioning, setProvisioning] = useState<string | null>(null);
  const [verifying, setVerifying] = useState<{
    id: string;
    invoice: string;
  } | null>(null);
  const [isInvoicesModalOpen, setIsInvoicesModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [isPaidModalOpen, setIsPaidModalOpen] = useState(false);
  const [paidAmount, setPaidAmount] = useState<number | null>(null);
  const [actionType, setActionType] = useState<"verify" | "provision" | null>(
    null
  );
  const [pendingAction, setPendingAction] = useState<{
    contractId: string;
    invoiceId: string;
    action?: boolean;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/admin/orders");
      if (response.data.status === "ok") {
        setOrders(response.data.data || []);
      }
    } catch (error: any) {
      addToast({
        title: "Error",
        color: "danger",
        description: "Failed to fetch orders",
      });
    } finally {
      setLoading(false);
    }
  };
  const handleProvision = (rentId: string) => {
    // Find the order to get the suggested payment amount
    const order = orders.find((order) => order._id === rentId);
    if (!order) {
      addToast({
        title: "Error",
        color: "danger",
        description: "Order not found",
      });
      return;
    }

    // Get the latest invoice to get the paid amount
    const latestInvoice = order.invoices[order.invoices.length - 1];
    const baseAmount = latestInvoice?.price || order.space.price;

    // Calculate amount with PPN included
    const suggestedAmount =
      ppn !== null ? baseAmount + (baseAmount * ppn) / 100 : baseAmount;

    // Set up the pending action and open the payment modal
    setPendingAction({
      contractId: rentId,
      invoiceId: latestInvoice?.invoiceId || "",
    });
    setActionType("provision");
    setPaidAmount(suggestedAmount);
    setIsPaidModalOpen(true);
  };

  const handleRejectProvision = async (rentId: string) => {
    try {
      setProvisioning(rentId);

      // Find the order to get the amount
      const order = orders.find((order) => order._id === rentId);
      if (!order) {
        addToast({
          title: "Error",
          color: "danger",
          description: "Order not found",
        });
        return;
      }

      // Get the latest invoice to get the paid amount
      const latestInvoice = order.invoices[order.invoices.length - 1];
      const baseAmount = latestInvoice?.price || order.space.price;

      // Calculate amount with PPN included
      const amount =
        ppn !== null ? baseAmount + (baseAmount * ppn) / 100 : baseAmount;

      const response = await axios.post(
        `/api/admin/orders/${rentId}/provision`,
        {
          paid: amount,
          isPaid: false, // Adding isPaid: false for rejection
        }
      );

      if (response.data.status === "ok") {
        addToast({
          title: "Success",
          color: "success",
          description: "Order has been rejected",
        });
        fetchOrders();
      }
    } catch (error: any) {
      addToast({
        title: "Error",
        color: "danger",
        description: error.response?.data?.message || "Failed to reject order",
      });
    } finally {
      setProvisioning(null);
    }
  };

  const submitProvision = async () => {
    if (!pendingAction || !paidAmount) return;

    try {
      setProvisioning(pendingAction.contractId);

      const response = await axios.post(
        `/api/admin/orders/${pendingAction.contractId}/provision`,
        {
          paid: paidAmount,
          ppn: ppn, // Include PPN rate in the request
          isPaid: true, // Add isPaid: true for approval
        }
      );

      if (response.data.status === "ok") {
        addToast({
          title: "Success",
          color: "success",
          description: "Order provisioned successfully",
        });
        fetchOrders();
        setIsPaidModalOpen(false);
      }
    } catch (error: any) {
      addToast({
        title: "Error",
        color: "danger",
        description:
          error.response?.data?.message || "Failed to provision order",
      });
    } finally {
      setProvisioning(null);
      setPendingAction(null);
    }
  };
  const handleVerify = (
    contractId: string,
    invoiceId: string,
    action: boolean
  ) => {
    // Find the order and invoice to get the suggested payment amount
    const order = orders.find((order) => order._id === contractId);
    if (!order) {
      addToast({
        title: "Error",
        color: "danger",
        description: "Order not found",
      });
      return;
    }

    const invoice = order.invoices.find((inv) => inv.invoiceId === invoiceId);
    if (!invoice) {
      addToast({
        title: "Error",
        color: "danger",
        description: "Invoice not found",
      });
      return;
    }

    // Get the base payment amount from the invoice or fall back to the space price
    const baseAmount = invoice.price || order.space.price;

    // Calculate amount with PPN included
    const suggestedAmount =
      ppn !== null ? baseAmount + (baseAmount * ppn) / 100 : baseAmount;

    // If rejecting, we don't need to show the payment modal, but still pass the payment amount with PPN
    if (!action) {
      submitVerify(contractId, invoiceId, action, suggestedAmount); // Changed to use suggestedAmount with PPN
      return;
    }

    // Set up the pending action and open the payment modal
    setPendingAction({
      contractId,
      invoiceId,
      action,
    });
    setActionType("verify");
    setPaidAmount(suggestedAmount);
    setIsPaidModalOpen(true);
  };
  const submitVerify = async (
    contractId: string,
    invoiceId: string,
    action: boolean,
    paid: number | null
  ) => {
    try {
      setVerifying({ id: contractId, invoice: invoiceId });
      const requestData: any = {
        contractId,
        invoiceId,
        action,
      };

      // Include paid amount and ppn for both verify and reject actions
      if (paid !== null) {
        requestData.paid = paid;
        requestData.ppn = ppn; // Include PPN rate
      }

      const response = await axios.post("/api/contract/verify", requestData);

      if (response.data.status === "ok") {
        addToast({
          title: "Success",
          color: "success",
          description: action
            ? "Payment verified successfully"
            : "Payment rejected",
        });
        fetchOrders();
      }
    } catch (error: any) {
      addToast({
        title: "Error",
        color: "danger",
        description:
          error.response?.data?.message || "Failed to verify payment",
      });
    } finally {
      // Always close modals regardless of success or failure
      setIsModalOpen(false);
      setIsPaidModalOpen(false);
      setVerifying(null);
      setPendingAction(null);
    }
  };

  const fetchProofImage = async (imagePath: string) => {
    try {
      const response = await axios.get(`/api/get-s3-image?key=${imagePath}`);
      if (response.data.status === "ok") {
        setProofImageUrl(response.data.url);
        setIsModalOpen(true);
      }
    } catch (error) {
      addToast({
        title: "Error",
        color: "danger",
        description: "Failed to fetch payment proof image",
      });
    }
  };

  const viewPaymentProof = (order: Order, invoice: Invoice) => {
    if (invoice.proofOfPaid) {
      setSelectedOrder(order);
      setSelectedInvoice(invoice);
      fetchProofImage(invoice.proofOfPaid);
    }
  };

  const openInvoicesModal = (order: Order) => {
    setSelectedOrder(order);
    setIsInvoicesModalOpen(true);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getOrderStatus = (order: Order): string => {
    if (!order.invoices || order.invoices.length === 0) return "unknown";

    const latestInvoice = order.invoices[order.invoices.length - 1];

    // For initial request that hasn't been activated yet
    if (latestInvoice.invoiceId.startsWith("REQ-")) {
      return latestInvoice.status;
    }

    // For verified initial request, check if rental invoices exist
    const hasRentalInvoices = order.invoices.some((inv) =>
      inv.invoiceId.startsWith("RNT-")
    );
    if (hasRentalInvoices) {
      // Active contract with recurring invoices
      const allVerified = order.invoices.every(
        (inv) => inv.status === "verified"
      );
      if (allVerified) return "completed";

      // Check if there are any pending invoices
      const hasPendingInvoices = order.invoices.some(
        (inv) => inv.status === "pending" && inv.invoiceId.startsWith("RNT-")
      );
      if (hasPendingInvoices) return "pending verification";

      return "active";
    }

    return latestInvoice.status;
  };

  const isNewRequest = (order: Order): boolean => {
    return order.invoices.some(
      (invoice) =>
        invoice.invoiceId.startsWith("REQ-") && invoice.status === "pending"
    );
  };

  const hasPendingInvoices = (order: Order): boolean => {
    return order.invoices.some(
      (invoice) =>
        invoice.invoiceId.startsWith("RNT-") && invoice.status === "pending"
    );
  };

  const isActiveContract = (order: Order): boolean => {
    return order.invoices.some((inv) => inv.invoiceId.startsWith("RNT-"));
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "provisioned":
        return "success";
      case "active":
        return "success";
      case "pending":
        return "warning";
      case "pending verification":
        return "warning";
      case "cancelled":
        return "danger";
      case "unpaid":
        return "warning";
      case "paid":
        return "primary";
      case "verified":
        return "success";
      case "rejected":
        return "danger";
      default:
        return "default";
    }
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const calculatePriceWithPPN = (basePrice: number) => {
    if (ppn === null) return basePrice;

    const taxAmount = (basePrice * ppn) / 100;
    return basePrice + taxAmount;
  };

  const formatPriceWithTax = (price: number) => {
    if (ppn === null) return formatPrice(price);

    const basePrice = price;
    const withTax = calculatePriceWithPPN(price);

    return (
      <div className="flex flex-col">
        <span className="block text-xl font-bold text-primary-700">
          {formatPrice(withTax)}{" "}
          <span className="text-sm font-normal">(incl. tax)</span>
        </span>
        <div className="text-xs text-gray-500 flex flex-col">
          <span>Base: {formatPrice(basePrice)}</span>
          <span>
            PPN {ppn}%: {formatPrice((basePrice * ppn) / 100)}
          </span>
        </div>
      </div>
    );
  };

  const handlePaidFormSubmit = () => {
    if (!paidAmount || !pendingAction) return;

    if (actionType === "provision") {
      submitProvision();
    } else if (actionType === "verify" && pendingAction.action !== undefined) {
      submitVerify(
        pendingAction.contractId,
        pendingAction.invoiceId,
        pendingAction.action,
        paidAmount
      );
    }
  };

  const handlePaidAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value > 0) {
      setPaidAmount(value);
    } else {
      setPaidAmount(null);
    }
  };
  // Filter orders based on active tab and search query
  const filteredOrders = orders.filter((order) => {
    // First filter by tab
    const passesTabFilter =
      activeTab === "all" ||
      (activeTab === "pending" && isNewRequest(order)) ||
      (activeTab === "active" && isActiveContract(order)) ||
      (activeTab === "verification" &&
        hasPendingInvoices(order) &&
        !isNewRequest(order));

    if (!passesTabFilter) return false;

    // Then filter by search query if one exists
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        order.user.fullName.toLowerCase().includes(query) ||
        order.user.email.toLowerCase().includes(query) ||
        order.space.name.toLowerCase().includes(query) ||
        order.space.description.toLowerCase().includes(query) ||
        order.provider.name.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Count for tab badges
  const pendingCount = orders.filter((order) => isNewRequest(order)).length;
  const activeCount = orders.filter((order) => isActiveContract(order)).length;
  const verificationCount = orders.filter(
    (order) => hasPendingInvoices(order) && !isNewRequest(order)
  ).length;

  return (
    <div className="space-y-6 pb-10">
      {/* Header Section with Gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-lg overflow-hidden mb-8">
        <div className="px-8 py-10 text-white">
          <h1 className="text-3xl font-bold mb-3">Orders Management</h1>
          <div className="opacity-90 max-w-2xl mb-6">
            Manage customer orders, process payments, and provision services.
            Monitor order statuses and payment confirmations.
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
      </div>{" "}
      {/* Status Filter Tabs and Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between bg-white p-4 rounded-xl shadow-sm mb-6">
        <Tabs
          aria-label="Order categories"
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
                <span>All Orders</span>
                <Chip size="sm" variant="flat" color="default">
                  {orders.length}
                </Chip>
              </div>
            }
          />
          <Tab
            key="pending"
            title={
              <div className="flex items-center gap-2">
                <span>Pending Requests</span>
                <Chip size="sm" variant="flat" color="warning">
                  {pendingCount}
                </Chip>
              </div>
            }
          />
          <Tab
            key="verification"
            title={
              <div className="flex items-center gap-2">
                <span>Needs Verification</span>
                <Chip size="sm" variant="flat" color="warning">
                  {verificationCount}
                </Chip>
              </div>
            }
          />
          <Tab
            key="active"
            title={
              <div className="flex items-center gap-2">
                <span>Active Contracts</span>
                <Chip size="sm" variant="flat" color="success">
                  {activeCount}
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
                  {activeTab === "all"
                    ? "No Orders Found"
                    : `No ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Orders Found`}
                </h3>
                <p className="text-gray-500 mb-4 max-w-md mx-auto">
                  {activeTab === "all"
                    ? "There are no customer orders in the system yet."
                    : `There are currently no orders with "${activeTab}" status.`}
                </p>
              </div>
            </CardBody>
          </Card>
        ) : (
          filteredOrders.map((order) => {
            const orderStatus = getOrderStatus(order);
            const latestInvoice =
              order.invoices && order.invoices.length > 0
                ? order.invoices[order.invoices.length - 1]
                : null;
            const isNewReq = isNewRequest(order);
            const hasPending = hasPendingInvoices(order);
            const isActive = isActiveContract(order);

            // Get the pending invoice if exists
            const pendingInvoice = order.invoices.find(
              (invoice) =>
                invoice.status === "pending" &&
                (isNewReq ? invoice.invoiceId.startsWith("REQ-") : true)
            );

            return (
              <Card
                key={order._id}
                className="w-full border-0 shadow-md hover:shadow-lg transition-all rounded-xl overflow-hidden"
              >
                <CardBody className="p-0">
                  <div
                    className={`p-1 ${
                      orderStatus === "active"
                        ? "bg-green-500"
                        : orderStatus === "pending" ||
                            orderStatus === "pending verification"
                          ? "bg-yellow-500"
                          : orderStatus === "provisioned"
                            ? "bg-blue-500"
                            : "bg-gray-500"
                    }`}
                  />
                  <div className="p-6">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                      <div className="flex items-center gap-3">
                        <Chip
                          color={getStatusColor(orderStatus) as any}
                          variant="flat"
                          startContent={
                            orderStatus === "active" ||
                            orderStatus === "verified" ? (
                              <span className="text-green-500">●</span>
                            ) : orderStatus === "pending" ||
                              orderStatus === "pending verification" ? (
                              <span className="text-amber-500">●</span>
                            ) : orderStatus === "rejected" ? (
                              <span className="text-red-500">●</span>
                            ) : null
                          }
                        >
                          {orderStatus}
                        </Chip>
                        <span className="text-sm text-gray-600 font-medium">
                          Order ID: {order._id.substring(order._id.length - 8)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">
                        Created: {formatDate(order.createdAt)}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      <div className="md:col-span-4">
                        <h3 className="text-xl font-semibold mb-2">
                          {order.space.name}
                        </h3>
                        <div className="space-y-1 mb-4">
                          <span className="inline-flex items-center text-sm rounded-full px-2.5 py-0.5 bg-blue-100 text-blue-800">
                            Size: {order.space.size}U
                          </span>
                          {latestInvoice &&
                          latestInvoice.price !== undefined &&
                          latestInvoice.price !== order.space.price
                            ? formatPriceWithTax(latestInvoice.price)
                            : formatPriceWithTax(order.space.price)}
                        </div>

                        {latestInvoice && (
                          <div className="space-y-1 mt-4">
                            <span className="text-sm font-medium block text-gray-500">
                              Latest Invoice
                            </span>
                            <div className="flex flex-wrap gap-2 items-center">
                              <span className="text-gray-800 font-medium">
                                {latestInvoice.invoiceId}
                              </span>
                              <Chip
                                size="sm"
                                color={
                                  getStatusColor(latestInvoice.status) as any
                                }
                                variant="flat"
                              >
                                {latestInvoice.status}
                              </Chip>
                            </div>
                            <span className="text-sm text-gray-600 block">
                              Released: {formatDate(latestInvoice.releaseDate)}
                            </span>
                            {latestInvoice.paidAt && (
                              <span className="text-sm text-gray-600 block">
                                Paid: {formatDate(latestInvoice.paidAt)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="md:col-span-4">
                        <div className="flex flex-col gap-4">
                          <div className="flex items-start gap-3">
                            <Avatar
                              className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white font-semibold"
                              name={order.user.fullName}
                              size="sm"
                            />
                            <div>
                              <span className="text-sm font-medium block text-gray-500">
                                Customer
                              </span>
                              <span className="font-medium block">
                                {order.user.fullName}
                              </span>
                              <span className="text-sm text-gray-600 block">
                                {order.user.email}
                              </span>
                              <span className="text-sm text-gray-600 block">
                                {order.user.phone}
                              </span>
                            </div>
                          </div>

                          <Divider className="my-1" />

                          <div className="flex items-start gap-3">
                            <Avatar
                              className="bg-gradient-to-br from-blue-500 to-pink-500 text-white font-semibold"
                              name={order.provider.name}
                              size="sm"
                            />
                            <div>
                              <span className="text-sm font-medium block text-gray-500">
                                Provider
                              </span>
                              <span className="font-medium block">
                                {order.provider.name}
                              </span>
                              <span className="text-sm text-gray-600 block">
                                {order.provider.contact.email}
                              </span>
                              <span className="text-sm text-gray-600 block">
                                {order.provider.contact.phone}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="md:col-span-4 flex flex-col gap-2 justify-start">
                        {isActive && (
                          <Button
                            color="secondary"
                            variant="flat"
                            className="w-full"
                            startContent={
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="icon icon-tabler icon-tabler-list-details"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path
                                  stroke="none"
                                  d="M0 0h24v24H0z"
                                  fill="none"
                                />
                                <path d="M13 5h8" />
                                <path d="M13 9h5" />
                                <path d="M13 15h8" />
                                <path d="M13 19h5" />
                                <path d="M3 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
                                <path d="M3 14m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
                              </svg>
                            }
                            onPress={() => openInvoicesModal(order)}
                          >
                            View All Invoices
                          </Button>
                        )}

                        {isNewReq && pendingInvoice && (
                          <>
                            <Button
                              color="primary"
                              className="w-full"
                              variant="flat"
                              startContent={
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="icon icon-tabler icon-tabler-file-certificate"
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  strokeWidth="1.5"
                                  stroke="currentColor"
                                  fill="none"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path
                                    stroke="none"
                                    d="M0 0h24v24H0z"
                                    fill="none"
                                  />
                                  <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                                  <path d="M5 8v-3a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2h-5" />
                                  <path d="M6 14m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
                                  <path d="M4.5 17l-1.5 5l3 -1.5l3 1.5l-1.5 -5" />
                                </svg>
                              }
                              onPress={() =>
                                viewPaymentProof(order, pendingInvoice)
                              }
                            >
                              View Payment Proof
                            </Button>
                            <div className="flex gap-2">
                              <Button
                                color="success"
                                isLoading={provisioning === order._id}
                                onPress={() => handleProvision(order._id)}
                                className="flex-1"
                                startContent={
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="icon icon-tabler icon-tabler-check"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path
                                      stroke="none"
                                      d="M0 0h24v24H0z"
                                      fill="none"
                                    />
                                    <path d="M5 12l5 5l10 -10" />
                                  </svg>
                                }
                              >
                                Provision
                              </Button>
                              <Button
                                color="danger"
                                onPress={() => handleRejectProvision(order._id)}
                                className="flex-1"
                                isLoading={provisioning === order._id}
                                startContent={
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="icon icon-tabler icon-tabler-x"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path
                                      stroke="none"
                                      d="M0 0h24v24H0z"
                                      fill="none"
                                    />
                                    <path d="M18 6l-12 12" />
                                    <path d="M6 6l12 12" />
                                  </svg>
                                }
                              >
                                Reject
                              </Button>
                            </div>
                          </>
                        )}

                        {hasPending && !isNewReq && pendingInvoice && (
                          <>
                            <Button
                              color="primary"
                              className="w-full"
                              variant="flat"
                              startContent={
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="icon icon-tabler icon-tabler-file-certificate"
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  strokeWidth="1.5"
                                  stroke="currentColor"
                                  fill="none"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path
                                    stroke="none"
                                    d="M0 0h24v24H0z"
                                    fill="none"
                                  />
                                  <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                                  <path d="M5 8v-3a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2h-5" />
                                  <path d="M6 14m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
                                  <path d="M4.5 17l-1.5 5l3 -1.5l3 1.5l-1.5 -5" />
                                </svg>
                              }
                              onPress={() =>
                                viewPaymentProof(order, pendingInvoice)
                              }
                            >
                              View Payment Proof
                            </Button>
                            <div className="flex gap-2">
                              <Button
                                isLoading={
                                  verifying?.id === order._id &&
                                  verifying?.invoice ===
                                    pendingInvoice.invoiceId
                                }
                                onPress={() =>
                                  handleVerify(
                                    order._id,
                                    pendingInvoice.invoiceId,
                                    true
                                  )
                                }
                                className="flex-1 bg-green-500 text-white"
                                startContent={
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="icon icon-tabler icon-tabler-check"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path
                                      stroke="none"
                                      d="M0 0h24v24H0z"
                                      fill="none"
                                    />
                                    <path d="M5 12l5 5l10 -10" />
                                  </svg>
                                }
                              >
                                Verify
                              </Button>
                              <Button
                                color="danger"
                                onPress={() =>
                                  handleVerify(
                                    order._id,
                                    pendingInvoice.invoiceId,
                                    false
                                  )
                                }
                                className="flex-1"
                                isLoading={
                                  verifying?.id === order._id &&
                                  verifying?.invoice ===
                                    pendingInvoice.invoiceId
                                }
                                startContent={
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="icon icon-tabler icon-tabler-x"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path
                                      stroke="none"
                                      d="M0 0h24v24H0z"
                                      fill="none"
                                    />
                                    <path d="M18 6l-12 12" />
                                    <path d="M6 6l12 12" />
                                  </svg>
                                }
                              >
                                Reject
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })
        )}
      </div>
      {/* Payment Proof Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="2xl"
      >
        <ModalContent className="rounded-xl overflow-hidden">
          <ModalHeader className="flex flex-col">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl">Payment Proof</h3>
                {selectedInvoice && (
                  <p className="text-sm font-normal text-gray-500">
                    Invoice: {selectedInvoice.invoiceId}
                  </p>
                )}
              </div>
              {selectedOrder && selectedInvoice && (
                <Chip
                  color={getStatusColor(selectedInvoice.status) as any}
                  variant="flat"
                >
                  {selectedInvoice.status}
                </Chip>
              )}
            </div>
          </ModalHeader>
          <Divider />
          <ModalBody>
            {selectedOrder && (
              <div className="mb-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-500 block">Customer</span>
                    <span className="font-medium">
                      {selectedOrder.user.fullName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Space</span>
                    <span className="font-medium">
                      {selectedOrder.space.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Price</span>
                    {selectedInvoice &&
                    selectedInvoice.price !== undefined &&
                    selectedInvoice.price !== selectedOrder.space.price ? (
                      <>
                        <span className="font-medium text-primary-700">
                          {formatPrice(selectedInvoice.price)}
                        </span>
                        <span className="ml-2 text-xs text-gray-500 line-through">
                          {formatPrice(selectedOrder.space.price)}
                        </span>
                      </>
                    ) : (
                      <span className="font-medium text-primary-700">
                        {formatPrice(selectedOrder.space.price)}
                      </span>
                    )}
                  </div>
                  {selectedInvoice?.paidAt && (
                    <div>
                      <span className="text-gray-500 block">Paid At</span>
                      <span className="font-medium">
                        {formatDate(selectedInvoice.paidAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
            <Divider className="my-2" />
            <div className="relative h-[450px] w-full rounded-lg overflow-hidden bg-gray-100">
              {proofImageUrl ? (
                <Image
                  src={proofImageUrl}
                  alt="Payment Proof"
                  layout="fill"
                  objectFit="contain"
                />
              ) : (
                <div className="flex justify-center items-center h-full">
                  <Spinner size="lg" color="primary" />
                </div>
              )}
            </div>
          </ModalBody>
          <Divider />
          <ModalFooter>
            {selectedOrder &&
              selectedInvoice &&
              selectedInvoice.status === "pending" && (
                <>
                  <Button
                    color="danger"
                    variant="flat"
                    onPress={() =>
                      handleVerify(
                        selectedOrder._id,
                        selectedInvoice.invoiceId,
                        false
                      )
                    }
                    isLoading={
                      verifying?.id === selectedOrder._id &&
                      verifying?.invoice === selectedInvoice.invoiceId
                    }
                    startContent={
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="icon icon-tabler icon-tabler-x"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M18 6l-12 12" />
                        <path d="M6 6l12 12" />
                      </svg>
                    }
                  >
                    Reject
                  </Button>{" "}
                  <Button
                    className="bg-green-500 text-white"
                    onPress={() => {
                      if (selectedInvoice.invoiceId.startsWith("REQ-")) {
                        handleProvision(selectedOrder._id);
                      } else {
                        handleVerify(
                          selectedOrder._id,
                          selectedInvoice.invoiceId,
                          true
                        );
                      }
                      setIsModalOpen(false);
                    }}
                    isLoading={
                      (selectedInvoice.invoiceId.startsWith("REQ-") &&
                        provisioning === selectedOrder._id) ||
                      (verifying?.id === selectedOrder._id &&
                        verifying?.invoice === selectedInvoice.invoiceId)
                    }
                    startContent={
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="icon icon-tabler icon-tabler-check"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M5 12l5 5l10 -10" />
                      </svg>
                    }
                  >
                    {selectedInvoice.invoiceId.startsWith("REQ-")
                      ? "Provision"
                      : "Verify Payment"}
                  </Button>
                </>
              )}
            <Button
              color="primary"
              onPress={() => setIsModalOpen(false)}
              variant="flat"
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {/* Invoices Modal */}
      <Modal
        isOpen={isInvoicesModalOpen}
        onClose={() => setIsInvoicesModalOpen(false)}
        size="4xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>
            <div className="flex flex-col">
              <h3 className="text-xl">All Invoices</h3>
              {selectedOrder && (
                <div className="text-sm text-gray-500 flex flex-wrap gap-x-4 gap-y-1 mt-1">
                  <span>Customer: {selectedOrder.user.fullName}</span>
                  <span>Space: {selectedOrder.space.name}</span>
                  <span>Order ID: {selectedOrder._id}</span>
                </div>
              )}
            </div>
          </ModalHeader>
          <Divider />
          <ModalBody>
            {selectedOrder && (
              <Table
                aria-label="Invoices table"
                classNames={{
                  th: "bg-gray-50",
                }}
              >
                <TableHeader>
                  <TableColumn>INVOICE ID</TableColumn>
                  <TableColumn>RELEASE DATE</TableColumn>
                  <TableColumn>PAID DATE</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody>
                  {selectedOrder.invoices.map((invoice) => (
                    <TableRow key={invoice._id}>
                      <TableCell>{invoice.invoiceId}</TableCell>
                      <TableCell>{formatDate(invoice.releaseDate)}</TableCell>
                      <TableCell>
                        {invoice.paidAt ? formatDate(invoice.paidAt) : "-"}
                      </TableCell>
                      <TableCell>
                        <Chip
                          color={getStatusColor(invoice.status) as any}
                          variant="flat"
                          size="sm"
                        >
                          {invoice.status}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 flex-wrap">
                          {invoice.proofOfPaid && (
                            <Button
                              color="primary"
                              size="sm"
                              variant="flat"
                              startContent={
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="icon icon-tabler icon-tabler-eye"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  strokeWidth="1.5"
                                  stroke="currentColor"
                                  fill="none"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path
                                    stroke="none"
                                    d="M0 0h24v24H0z"
                                    fill="none"
                                  />
                                  <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
                                  <path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" />
                                </svg>
                              }
                              onPress={() =>
                                viewPaymentProof(selectedOrder, invoice)
                              }
                            >
                              View Proof
                            </Button>
                          )}
                          {invoice.status === "pending" && (
                            <>
                              <Button
                                color="success"
                                size="sm"
                                startContent={
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="icon icon-tabler icon-tabler-check"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path
                                      stroke="none"
                                      d="M0 0h24v24H0z"
                                      fill="none"
                                    />
                                    <path d="M5 12l5 5l10 -10" />
                                  </svg>
                                }
                                onPress={() =>
                                  handleVerify(
                                    selectedOrder._id,
                                    invoice.invoiceId,
                                    true
                                  )
                                }
                                isLoading={
                                  verifying?.id === selectedOrder._id &&
                                  verifying?.invoice === invoice.invoiceId
                                }
                              >
                                Verify
                              </Button>
                              <Button
                                color="danger"
                                size="sm"
                                startContent={
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="icon icon-tabler icon-tabler-x"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path
                                      stroke="none"
                                      d="M0 0h24v24H0z"
                                      fill="none"
                                    />
                                    <path d="M18 6l-12 12" />
                                    <path d="M6 6l12 12" />
                                  </svg>
                                }
                                onPress={() =>
                                  handleVerify(
                                    selectedOrder._id,
                                    invoice.invoiceId,
                                    false
                                  )
                                }
                                isLoading={
                                  verifying?.id === selectedOrder._id &&
                                  verifying?.invoice === invoice.invoiceId
                                }
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </ModalBody>
          <Divider />
          <ModalFooter>
            <Button
              color="primary"
              variant="flat"
              onPress={() => setIsInvoicesModalOpen(false)}
            >
              Close
            </Button>{" "}
          </ModalFooter>
        </ModalContent>
      </Modal>
      {/* Payment Amount Input Modal */}
      <Modal
        isOpen={isPaidModalOpen}
        onClose={() => setIsPaidModalOpen(false)}
        size="sm"
      >
        <ModalContent className="rounded-xl overflow-hidden">
          <ModalHeader className="flex flex-col">
            <h3 className="text-xl">
              {actionType === "provision"
                ? "Provision Order"
                : "Verify Payment"}
            </h3>
            <p className="text-sm font-normal text-gray-500">
              Please enter the payment amount that was paid by the customer
              (including PPN)
            </p>
          </ModalHeader>
          <Divider />
          <ModalBody>
            <div className="space-y-4">
              {pendingAction && (
                <>
                  <div className="mb-4">
                    <label
                      htmlFor="paid-amount"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Payment Amount (with PPN)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">Rp</span>
                      </div>
                      <input
                        type="number"
                        id="paid-amount"
                        className="block w-full pl-12 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                        placeholder="0"
                        value={paidAmount || ""}
                        onChange={handlePaidAmountChange}
                      />
                    </div>
                  </div>

                  {/* Add PPN calculation preview (reversed calculation) */}
                  {ppn !== null && paidAmount !== null && (
                    <div className="border rounded-md p-3 bg-gray-50">
                      <h4 className="text-sm font-medium mb-2">
                        Payment Breakdown:
                      </h4>
                      <div className="space-y-1 text-sm">
                        {/* Calculate base price from total price */}
                        {(() => {
                          const baseAmount = (paidAmount * 100) / (100 + ppn);
                          const taxAmount = paidAmount - baseAmount;

                          return (
                            <>
                              <div className="flex justify-between">
                                <span>Base Amount:</span>
                                <span>{formatPrice(baseAmount)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>PPN ({ppn}%):</span>
                                <span>{formatPrice(taxAmount)}</span>
                              </div>
                              <div className="border-t pt-1 mt-1 flex justify-between font-medium">
                                <span>Total Amount:</span>
                                <span>{formatPrice(paidAmount)}</span>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </ModalBody>
          <Divider />
          <ModalFooter>
            <Button
              color="danger"
              variant="flat"
              onPress={() => {
                setIsPaidModalOpen(false);
                setPendingAction(null);
              }}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handlePaidFormSubmit}
              isDisabled={!paidAmount}
              isLoading={
                (actionType === "provision" &&
                  provisioning === pendingAction?.contractId) ||
                (actionType === "verify" &&
                  verifying?.id === pendingAction?.contractId &&
                  verifying?.invoice === pendingAction?.invoiceId)
              }
            >
              {actionType === "provision" ? "Provision" : "Verify"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
