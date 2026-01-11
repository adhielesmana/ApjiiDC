"use client";

import { useState, useEffect, useContext } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { useDisclosure } from "@heroui/modal";
import { Input } from "@heroui/input";
import { Spinner } from "@heroui/spinner";
import { addToast } from "@heroui/toast";
import axios from "axios";
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
import { Link } from "@heroui/link";
import { motion } from "framer-motion";
import {
  BuildingOfficeIcon,
  ReceiptRefundIcon,
  DocumentTextIcon,
  CreditCardIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  UserCircleIcon,
  CalendarIcon,
  ChevronLeftIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  EnvelopeIcon,
  ServerIcon,
} from "@heroicons/react/24/outline";
import { PhoneIcon } from "lucide-react";
import { CustomerSettingsContext } from "../../layout";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

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

// Update the Invoice interface to include price
interface Invoice {
  invoiceId: string;
  releaseDate: string;
  paidAt?: string;
  verifiedBy?: string;
  proofOfPaid?: string;
  status: string;
  _id: string;
  price?: number; // Add price field to Invoice interface
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

export default function OrderDetailPage() {
  const { ppn } = useContext(CustomerSettingsContext);
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showProofOfPayment, setShowProofOfPayment] = useState(false);
  const [proofOfPaymentUrl, setProofOfPaymentUrl] = useState<string | null>(
    null
  );

