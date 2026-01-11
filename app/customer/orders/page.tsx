"use client";

import { useState, useEffect, useContext } from "react";
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import { Input } from "@heroui/input";
import { Spinner } from "@heroui/spinner";
import { addToast } from "@heroui/toast";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Divider } from "@heroui/divider";
import { Avatar } from "@heroui/avatar";
import { Badge } from "@heroui/badge";
import { Tabs, Tab } from "@heroui/tabs";
import { Skeleton } from "@heroui/skeleton";
import Image from "next/image";
import { CustomerSettingsContext } from "../layout";
import {
  PaymentMethodSelector,
  type PaymentMethodType,
} from "@/components/payment-method-selector";
import { QRISPayment } from "@/components/qris-payment";

// Interface definitions
interface Provider {
  _id: string;
  name: string;
  description: string;
  address: string;
  contact: {
    email: string;
    phone: string;
  };
}

interface Space {
  _id: string;
  name: string;
  description: string;
  price: number;
  size: string;
  images: string[];
  provider: string;
  publish: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Invoice {
  invoiceId: string;
  releaseDate: string;
  paidAt?: string;
  verifiedBy?: string;
  proofOfPaid?: string;
  status: string;
  _id: string;
  price?: number;
  expired?: string;
}

interface User {
  _id: string;
  username: string;
  fullName: string;
  phone: string;
  email: string;
  roleType: string;
}

interface Order {
  _id: string;
  rent: string;
  space: Space;
  provider: Provider;
  user: User;
  paidAttempt: boolean;
  invoices: Invoice[];
  createdAt: string;
  updatedAt: string;
}

export default function OrdersPage() {
  const { ppn } = useContext(CustomerSettingsContext);
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isInvoicesOpen,
    onOpen: onInvoicesOpen,
    onClose: onInvoicesClose,
  } = useDisclosure();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethodType | null>(null);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);

  const handleTokenExpired = () => {
    addToast({
      title: "Session Expired",
      color: "warning",
      description: "Your session has expired. Please login again.",
    });
    router.push("/login");
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/contract/list");
      if (response.data.status === "ok") {
        setOrders(response.data.data);
      } else if (response.data.error === "Token Expired") {
        handleTokenExpired();
        return;
      } else {
        addToast({
          title: "Warning",
          color: "warning",
          description: response.data.message || "Failed to fetch orders",
        });
      }
    } catch (error: any) {
      console.error("Failed to fetch orders:", error);
      if (error.response?.data?.error === "Token Expired") {
        handleTokenExpired();
        return;
      }
      addToast({
        title: "Error",
        color: "danger",
        description: error.response?.data?.message || "Error loading orders",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handlePayment = async () => {
    if (!selectedOrder) {
      addToast({
        title: "Warning",
        color: "warning",
        description: "Please select an order",
      });
      return;
    }

    // Check if payment method is selected
    if (!selectedPaymentMethod) {
      addToast({
        title: "Warning",
        color: "warning",
        description: "Silakan pilih metode pembayaran",
      });
      return;
    }

    // For bank transfer, check if bank is selected
    if (selectedPaymentMethod === "bank_transfer" && !selectedBank) {
      addToast({
        title: "Warning",
        color: "warning",
        description: "Silakan pilih bank tujuan",
      });
      return;
    }

    // Payment proof is required for both bank transfer and QRIS
    if (!paymentProof) {
      addToast({
        title: "Warning",
        color: "warning",
        description: "Silakan upload bukti pembayaran",
      });
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("contractId", selectedOrder._id);
      formData.append("paymentMethod", selectedPaymentMethod);
      formData.append("proof", paymentProof!);

      if (selectedPaymentMethod === "bank_transfer") {
        formData.append("bankCode", selectedBank as string);
      }

      if (selectedInvoice) {
        formData.append("invoiceId", selectedInvoice.invoiceId);
      }

      const response = await axios.post("/api/rent/pay", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.status === "ok") {
        addToast({
          title: "Success",
          color: "success",
          description:
            selectedPaymentMethod === "qris"
              ? "Pembayaran QRIS terdeteksi. Terima kasih!"
              : "Bukti pembayaran berhasil dikirim",
        });
        onClose();
        fetchOrders();
      } else {
        addToast({
          title: "Error",
          color: "danger",
          description: response.data.message || "Gagal melakukan pembayaran",
        });
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      addToast({
        title: "Error",
        color: "danger",
        description:
          error.response?.data?.message || "Gagal melakukan pembayaran",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        addToast({
          title: "Error",
          color: "danger",
          description: "File size exceeds 5MB limit",
        });
        return;
      }

      // Validate file type
      const validTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!validTypes.includes(file.type)) {
        addToast({
          title: "Error",
          color: "danger",
          description: "Only JPG, PNG, and GIF files are accepted",
        });
        return;
      }

      setPaymentProof(file);
      // Create preview URL for the selected image
      const fileUrl = URL.createObjectURL(file);
      setPreviewImageUrl(fileUrl);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
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

  // Calculate price with PPN
  const calculatePriceWithPPN = (basePrice: number) => {
    if (ppn === null) return basePrice;

    const taxAmount = (basePrice * ppn) / 100;
    return basePrice + taxAmount;
  };

  // Check if invoice should be visible (already released or within 7 days of release)
  const isInvoiceVisible = (releaseDate: string): boolean => {
    try {
      const now = new Date();
      const release = new Date(releaseDate);

      // If release date is in the past or today, invoice is visible
      if (release <= now) return true;

      // Calculate days until release
      const timeDiff = release.getTime() - now.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

      // If release is within next 7 days, invoice is visible
      return daysDiff <= 7;
    } catch (error) {
      // If there's any error parsing the date, default to showing the invoice
      console.error("Error checking invoice visibility:", error);
      return true;
    }
  };

  // Calculate days until invoice release
  const daysUntilRelease = (releaseDate: string): number => {
    try {
      const now = new Date();
      const release = new Date(releaseDate);

      // If already released, return 0
      if (release <= now) return 0;

      // Calculate days until release
      const timeDiff = release.getTime() - now.getTime();
      return Math.ceil(timeDiff / (1000 * 3600 * 24));
    } catch (error) {
      // If there's any error parsing the date, default to 0
      console.error("Error calculating days until release:", error);
      return 0;
    }
  };

  // Format price with tax details
  const formatPriceWithTax = (price: number) => {
    if (ppn === null) return formatPrice(price);

    const basePrice = price;
    const withTax = calculatePriceWithPPN(price);
    const formattedWithTax = formatPrice(withTax);
    const formattedBasePrice = formatPrice(basePrice);
    const formattedTax = formatPrice((basePrice * ppn) / 100);

    return (
      <div>
        <span className="text-2xl font-bold text-blue-700">
          {formattedWithTax}
        </span>
        <span className="text-sm font-normal text-blue-600">/month</span>
        {ppn > 0 && (
          <div className="text-xs text-gray-500 mt-1">
            <p>Base: {formattedBasePrice}</p>
            <p>
              PPN {ppn}%: {formattedTax}
            </p>
          </div>
        )}
      </div>
    );
  };

  const getLatestInvoice = (order: Order): Invoice | null => {
    if (!order.invoices || order.invoices.length === 0) return null;

    // Filter to only visible invoices
    const visibleInvoices = order.invoices.filter((invoice) =>
      isInvoiceVisible(invoice.releaseDate)
    );

    if (visibleInvoices.length === 0) return null;

    // Sort by release date descending (newest first)
    const sortedInvoices = [...visibleInvoices].sort(
      (a, b) =>
        new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
    );

    return sortedInvoices[0];
  };

  const getOrderStatus = (order: Order): string => {
    if (!order.invoices || order.invoices.length === 0) return "unknown";

    // Filter to only visible invoices
    const visibleInvoices = order.invoices.filter((invoice) =>
      isInvoiceVisible(invoice.releaseDate)
    );

    if (visibleInvoices.length === 0) {
      // If no visible invoices, check if there are future invoices
      const futureInvoices = order.invoices.filter(
        (invoice) => new Date(invoice.releaseDate) > new Date()
      );

      if (futureInvoices.length > 0) return "active";
      return "unknown";
    }

    const latestInvoice = visibleInvoices[visibleInvoices.length - 1];

    // For initial request that hasn't been activated yet
    if (latestInvoice.invoiceId.startsWith("REQ-")) {
      return latestInvoice.status;
    }

    // For verified initial request, check if rental invoices exist
    const hasRentalInvoices = visibleInvoices.some((inv) =>
      inv.invoiceId.startsWith("RNT-")
    );
    if (hasRentalInvoices) {
      // Active contract with recurring invoices
      const allVerified = visibleInvoices.every(
        (inv) => inv.status === "verified"
      );
      if (allVerified) return "completed";

      // Check if there are any pending invoices
      const hasPendingInvoices = visibleInvoices.some(
        (inv) => inv.status === "pending" && inv.invoiceId.startsWith("RNT-")
      );
      if (hasPendingInvoices) return "pending verification";

      // Check for unpaid invoices
      const hasUnpaidInvoices = visibleInvoices.some(
        (inv) => inv.status === "unpaid"
      );
      if (hasUnpaidInvoices) return "requires payment";

      return "active";
    }

    return latestInvoice.status;
  };

  const isRentalActive = (order: Order): boolean => {
    return order.invoices.some((inv) => inv.invoiceId.startsWith("RNT-"));
  };

  const hasUnpaidInvoices = (order: Order): boolean => {
    // Only consider visible invoices for unpaid status
    const visibleInvoices = order.invoices.filter((invoice) =>
      isInvoiceVisible(invoice.releaseDate)
    );
    return visibleInvoices.some((inv) => inv.status === "unpaid");
  };

  const hasRejectedInvoices = (order: Order): boolean => {
    // Only consider visible invoices for rejected status
    const visibleInvoices = order.invoices.filter((invoice) =>
      isInvoiceVisible(invoice.releaseDate)
    );
    return visibleInvoices.some((inv) => inv.status === "rejected");
  };

  const getRejectedInvoice = (order: Order): Invoice | null => {
    if (!order || !order.invoices) return null;

    // Filter visible invoices that are rejected
    const visibleRejectedInvoices = order.invoices.filter(
      (invoice) =>
        isInvoiceVisible(invoice.releaseDate) && invoice.status === "rejected"
    );

    if (visibleRejectedInvoices.length === 0) return null;

    // Return the latest rejected invoice based on release date
    return visibleRejectedInvoices.sort(
      (a, b) =>
        new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
    )[0];
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "success";
      case "active":
        return "success";
      case "pending":
        return "warning";
      case "requires payment":
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

  const openPaymentModal = (order: Order, invoice?: Invoice) => {
    setSelectedOrder(order);
    setSelectedInvoice(invoice || null);
    setPaymentProof(null);
    setPreviewImageUrl(null);
    setSelectedPaymentMethod(null);
    setSelectedBank(null);
    onOpen();
  };

  const openInvoicesModal = (order: Order) => {
    setSelectedOrder(order);
    onInvoicesOpen();
  };

  // Filter orders based on active tab
  const filteredOrders = orders.filter((order) => {
    if (activeTab === "all") return true;
    if (activeTab === "unpaid" && hasUnpaidInvoices(order)) return true;
    if (activeTab === "active" && isRentalActive(order)) return true;
    if (
      activeTab === "pending" &&
      getOrderStatus(order) === "pending verification"
    )
      return true;
    if (activeTab === "rejected" && hasRejectedInvoices(order)) return true;
    return false;
  });

  // Count for tab badges
  const unpaidCount = orders.filter((order) => hasUnpaidInvoices(order)).length;
  const activeCount = orders.filter((order) => isRentalActive(order)).length;
  const pendingCount = orders.filter(
    (order) => getOrderStatus(order) === "pending verification"
  ).length;
  const rejectedCount = orders.filter((order) =>
    hasRejectedInvoices(order)
  ).length;

  if (loading) {
    return (
      <div className="space-y-6 pb-10">
        {/* Hero Section with matching style from about page */}
        <section className="bg-[#155183] text-white py-16 relative overflow-hidden shadow-xl">
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-wider text-blue-100 mb-2">
                My Account
              </p>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6">My Orders</h1>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl">
                View and manage your data center colocation orders. Check order
                status and payment history.
              </p>

              <Button
                color="default"
                className="bg-white text-blue-700 font-medium px-6 py-3 rounded-xl hover:bg-blue-50 flex items-center gap-2 shadow-lg transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] border-2 border-white/20"
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

          {/* Decorative elements matching about page */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute top-10 right-[10%] w-64 h-64 rounded-full bg-blue-400/10"></div>
            <div className="absolute bottom-10 left-[10%] w-56 h-56 rounded-full bg-blue-400/10"></div>
          </div>
        </section>

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

          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  // Modified function to get the invoice price or fall back to space price
  const getInvoicePrice = (
    order: Order
  ): { originalPrice: number; discountedPrice: number | null } => {
    const latestInvoice = getLatestInvoice(order);
    const originalPrice = order.space.price;

    if (
      latestInvoice &&
      latestInvoice.price &&
      latestInvoice.price !== originalPrice
    ) {
      return { originalPrice, discountedPrice: latestInvoice.price };
    }

    return { originalPrice, discountedPrice: null };
  };

  return (
    <div className="space-y-6 pb-10 ">
      {/* Hero Section with matching style from about page */}
      <section className="bg-[#155183] text-white py-16 relative overflow-hidden shadow-xl">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-wider text-blue-100 mb-2">
              My Account
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">My Orders</h1>

            {/* Warning for rejected invoices */}
            {rejectedCount > 0 && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-300/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-red-300 flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <div>
                    <h3 className="text-lg font-semibold text-red-100 mb-1">
                      Invoice Rejected
                    </h3>
                    <p className="text-red-200">
                      You have {rejectedCount} rejected invoice
                      {rejectedCount > 1 ? "s" : ""} that{" "}
                      {rejectedCount > 1 ? "need" : "needs"} to be resubmitted.
                      Please check your rejected invoices and resubmit payment
                      proof.
                    </p>
                  </div>
                </div>
              </div>
            )}
            <p className="text-xl text-blue-100 mb-8 max-w-2xl">
              View and manage your data center colocation orders. Check order
              status and payment history.
              {ppn !== null && (
                <span className="ml-2 bg-white text-blue-700 px-2 py-0.5 rounded-md text-sm font-medium">
                  Prices include {ppn}% PPN
                </span>
              )}
            </p>

            <Button
              color="default"
              className="bg-white text-blue-700 font-medium px-6 py-3 rounded-xl hover:bg-blue-50 flex items-center gap-2 shadow-lg transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] border-2 border-white/20"
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

        {/* Decorative elements matching about page */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-10 right-[10%] w-64 h-64 rounded-full bg-blue-400/10"></div>
          <div className="absolute bottom-10 left-[10%] w-56 h-56 rounded-full bg-blue-400/10"></div>
        </div>
      </section>

      {/* Tabs for filtering orders */}
      <div className="px-1 mx-24">
        <Tabs
          aria-label="Order categories"
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as string)}
          color="primary"
          variant="underlined"
          classNames={{
            tab: "h-12",
          }}
        >
          <Tab
            key="all"
            title={
              <div className="flex items-center gap-2">
                <span>All Orders</span>
                <Badge color="primary" variant="flat" size="sm">
                  {orders.length}
                </Badge>
              </div>
            }
          />
          <Tab
            key="unpaid"
            title={
              <div className="flex items-center gap-2">
                <span>Requires Payment</span>
                {unpaidCount > 0 && (
                  <Badge color="warning" variant="flat" size="sm">
                    {unpaidCount}
                  </Badge>
                )}
              </div>
            }
          />
          <Tab
            key="pending"
            title={
              <div className="flex items-center gap-2">
                <span>Pending Verification</span>
                {pendingCount > 0 && (
                  <Badge color="warning" variant="flat" size="sm">
                    {pendingCount}
                  </Badge>
                )}
              </div>
            }
          />
          <Tab
            key="active"
            title={
              <div className="flex items-center gap-2">
                <span>Active Contracts</span>
                {activeCount > 0 && (
                  <Badge color="success" variant="flat" size="sm">
                    {activeCount}
                  </Badge>
                )}
              </div>
            }
          />
          <Tab
            key="rejected"
            title={
              <div className="flex items-center gap-2">
                <span>Rejected</span>
                {rejectedCount > 0 && (
                  <Badge color="danger" variant="flat" size="sm">
                    {rejectedCount}
                  </Badge>
                )}
              </div>
            }
          />
        </Tabs>
      </div>

      <div className="space-y-6 mx-24">
        {filteredOrders.length === 0 ? (
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
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-700 mb-2">
                  No Orders Found
                </h3>
                {activeTab === "all" ? (
                  <p className="text-gray-500 mb-4 max-w-md mx-auto">
                    You haven't placed any orders yet. Browse our data center
                    catalog to find the perfect colocation space for your needs.
                  </p>
                ) : (
                  <p className="text-gray-500 mb-4 max-w-md mx-auto">
                    You don't have any{" "}
                    {activeTab === "unpaid"
                      ? "unpaid invoices"
                      : activeTab === "pending"
                        ? "orders pending verification"
                        : activeTab === "rejected"
                          ? "rejected invoices"
                          : "active contracts"}{" "}
                    at the moment.
                  </p>
                )}
                <Button
                  color="primary"
                  className="mt-2"
                  onPress={() => router.push("/customer/catalog")}
                >
                  Browse Catalog
                </Button>
              </div>
            </CardBody>
          </Card>
        ) : (
          filteredOrders.map((order) => {
            const latestInvoice = getLatestInvoice(order);
            const orderStatus = getOrderStatus(order);
            const isActive = isRentalActive(order);
            const hasUnpaid = hasUnpaidInvoices(order);
            const { originalPrice, discountedPrice } = getInvoicePrice(order);

            // Find the unpaid invoice if exists
            const unpaidInvoice = order.invoices.find(
              (invoice) => invoice.status === "unpaid"
            );

            // Find the rejected invoice if exists
            const rejectedInvoice = getRejectedInvoice(order);
            const hasRejected = hasRejectedInvoices(order);

            return (
              <Card
                key={order._id}
                className="border-0 shadow-md hover:shadow-lg transition-all rounded-xl overflow-hidden"
              >
                <CardHeader
                  className={`py-2 px-6 ${
                    orderStatus === "active" || orderStatus === "completed"
                      ? "bg-green-50"
                      : orderStatus === "pending" ||
                          orderStatus === "pending verification" ||
                          orderStatus === "requires payment"
                        ? "bg-amber-50"
                        : orderStatus === "rejected"
                          ? "bg-red-50"
                          : "bg-gray-50"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <Chip
                        color={getStatusColor(orderStatus) as any}
                        variant="flat"
                        className="px-3 py-1 text-sm font-medium"
                        startContent={
                          orderStatus === "active" ||
                          orderStatus === "completed" ||
                          orderStatus === "verified" ? (
                            <span className="text-green-500 animate-pulse">
                              ●
                            </span>
                          ) : orderStatus === "pending" ||
                            orderStatus === "pending verification" ||
                            orderStatus === "requires payment" ||
                            orderStatus === "unpaid" ? (
                            <span className="text-amber-500 animate-pulse">
                              ●
                            </span>
                          ) : orderStatus === "rejected" ? (
                            <span className="text-red-500 animate-pulse">
                              ●
                            </span>
                          ) : null
                        }
                      >
                        {orderStatus}
                      </Chip>
                      <span className="text-sm text-gray-600 font-medium">
                        #{order._id.substring(order._id.length - 8)}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                </CardHeader>
                <CardBody className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-4">
                      <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100">
                        <h3 className="text-xl font-semibold mb-3 text-blue-900">
                          {order.space.name}
                        </h3>
                        <div className="space-y-2">
                          <span className="inline-flex items-center text-sm rounded-lg px-3 py-1.5 bg-blue-100 text-blue-800 font-medium">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-4 h-4 mr-1.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                              />
                            </svg>
                            {order.space.size}U
                          </span>
                          <div className="block">
                            {discountedPrice ? (
                              <>
                                {formatPriceWithTax(discountedPrice)}
                                <span className="block text-sm text-gray-500 line-through">
                                  {formatPrice(originalPrice)}/month
                                </span>
                              </>
                            ) : (
                              formatPriceWithTax(originalPrice)
                            )}
                          </div>
                        </div>
                      </div>

                      {latestInvoice && (
                        <div className="mt-6 p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-700">
                              Latest Invoice
                            </span>
                            <Chip
                              size="sm"
                              variant="flat"
                              color={
                                latestInvoice.invoiceId.startsWith("REQ-")
                                  ? "primary"
                                  : "success"
                              }
                              className="text-xs"
                            >
                              {latestInvoice.invoiceId.startsWith("REQ-")
                                ? "Initial"
                                : "Rental"}
                            </Chip>
                          </div>
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-2 items-center">
                              <span className="text-gray-900 font-semibold">
                                {latestInvoice.invoiceId}
                              </span>
                              <Chip
                                size="sm"
                                color={
                                  getStatusColor(latestInvoice.status) as any
                                }
                                variant="flat"
                                className="text-xs"
                              >
                                {latestInvoice.status}
                              </Chip>
                            </div>
                            <div className="text-xs space-y-1">
                              <div className="flex items-center text-gray-600">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="w-3.5 h-3.5 mr-1.5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 01-2 2z"
                                  />
                                </svg>
                                Released:{" "}
                                {formatDate(latestInvoice.releaseDate)}
                              </div>
                              {latestInvoice.paidAt && (
                                <div className="flex items-center text-green-600">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-3.5 h-3.5 mr-1.5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  Paid: {formatDate(latestInvoice.paidAt)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-4">
                      <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm h-full">
                        <div className="flex items-start gap-4">
                          <Avatar
                            className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold w-12 h-12 text-lg"
                            name={order.provider.name}
                          />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-500 block mb-1">
                              Data Center Provider
                            </span>
                            <span className="font-semibold text-lg block text-gray-900 mb-2">
                              {order.provider.name}
                            </span>
                            <div className="space-y-1.5">
                              <div className="flex items-center text-sm text-gray-600">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="w-4 h-4 mr-2"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 01-2 2z"
                                  />
                                </svg>
                                {order.provider.contact.email}
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="w-4 h-4 mr-2"
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
                                {order.provider.contact.phone}
                              </div>
                            </div>
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
                      )}{" "}
                      {hasUnpaid && unpaidInvoice && (
                        <Button
                          color={
                            unpaidInvoice.invoiceId.startsWith("REQ-")
                              ? "primary"
                              : "success"
                          }
                          className={`w-full ${
                            unpaidInvoice.invoiceId.startsWith("REQ-")
                              ? "bg-blue-600 text-white hover:bg-blue-700"
                              : "bg-green-600 text-white hover:bg-green-700"
                          }`}
                          startContent={
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="icon icon-tabler icon-tabler-credit-card"
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
                              <path d="M3 5m0 3a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3z" />
                              <path d="M3 10l18 0" />
                              <path d="M7 15l.01 0" />
                              <path d="M11 15l2 0" />
                            </svg>
                          }
                          onPress={() => openPaymentModal(order, unpaidInvoice)}
                        >
                          {unpaidInvoice.invoiceId.startsWith("REQ-")
                            ? "Pay Initial Request"
                            : "Pay Rental Invoice"}
                        </Button>
                      )}
                      {hasRejected && rejectedInvoice && (
                        <Button
                          color="danger"
                          variant="flat"
                          className="w-full"
                          startContent={
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="icon icon-tabler icon-tabler-refresh"
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
                              <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" />
                              <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
                            </svg>
                          }
                          onPress={() =>
                            openPaymentModal(order, rejectedInvoice)
                          }
                        >
                          Resubmit{" "}
                          {rejectedInvoice.invoiceId.startsWith("REQ-")
                            ? "Initial"
                            : "Rental"}{" "}
                          Payment
                        </Button>
                      )}
                      <Button
                        color="default"
                        variant="flat"
                        className="w-full"
                        startContent={
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="icon icon-tabler icon-tabler-eye"
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
                            <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
                            <path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" />
                          </svg>
                        }
                        onPress={() =>
                          router.push(`/customer/order/${order._id}`)
                        }
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })
        )}
      </div>

      <Modal
        isOpen={isOpen}
        onClose={() => {
          onClose();
          setPaymentProof(null);
          setPreviewImageUrl(null);
          setSelectedInvoice(null);
          setSelectedPaymentMethod(null);
          setSelectedBank(null);
        }}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent className="rounded-xl overflow-hidden">
          {" "}
          <ModalHeader className="flex flex-col">
            <h3 className="text-xl">Konfirmasi Pembayaran</h3>
            {selectedInvoice && (
              <div className="flex flex-col text-sm font-normal text-gray-500">
                <p>Invoice: {selectedInvoice.invoiceId}</p>
                <p className="mt-1">
                  <span className="inline-flex items-center text-xs font-medium rounded-full px-2.5 py-0.5 bg-blue-100 text-blue-800">
                    {selectedInvoice.invoiceId.startsWith("REQ-")
                      ? "Pembayaran Permintaan Awal"
                      : "Pembayaran Invoice Sewa"}
                  </span>
                </p>
              </div>
            )}
          </ModalHeader>
          <Divider />
          <ModalBody>
            {selectedOrder && (
              <div className="space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500 block">Ruang</span>
                    <span className="font-medium">
                      {selectedOrder.space.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 block">
                      Penyedia
                    </span>
                    <span className="font-medium">
                      {selectedOrder.provider.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 block">Jumlah</span>
                    {selectedInvoice && selectedInvoice.price ? (
                      <div>
                        {formatPriceWithTax(selectedInvoice.price)}
                        {selectedInvoice.price !==
                          selectedOrder.space.price && (
                          <span className="ml-2 text-xs text-gray-500 line-through">
                            {formatPrice(selectedOrder.space.price)}
                          </span>
                        )}
                      </div>
                    ) : (
                      formatPriceWithTax(selectedOrder.space.price)
                    )}
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 block">
                      ID Invoice
                    </span>
                    <span className="font-medium">
                      {selectedInvoice
                        ? selectedInvoice.invoiceId
                        : selectedOrder.invoices[
                            selectedOrder.invoices.length - 1
                          ].invoiceId}
                    </span>
                  </div>
                </div>

                <Divider className="my-1" />

                {/* Payment Method Selection */}
                <PaymentMethodSelector
                  selectedMethod={selectedPaymentMethod}
                  onMethodChange={setSelectedPaymentMethod}
                  selectedBank={selectedBank}
                  onBankChange={setSelectedBank}
                />

                {/* QRIS Payment Display */}
                {selectedPaymentMethod === "qris" && selectedInvoice && (
                  <>
                    <Divider className="my-1" />
                    <div>
                      <QRISPayment
                        invoiceId={selectedInvoice.invoiceId}
                        amount={
                          selectedInvoice.price || selectedOrder.space.price
                        }
                        timeoutDuration={600}
                        onTimeout={() => {
                          addToast({
                            title: "Warning",
                            color: "warning",
                            description:
                              "QR Code telah kadaluarsa. Silakan tutup modal dan buka kembali untuk mendapatkan QR Code baru.",
                          });
                        }}
                      />
                    </div>
                  </>
                )}

                {/* Upload Proof - Required for all payment methods */}
                {selectedPaymentMethod && (
                  <>
                    <Divider className="my-1" />
                    <div>
                      <span className="text-sm font-medium block text-gray-700 mb-2">
                        Upload Bukti Pembayaran
                      </span>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="mb-2"
                      />
                      <p className="text-xs text-gray-500 mt-1 mb-3">
                        Ukuran file maksimal: 5MB. Format: JPG, PNG, GIF
                      </p>

                      {previewImageUrl && (
                        <div className="mt-4 relative h-[250px] w-full rounded-lg overflow-hidden bg-gray-100">
                          <Image
                            src={previewImageUrl}
                            alt="Preview Bukti Pembayaran"
                            layout="fill"
                            objectFit="contain"
                          />
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </ModalBody>
          <Divider />{" "}
          <ModalFooter>
            <Button
              color="danger"
              variant="flat"
              onPress={() => {
                onClose();
                setPaymentProof(null);
                setPreviewImageUrl(null);
                setSelectedPaymentMethod(null);
                setSelectedBank(null);
              }}
              isDisabled={submitting}
            >
              Batal
            </Button>
            <Button
              color={
                selectedInvoice?.invoiceId.startsWith("REQ-")
                  ? "primary"
                  : "success"
              }
              className={
                selectedInvoice?.invoiceId.startsWith("REQ-")
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-teal-600 hover:bg-teal-700 text-white"
              }
              onClick={handlePayment}
              isLoading={submitting}
              isDisabled={!selectedPaymentMethod || !paymentProof}
            >
              Kirim Bukti Pembayaran
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Invoices Modal */}
      <Modal
        isOpen={isInvoicesOpen}
        onClose={onInvoicesClose}
        size="4xl"
        classNames={{
          base: "bg-white rounded-xl",
          header: "border-b border-gray-100",
          body: "py-6",
          footer: "border-t border-gray-100",
        }}
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-semibold text-gray-800">
                All Invoices
              </h3>
              {selectedOrder && (
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span>{selectedOrder.space.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
                      </svg>
                      <span>{selectedOrder.provider.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span>
                        #
                        {selectedOrder._id.substring(
                          selectedOrder._id.length - 8
                        )}
                      </span>
                    </div>
                  </div>
                  {isRentalActive(selectedOrder) && (
                    <Chip
                      className="h-6"
                      size="sm"
                      variant="flat"
                      color="success"
                      classNames={{
                        base: "bg-teal-50 text-teal-700",
                        content: "text-xs font-medium",
                      }}
                      startContent={
                        <span className="text-teal-500 animate-pulse mr-1">
                          ●
                        </span>
                      }
                    >
                      Active Rental Contract
                    </Chip>
                  )}
                </div>
              )}
            </div>
          </ModalHeader>
          <Divider className="bg-gray-100" />
          <ModalBody>
            {selectedOrder && (
              <Table
                aria-label="Invoices table"
                classNames={{
                  base: "border border-gray-100 rounded-lg overflow-hidden",
                  th: "bg-gray-50/50 text-gray-600 text-xs font-medium",
                  td: "text-sm",
                }}
              >
                <TableHeader>
                  <TableColumn>INVOICE ID</TableColumn>
                  <TableColumn>RELEASE DATE</TableColumn>
                  <TableColumn>PAID DATE</TableColumn>
                  <TableColumn>AMOUNT</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody>
                  {selectedOrder.invoices
                    // Filter visible invoices
                    .filter((invoice) => isInvoiceVisible(invoice.releaseDate))
                    // Sort invoices by release date (newest first)
                    .sort(
                      (a, b) =>
                        new Date(b.releaseDate).getTime() -
                        new Date(a.releaseDate).getTime()
                    )
                    .map((invoice) => {
                      // Get days until release for upcoming invoices
                      const daysToRelease = daysUntilRelease(
                        invoice.releaseDate
                      );
                      const isUpcoming = daysToRelease > 0;

                      return (
                        <TableRow
                          key={invoice._id}
                          className="hover:bg-gray-50/50"
                        >
                          <TableCell className="font-medium">
                            {invoice.invoiceId}
                            {isUpcoming && (
                              <Badge
                                color="primary"
                                variant="flat"
                                className="ml-2"
                                size="sm"
                              >
                                in {daysToRelease}{" "}
                                {daysToRelease === 1 ? "day" : "days"}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {formatDate(invoice.releaseDate)}
                          </TableCell>
                          <TableCell>
                            {invoice.paidAt ? formatDate(invoice.paidAt) : "-"}
                          </TableCell>
                          <TableCell>
                            {invoice.price
                              ? formatPriceWithTax(invoice.price)
                              : formatPriceWithTax(selectedOrder.space.price)}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2 flex-wrap">
                              <Chip
                                size="sm"
                                variant="flat"
                                color={getStatusColor(invoice.status) as any}
                                classNames={{
                                  base:
                                    invoice.status === "verified"
                                      ? "bg-teal-50 text-teal-700"
                                      : undefined,
                                  content: "text-xs font-medium",
                                }}
                              >
                                {invoice.status}
                              </Chip>
                              {invoice.invoiceId.startsWith("REQ-") ? (
                                <Chip
                                  size="sm"
                                  variant="flat"
                                  classNames={{
                                    base: "bg-blue-50 text-blue-700",
                                    content: "text-xs font-medium",
                                  }}
                                >
                                  Initial Request
                                </Chip>
                              ) : (
                                <Chip
                                  size="sm"
                                  variant="flat"
                                  classNames={{
                                    base: "bg-teal-50 text-teal-700",
                                    content: "text-xs font-medium",
                                  }}
                                >
                                  Rental Invoice
                                </Chip>
                              )}
                              {isUpcoming && (
                                <Chip
                                  size="sm"
                                  variant="flat"
                                  classNames={{
                                    base: "bg-purple-50 text-purple-700",
                                    content: "text-xs font-medium",
                                  }}
                                >
                                  Upcoming
                                </Chip>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {invoice.status === "unpaid" && (
                                <Button
                                  size="sm"
                                  className={
                                    invoice.invoiceId.startsWith("REQ-")
                                      ? "bg-blue-600 text-white hover:bg-blue-700"
                                      : "bg-green-600 text-white hover:bg-green-700"
                                  }
                                  startContent={
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="w-4 h-4"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                    >
                                      <path d="M3 10h18M7 15h.01M11 15l2 0" />
                                      <path d="M6 5h12a3 3 0 013 3v8a3 3 0 01-3 3H6a3 3 0 01-3-3V8a3 3 0 013-3z" />
                                    </svg>
                                  }
                                  onPress={() => {
                                    onInvoicesClose();
                                    openPaymentModal(selectedOrder, invoice);
                                  }}
                                >
                                  {invoice.invoiceId.startsWith("REQ-")
                                    ? "Pay Initial Request"
                                    : "Pay Rental Invoice"}
                                </Button>
                              )}
                              {invoice.status === "rejected" && (
                                <Button
                                  color="warning"
                                  size="sm"
                                  startContent={
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="icon icon-tabler icon-tabler-refresh"
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
                                      <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 4v4h4" />
                                      <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
                                    </svg>
                                  }
                                  onPress={() => {
                                    onInvoicesClose();
                                    openPaymentModal(selectedOrder, invoice);
                                  }}
                                >
                                  Resubmit
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            )}
          </ModalBody>
          <Divider className="bg-gray-100" />
          <ModalFooter>
            <Button color="default" variant="light" onPress={onInvoicesClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