  // Modal states
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isProofModalOpen,
    onOpen: onProofModalOpen,
    onClose: onProofModalClose,
  } = useDisclosure();

  const handleTokenExpired = () => {
    addToast({
      title: "Session Expired",
      color: "warning",
      description: "Your session has expired. Please login again.",
    });
    router.push("/login");
  };

  const fetchOrderData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/contract/${orderId}`);

      if (response.data.status === "ok") {
        setOrder(response.data.data);
      } else if (response.data.error === "Token Expired") {
        handleTokenExpired();
        return;
      } else {
        addToast({
          title: "Warning",
          color: "warning",
          description: response.data.message || "Failed to fetch order details",
        });
      }
    } catch (error: any) {
      console.error("Failed to fetch order details:", error);
      if (error.response?.data?.error === "Token Expired") {
        handleTokenExpired();
        return;
      }
      addToast({
        title: "Error",
        color: "danger",
        description:
          error.response?.data?.message || "Error loading order details",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProofOfPayment = async (invoiceId: string, proofKey: string) => {
    try {
      if (!proofKey) {
        addToast({
          title: "Warning",
          color: "warning",
          description: "No payment proof available for this invoice",
        });
        return;
      }

      const response = await fetch(
        `/api/get-s3-image?key=${encodeURIComponent(proofKey)}`
      );
      const result = await response.json();

      if (result.status === "ok" && result.url) {
        setProofOfPaymentUrl(result.url);
        onProofModalOpen();
      } else {
        addToast({
          title: "Error",
          color: "danger",
          description: "Failed to load payment proof image",
        });
      }
    } catch (error) {
      console.error("Error fetching payment proof:", error);
      addToast({
        title: "Error",
        color: "danger",
        description: "Error loading payment proof",
      });
    }
  };

  const handlePayment = async () => {
    if (!order || !paymentProof) {
      addToast({
        title: "Warning",
        color: "warning",
        description: "Please select a file for payment proof",
      });
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("contractId", order._id);
      formData.append("proof", paymentProof); // Change "file" to "proof" to match API expectation

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
          description: "Payment proof submitted successfully",
        });
        onClose();
        fetchOrderData();
      } else {
        addToast({
          title: "Error",
          color: "danger",
          description:
            response.data.message || "Failed to submit payment proof",
        });
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      addToast({
        title: "Error",
        color: "danger",
        description:
          error.response?.data?.message || "Failed to submit payment",
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

      console.log("File selected:", {
        name: file.name,
        type: file.type,
        size: file.size,
      });

      setPaymentProof(file);

      // Create preview URL for the selected image
      const fileUrl = URL.createObjectURL(file);
      setPreviewImageUrl(fileUrl);
    }
  };

  const openPaymentModal = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentProof(null);
    setPreviewImageUrl(null);
    onOpen();
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

  const calculatePriceWithPPN = (basePrice: number) => {
    if (ppn === null) return basePrice;

    const taxAmount = (basePrice * ppn) / 100;
    return basePrice + taxAmount;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatPriceWithTax = (price: number) => {
    if (ppn === null) return formatPrice(price);

    const basePrice = price;
    const withTax = calculatePriceWithPPN(price);
    const formattedWithTax = formatPrice(withTax);
    const formattedBasePrice = formatPrice(basePrice);
    const formattedTax = formatPrice((basePrice * ppn) / 100);

    return (
      <div>
        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
          {formattedWithTax}
          <span className="text-xs text-gray-500 dark:text-gray-400">
            /month
          </span>
        </span>
        {ppn > 0 && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <p>Base: {formattedBasePrice}</p>
            <p>
              PPN {ppn}%: {formattedTax}
            </p>
          </div>
        )}
      </div>
    );
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

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "active":
      case "verified":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case "pending":
      case "requires payment":
      case "pending verification":
      case "unpaid":
      case "paid":
        return <ClockIcon className="h-5 w-5 text-amber-500" />;
      case "cancelled":
      case "rejected":
        return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const isRentalActive = (order: Order): boolean => {
    return order.invoices.some((inv) => inv.invoiceId.startsWith("RNT-"));
  };

  const hasUnpaidInvoices = (order: Order): boolean => {
    // Only consider visible invoices that are unpaid
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

      // Check for unpaid invoices - only consider visible invoices
      const visibleInvoices = order.invoices.filter((invoice) =>
        isInvoiceVisible(invoice.releaseDate)
      );
      const hasUnpaidInvoices = visibleInvoices.some(
        (inv) => inv.status === "unpaid"
      );
      if (hasUnpaidInvoices) return "requires payment";

      return "active";
    }

    return latestInvoice.status;
  };

  // Get unpaid invoice if exists
  const getUnpaidInvoice = (order: Order): Invoice | null => {
    if (!order || !order.invoices) return null;

    // Filter visible invoices that are unpaid
    const visibleUnpaidInvoices = order.invoices.filter(
      (invoice) =>
        isInvoiceVisible(invoice.releaseDate) && invoice.status === "unpaid"
    );

    if (visibleUnpaidInvoices.length === 0) return null;

    // Return the earliest unpaid invoice based on release date
    return visibleUnpaidInvoices.sort(
      (a, b) =>
        new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime()
    )[0];
  };

  // Modified function to get the invoice price or fall back to space price
  const getInvoicePrice = (
    order: Order
  ): { originalPrice: number; discountedPrice: number | null } => {
    if (!order || !order.invoices || order.invoices.length === 0) {
      return { originalPrice: order?.space.price || 0, discountedPrice: null };
    }

    // Get the latest invoice to display its price
    const latestInvoice = order.invoices[order.invoices.length - 1];
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

  useEffect(() => {
    if (orderId) {
      fetchOrderData();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-10">
        {/* Hero Section Skeleton */}
        <section className="bg-[#155183] text-white py-16 relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto">
              <Skeleton className="h-6 w-32 mb-4 rounded" />
              <Skeleton className="h-12 w-2/3 rounded mb-4" />
              <Skeleton className="h-6 w-1/2 rounded" />
            </div>
          </div>
        </section>

        {/* Content Skeleton */}
        <div className="max-w-6xl mx-auto px-4 -mt-8 relative z-10">
          <Card className="border border-blue-100 dark:border-blue-900 shadow-xl overflow-hidden mb-8">
            <CardBody>
              <div className="flex flex-col gap-6">
                <Skeleton className="h-8 w-1/3 rounded" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Skeleton className="h-24 w-full rounded" />
                  <Skeleton className="h-24 w-full rounded" />
                </div>
              </div>
            </CardBody>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card className="border border-blue-100 dark:border-blue-900 shadow-md">
                <CardBody>
                  <Skeleton className="h-8 w-1/4 rounded mb-4" />
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-full rounded" />
                    <Skeleton className="h-6 w-full rounded" />
                    <Skeleton className="h-6 w-3/4 rounded" />
                  </div>
                </CardBody>
              </Card>
            </div>
            <div>
              <Card className="border border-blue-100 dark:border-blue-900 shadow-md">
                <CardBody>
                  <Skeleton className="h-8 w-1/2 rounded mb-4" />
                  <div className="space-y-3">
                    <Skeleton className="h-5 w-full rounded" />
                    <Skeleton className="h-5 w-full rounded" />
                    <Skeleton className="h-5 w-2/3 rounded" />
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <DocumentDuplicateIcon className="h-16 w-16 mx-auto text-blue-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Order Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The order you are looking for does not exist or you don't have
            permission to view it.
          </p>
          <Link
            href="/customer/orders"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center"
          >
            <ChevronLeftIcon className="h-5 w-5 mr-2" />
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const orderStatus = getOrderStatus(order);
  const unpaidInvoice = getUnpaidInvoice(order);
  const isActive = isRentalActive(order);
  const hasUnpaid = hasUnpaidInvoices(order);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-12">
      {/* Hero Section */}
      <section className="bg-[#155183] text-white py-16 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="max-w-6xl mx-auto"
          >
            <Link
              href="/customer/orders"
              className="inline-flex items-center text-blue-100 hover:text-white mb-4"
            >
              <ChevronLeftIcon className="h-5 w-5 mr-1" />
              Back to Orders
            </Link>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <h1 className="text-3xl sm:text-4xl font-bold">Order Details</h1>
              <Chip
                color={getStatusColor(orderStatus) as any}
                variant="solid"
                className={`px-3 py-1 text-sm font-medium ${
                  orderStatus === "active" ||
                  orderStatus === "completed" ||
                  orderStatus === "verified"
                    ? "bg-green-500/90 text-white"
                    : orderStatus === "pending" ||
                        orderStatus === "pending verification" ||
                        orderStatus === "requires payment" ||
                        orderStatus === "unpaid"
                      ? "bg-amber-500/90 text-white"
                      : orderStatus === "rejected"
                        ? "bg-red-500/90 text-white"
                        : "bg-gray-500/90 text-white"
                }`}
                startContent={
                  orderStatus === "active" ||
                  orderStatus === "completed" ||
                  orderStatus === "verified" ? (
                    <span className="text-white">●</span>
                  ) : orderStatus === "pending" ||
                    orderStatus === "pending verification" ||
                    orderStatus === "requires payment" ||
                    orderStatus === "unpaid" ? (
                    <span className="text-white">●</span>
                  ) : orderStatus === "rejected" ? (
                    <span className="text-white">●</span>
                  ) : null
                }
              >
                {orderStatus}
              </Chip>
            </div>
            <p className="text-xl text-blue-100 mb-6">
              Order #{order._id.substring(order._id.length - 8)} -{" "}
              {order.space.name}
            </p>
            <div className="flex flex-wrap gap-3">
              <Chip
                color="primary"
                variant="solid"
                className="bg-blue-400/20 border border-blue-300/30 text-white"
              >
                <div className="flex items-center">
                  <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                  {order.provider.name}
                </div>
              </Chip>
              <Chip
                color="primary"
                variant="solid"
                className="bg-blue-400/20 border border-blue-300/30 text-white"
              >
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Ordered on {formatDate(order.createdAt)}
                </div>
              </Chip>
              {isActive && (
                <Chip
                  color="success"
                  variant="solid"
                  className="bg-green-400/20 border border-green-300/30 text-white"
                >
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    Active Contract
                  </div>
                </Chip>
              )}
              {ppn !== null && (
                <Chip
                  color="warning"
                  variant="solid"
                  className="bg-amber-400/20 border border-amber-300/30 text-white"
                >
                  <div className="flex items-center">PPN: {ppn}%</div>
                </Chip>
              )}
            </div>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-10 right-[10%] w-64 h-64 rounded-full bg-blue-400/10"></div>
          <div className="absolute bottom-10 left-[10%] w-56 h-56 rounded-full bg-blue-400/10"></div>
        </div>
      </section>

      {/* Order Summary Card */}
      <div className="max-w-6xl mx-auto px-4 -mt-8 relative z-10">
        {/* Warning for rejected invoices */}
        {hasRejectedInvoices(order) && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="mb-6"
          >
            <Card className="border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 shadow-lg">
              <CardBody className="p-4">
                <div className="flex items-start gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5"
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
                    <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-1">
                      Invoice Rejected
                    </h3>
                    <p className="text-red-700 dark:text-red-300">
                      One or more of your payment proofs have been rejected.
                      Please check the invoice history below and resubmit your
                      payment proof.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        )}

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <Card className="border border-blue-100 dark:border-blue-900 shadow-xl overflow-hidden mb-8">
            <CardBody className="p-6">
              <div className="flex flex-col gap-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  <DocumentTextIcon className="h-5 w-5 mr-2 text-blue-600" />
                  Order Summary
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Order Status
                      </h3>
                      <Chip
                        color={getStatusColor(orderStatus) as any}
                        variant="flat"
                        size="sm"
                        startContent={getStatusIcon(orderStatus)}
                      >
                        {orderStatus}
                      </Chip>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Order ID:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {order._id}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Order Date:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatDate(order.createdAt)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Last Updated:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatDate(order.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-2">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Payment Details
                      </h3>
                    </div>
                    {/* Update price display logic to use PPN */}
                    {(() => {
                      const { originalPrice, discountedPrice } =
                        getInvoicePrice(order);
                      return (
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600 dark:text-gray-400 text-sm">
                            Monthly Price:
                          </span>
                          <div className="text-right">
                            {discountedPrice
                              ? formatPriceWithTax(discountedPrice)
                              : formatPriceWithTax(originalPrice)}
                          </div>
                        </div>
                      );
                    })()}

                    {unpaidInvoice && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-amber-600 dark:text-amber-400 flex items-center">
                            <CreditCardIcon className="h-4 w-4 mr-1" />
                            Payment Required
                          </span>
                          <Chip size="sm" color="warning" variant="flat">
                            {unpaidInvoice.invoiceId}
                          </Chip>
                        </div>
                        <Button
                          color={
                            unpaidInvoice.invoiceId.startsWith("REQ-")
                              ? "primary"
                              : "success"
                          }
                          className={`w-full mt-2 ${
                            unpaidInvoice.invoiceId.startsWith("REQ-")
                              ? "bg-blue-600 text-white hover:bg-blue-700"
                              : "bg-green-600 text-white hover:bg-green-700"
                          }`}
                          startContent={<CreditCardIcon className="h-5 w-5" />}
                          onPress={() => openPaymentModal(unpaidInvoice)}
                        >
                          {unpaidInvoice.invoiceId.startsWith("REQ-")
                            ? "Pay Initial Request"
                            : "Pay Rental Invoice"}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Main Content */}
        <div className="flex flex-col gap-6 mb-8">
          {/* Space Details - Full Width */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <Card className="border border-blue-100 dark:border-blue-900 shadow-md overflow-hidden">
              <CardBody className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-3">
                    <ServerIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {order.space.name}
                  </h3>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <Chip size="sm" color="primary" variant="flat">
                    {order.space.size}U Rack Space
                  </Chip>
                  {/* Update price display logic to use PPN */}
                  {(() => {
                    const { originalPrice, discountedPrice } =
                      getInvoicePrice(order);
                    return discountedPrice ? (
                      <div>{formatPriceWithTax(discountedPrice)}</div>
                    ) : (
                      formatPriceWithTax(originalPrice)
                    );
                  })()}
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  {order.space.description ||
                    "Premium rack space with power and cooling infrastructure for your server equipment."}
                </p>

                <Divider className="my-4" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Provider Information
                    </h4>
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar
                        className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold w-10 h-10 text-lg"
                        name={order.provider.name}
                      />
                      <div>
                        <span className="font-semibold block text-gray-900 dark:text-white">
                          {order.provider.name}
                        </span>
                        <Link
                          href={`/customer/provider/${order.provider._id}`}
                          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:underline"
                        >
                          View Provider Details
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Contact Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <EnvelopeIcon className="h-4 w-4 mr-2 text-blue-500" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {order.provider.contact.email}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <PhoneIcon className="h-4 w-4 mr-2 text-blue-500" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {order.provider.contact.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* Invoice History - Full Width Below */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <Card className="border border-blue-100 dark:border-blue-900 shadow-md overflow-hidden">
              <CardHeader className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-b border-blue-100 dark:border-blue-900">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                  <ReceiptRefundIcon className="h-5 w-5 mr-2 text-blue-600" />
                  Invoice History
                </h3>
              </CardHeader>
              <CardBody className="p-4">
                {order.invoices.length > 0 ? (
                  <Table
                    aria-label="Invoice history table"
                    removeWrapper
                    classNames={{
                      th: "bg-blue-50/50 dark:bg-blue-900/20 text-gray-700 dark:text-gray-300 font-medium",
                      td: "py-3",
                    }}
                  >
                    <TableHeader>
                      <TableColumn>INVOICE ID</TableColumn>
                      <TableColumn>TYPE</TableColumn>
                      <TableColumn>DATE</TableColumn>
                      <TableColumn>STATUS</TableColumn>
                      <TableColumn>ACTION</TableColumn>
                      <TableColumn>PRICE</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {order.invoices
                        // Filter visible invoices (past + upcoming within 7 days)
                        .filter((invoice) =>
                          isInvoiceVisible(invoice.releaseDate)
                        )
                        // Sort by release date with newest on top
                        .sort(
                          (a, b) =>
                            new Date(b.releaseDate).getTime() -
                            new Date(a.releaseDate).getTime()
                        )
                        .map((invoice) => {
                          // Check if this is the current/next unpaid invoice
                          const isRequiredPayment =
                            invoice.status === "unpaid" &&
                            order.invoices
                              .filter((inv) => inv.status === "unpaid")
                              .indexOf(invoice) === 0;

                          // Check if this is an upcoming invoice
                          const daysToRelease = daysUntilRelease(
                            invoice.releaseDate
                          );
                          const isUpcoming = daysToRelease > 0;

                          return (
                            <TableRow
                              key={invoice._id}
                              className={
                                isRequiredPayment
                                  ? "bg-amber-50/50 dark:bg-amber-900/10"
                                  : ""
                              }
                            >
                              <TableCell>
                                <div className="font-medium text-gray-900 dark:text-white">
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
                                </div>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  size="sm"
                                  variant="flat"
                                  color={
                                    invoice.invoiceId.startsWith("REQ-")
                                      ? "primary"
                                      : "success"
                                  }
                                  className="text-xs"
                                >
                                  {invoice.invoiceId.startsWith("REQ-")
                                    ? "Initial"
                                    : "Rental"}
                                </Chip>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  <div>
                                    Released: {formatDate(invoice.releaseDate)}
                                  </div>
                                  {invoice.paidAt && (
                                    <div className="text-green-600 dark:text-green-400">
                                      Paid: {formatDate(invoice.paidAt)}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2 flex-wrap">
                                  <Chip
                                    size="sm"
                                    color={
                                      getStatusColor(invoice.status) as any
                                    }
                                    variant="flat"
                                    startContent={getStatusIcon(invoice.status)}
                                  >
                                    {invoice.status}
                                  </Chip>
                                  {isRequiredPayment && (
                                    <Chip
                                      size="sm"
                                      color="warning"
                                      variant="dot"
                                      className="ml-1 text-xs"
                                    >
                                      Payment required
                                    </Chip>
                                  )}
                                  {isUpcoming && (
                                    <Chip
                                      size="sm"
                                      variant="flat"
                                      classNames={{
                                        base: "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
                                        content: "text-xs font-medium",
                                      }}
                                    >
                                      Upcoming
                                    </Chip>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  {invoice.status === "unpaid" && (
                                    <Button
                                      size="sm"
                                      color="primary"
                                      className="text-xs min-w-0 px-3"
                                      onPress={() => openPaymentModal(invoice)}
                                      startContent={
                                        <CreditCardIcon className="h-3.5 w-3.5" />
                                      }
                                    >
                                      Pay
                                    </Button>
                                  )}
                                  {invoice.status === "rejected" && (
                                    <Button
                                      size="sm"
                                      color="warning"
                                      className="text-xs min-w-0 px-3"
                                      onPress={() => openPaymentModal(invoice)}
                                      startContent={
                                        <ArrowPathIcon className="h-3.5 w-3.5" />
                                      }
                                    >
                                      Resubmit
                                    </Button>
                                  )}
                                  {(invoice.status === "paid" ||
                                    invoice.status === "verified") &&
                                    invoice.proofOfPaid && (
                                      <Button
                                        size="sm"
                                        color="default"
                                        variant="light"
                                        className="text-xs min-w-0 px-3"
                                        onPress={() =>
                                          fetchProofOfPayment(
                                            invoice.invoiceId,
                                            invoice.proofOfPaid as string
                                          )
                                        }
                                        startContent={
                                          <EyeIcon className="h-3.5 w-3.5" />
                                        }
                                      >
                                        View Proof
                                      </Button>
                                    )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {invoice.price ? (
                                    <div className="font-medium text-blue-600">
                                      {formatPriceWithTax(invoice.price)}
                                    </div>
                                  ) : (
                                    <div className="font-medium text-blue-600">
                                      {formatPriceWithTax(order.space.price)}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <DocumentTextIcon className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No invoices found for this order
                    </p>
                  </div>
                )}
              </CardBody>
              <CardFooter className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-t border-blue-100 dark:border-blue-900">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex justify-between">
                    <span>Monthly Base Rate:</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {formatPrice(order.space.price)}
                    </span>
                  </div>
                  {ppn !== null && (
                    <div className="flex justify-between mt-1">
                      <span>PPN ({ppn}%):</span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {formatPrice((order.space.price * ppn) / 100)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between mt-1">
                    <span>Total Monthly Rate:</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {ppn !== null
                        ? formatPrice(calculatePriceWithPPN(order.space.price))
                        : formatPrice(order.space.price)}
                    </span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span>Status:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {orderStatus}
                    </span>
                  </div>
                </div>
              </CardFooter>
            </Card>

            {/* Customer Information Card */}
            <Card className="border border-blue-100 dark:border-blue-900 shadow-md overflow-hidden mt-6">
              <CardHeader className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                  <UserCircleIcon className="h-5 w-5 mr-2 text-blue-600" />
                  Customer Information
                </h3>
              </CardHeader>
              <CardBody className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Avatar
                      name={order.user.fullName}
                      className="mr-3 h-10 w-10"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {order.user.fullName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {order.user.username}
                      </p>
                    </div>
                  </div>
                  <Divider className="my-2" />
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <EnvelopeIcon className="h-4 w-4 mr-2 text-blue-500" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {order.user.email}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <PhoneIcon className="h-4 w-4 mr-2 text-blue-500" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {order.user.phone}
                      </span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </div>

        {/* Actions Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center"
        >
          {/* Back: di mobile urutan terakhir (order-4), di desktop balik ke kiri (order-1) */}
          <Link
            href="/customer/orders"
            className="order-4 sm:order-1 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700
               text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg border border-gray-200
               dark:border-gray-700 inline-flex items-center shadow-sm w-full sm:w-auto justify-center"
            aria-label="Back to Orders"
          >
            <ChevronLeftIcon className="h-5 w-5 mr-2" />
            Back to Orders
          </Link>

          {/* Actions: di mobile berada di atas (order-1), di desktop di kanan (order-2) */}
          <div className="order-1 sm:order-2 flex flex-col sm:flex-row sm:flex-wrap gap-2 w-full sm:w-auto">
            {/* 1) Resubmit Payment (prioritas tertinggi bila ada) */}
            {hasRejectedInvoices(order) && getRejectedInvoice(order) && (
              <Button
                color="danger"
                className="bg-red-600 text-white hover:bg-red-700 w-full sm:w-auto"
                startContent={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                }
                onPress={() => openPaymentModal(getRejectedInvoice(order)!)}
              >
                Resubmit{" "}
                {getRejectedInvoice(order)?.invoiceId.startsWith("REQ-")
                  ? "Initial"
                  : "Rental"}{" "}
                Payment
              </Button>
            )}

            {/* 2) Pay (jika ada unpaid) */}
            {hasUnpaid && unpaidInvoice && (
              <Button
                color={
                  unpaidInvoice.invoiceId.startsWith("REQ-")
                    ? "primary"
                    : "success"
                }
                className={`w-full sm:w-auto ${
                  unpaidInvoice.invoiceId.startsWith("REQ-")
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
                startContent={<CreditCardIcon className="h-5 w-5" />}
                onPress={() => openPaymentModal(unpaidInvoice)}
              >
                {unpaidInvoice.invoiceId.startsWith("REQ-")
                  ? "Pay Initial Request"
                  : "Pay Rental Invoice"}
              </Button>
            )}

            {/* 3) View Space Details */}
            <Link
              href={`/customer/space/${order.space._id}`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm
                 inline-flex items-center w-full sm:w-auto justify-center"
              aria-label="View Space Details"
            >
              <EyeIcon className="h-5 w-5 mr-2" />
              View Space Details
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Payment Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => {
          onClose();
          setPaymentProof(null);
          setPreviewImageUrl(null);
          setSelectedInvoice(null);
        }}
        size="xl"
      >
        <ModalContent className="rounded-xl overflow-hidden">
          <ModalHeader className="flex flex-col bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/50 dark:to-blue-800/50">
            <h3 className="text-xl">Payment Confirmation</h3>
            {selectedInvoice && (
              <div className="flex flex-col text-sm font-normal text-gray-500 dark:text-gray-400">
                <p>Invoice: {selectedInvoice.invoiceId}</p>
                <p className="mt-1">
                  <span className="inline-flex items-center text-xs font-medium rounded-full px-2.5 py-0.5 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100">
                    {selectedInvoice.invoiceId.startsWith("REQ-")
                      ? "Initial Request Payment"
                      : "Rental Invoice Payment"}
                  </span>
                </p>
              </div>
            )}
          </ModalHeader>
          <Divider />
          <ModalBody>
            {order && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <span className="text-sm text-gray-500 dark:text-gray-400 block">
                      Space
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {order.space.name}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <span className="text-sm text-gray-500 dark:text-gray-400 block">
                      Provider
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {order.provider.name}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <span className="text-sm text-gray-500 dark:text-gray-400 block">
                      Amount
                    </span>
                    {selectedInvoice && selectedInvoice.price ? (
                      <div>{formatPriceWithTax(selectedInvoice.price)}</div>
                    ) : (
                      formatPriceWithTax(order.space.price)
                    )}
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <span className="text-sm text-gray-500 dark:text-gray-400 block">
                      Invoice ID
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {selectedInvoice
                        ? selectedInvoice.invoiceId
                        : order.invoices[order.invoices.length - 1].invoiceId}
                    </span>
                  </div>
                </div>

                <Divider className="my-1" />

                <div>
                  <span className="text-sm font-medium block text-gray-700 dark:text-gray-300 mb-2">
                    Upload Payment Proof
                  </span>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="mb-2"
                    classNames={{
                      inputWrapper: "border-blue-200 dark:border-blue-800",
                    }}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-3">
                    Maximum file size: 5MB. Accepted formats: JPG, PNG, GIF
                  </p>

                  {previewImageUrl && (
                    <div className="mt-4 relative h-[250px] w-full rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <img
                        src={previewImageUrl}
                        alt="Payment Proof Preview"
                        className="object-contain w-full h-full"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </ModalBody>
          <Divider />
          <ModalFooter>
            <Button
              color="danger"
              variant="flat"
              onPress={() => {
                onClose();
                setPaymentProof(null);
                setPreviewImageUrl(null);
              }}
              isDisabled={submitting}
            >
              Cancel
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
                  : "bg-green-600 hover:bg-green-700 text-white"
              }
              onClick={handlePayment}
              isLoading={submitting}
              isDisabled={!paymentProof}
            >
              {selectedInvoice?.invoiceId.startsWith("REQ-")
                ? "Submit Initial Payment"
                : "Submit Rental Payment"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Payment Proof Modal */}
      <Modal isOpen={isProofModalOpen} onClose={onProofModalClose} size="md">
        <ModalContent>
          <ModalHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/50 dark:to-blue-800/50">
            <h3 className="text-xl">Payment Information</h3>
          </ModalHeader>
          <ModalBody>
            <div className="p-4">
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                Payment has been submitted for verification.
              </p>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <div className="flex justify-between mb-2">
                  <span>Invoice ID:</span>
                  <span className="font-medium">
                    {selectedInvoice?.invoiceId}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Status:</span>
                  <Chip
                    size="sm"
                    color={
                      selectedInvoice
                        ? (getStatusColor(selectedInvoice.status) as any)
                        : "default"
                    }
                    variant="flat"
                  >
                    {selectedInvoice?.status}
                  </Chip>
                </div>
                {selectedInvoice?.paidAt && (
                  <div className="flex justify-between mb-2">
                    <span>Paid on:</span>
                    <span>{formatDate(selectedInvoice.paidAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onPress={onProofModalClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
