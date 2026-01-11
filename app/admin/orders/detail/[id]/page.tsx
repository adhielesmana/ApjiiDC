"use client";

import { useContext, useEffect, useState, use } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import axios from "axios";
import { addToast } from "@heroui/toast";
import { Skeleton } from "@heroui/skeleton";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Divider } from "@heroui/divider";
import { useRouter } from "next/navigation";
import { Tabs, Tab } from "@heroui/tabs";
import Image from "next/image";
import { AdminSettingsContext } from "../../../layout";

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
  baa?: string;
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
  contract: any;
  _id: string;
  rent: string;
  space: Space;
  provider: Provider;
  user: By; // The user property corresponds to the "by" field in our component
  paidAttempt: boolean;
  paymentPlan: number;
  invoices: Invoice[];
  createdAt: string;
  updatedAt: string;
  __v?: number;
  baa?: string;
}

export default function OrderDetailPage({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>;
}) {
  const { ppn } = useContext(AdminSettingsContext);
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [verifyingInvoice, setVerifyingInvoice] = useState<string | null>(null);
  const [proofImageUrl, setProofImageUrl] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(false);

  // Unwrap params using React.use
  const unwrappedParams = params instanceof Promise ? use(params) : params;
  const { id } = unwrappedParams;

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/rent/detail/${id}`);
      if (response.data.status === "ok") {
        setOrder(response.data.data);
      } else {
        addToast({
          title: "Error",
          color: "danger",
          description: response.data.message || "Failed to fetch order details",
        });
      }
    } catch (error: any) {
      addToast({
        title: "Error",
        color: "danger",
        description:
          error.response?.data?.message || "Failed to fetch order details",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "provisioned":
        return "primary";
      case "active":
        return "success";
      case "pending":
      case "unpaid":
      case "pending payment":
      case "pending verification":
        return "warning";
      case "suspend":
        return "danger";
      case "dismantle":
        return "default";
      case "verified":
      case "paid":
        return "success";
      default:
        return "default";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleVerifyInvoice = async (invoiceId: string) => {
    try {
      setVerifyingInvoice(invoiceId);
      const response = await axios.post("/api/invoice/verify", {
        invoiceId,
      });

      if (response.data.status === "ok") {
        addToast({
          title: "Success",
          color: "success",
          description: "Invoice verified successfully",
        });
        fetchOrder();
      } else {
        throw new Error(response.data.message || "Failed to verify invoice");
      }
    } catch (error: any) {
      addToast({
        title: "Error",
        color: "danger",
        description:
          error.response?.data?.message ||
          error.message ||
          "Failed to verify invoice",
      });
    } finally {
      setVerifyingInvoice(null);
    }
  };

  // Get unique invoices to prevent duplicates
  const getUniqueInvoices = (invoices: Invoice[] = []) => {
    const uniqueInvoices: Invoice[] = [];
    const seenIds = new Set<string>();

    invoices.forEach((inv) => {
      if (!seenIds.has(inv._id)) {
        seenIds.add(inv._id);
        uniqueInvoices.push(inv);
      }
    });

    return uniqueInvoices;
  };

  // Function to fetch the actual image URL from the S3 service
  const fetchProofImageUrl = async (proofKey: string) => {
    try {
      setLoadingImage(true);
      const response = await axios.get(
        `/api/get-s3-image?key=${encodeURIComponent(proofKey)}`
      );

      if (response.data.status === "ok" && response.data.url) {
        setProofImageUrl(response.data.url);
      } else {
        console.error("Failed to get image URL:", response.data);
        addToast({
          title: "Error",
          color: "danger",
          description: "Failed to load payment proof image",
        });
        setProofImageUrl(null);
      }
    } catch (error) {
      console.error("Error fetching image URL:", error);
      addToast({
        title: "Error",
        color: "danger",
        description: "Failed to load payment proof image",
      });
      setProofImageUrl(null);
    } finally {
      setLoadingImage(false);
    }
  };

  // Modified setViewInvoice to fetch the image URL when an invoice with proof is selected
  const handleViewInvoice = (invoice: Invoice) => {
    setViewInvoice(invoice);
    setProofImageUrl(null); // Reset image URL

    if (invoice.proofOfPaid) {
      fetchProofImageUrl(invoice.proofOfPaid);
    }
  };

  const calculatePriceWithPPN = (basePrice: number) => {
    if (ppn === null) return basePrice;

    const taxAmount = (basePrice * ppn) / 100;
    return basePrice + taxAmount;
  };

  const formatPriceWithTax = (price: number) => {
    const formattedPrice = new Intl.NumberFormat("id-ID").format(price);

    if (ppn === null) return `Rp ${formattedPrice}`;

    const basePrice = price;
    const withTax = calculatePriceWithPPN(price);
    const formattedWithTax = new Intl.NumberFormat("id-ID").format(withTax);
    const taxAmount = new Intl.NumberFormat("id-ID").format(
      (basePrice * ppn) / 100
    );

    return (
      <div className="space-y-1">
        <span className="font-medium text-lg">Rp {formattedWithTax}</span>
        <div className="text-xs text-gray-500">
          <div>Base: Rp {formattedPrice}</div>
          <div>
            Tax ({ppn}%): Rp {taxAmount}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="border-0 shadow-md rounded-xl overflow-hidden">
          <CardBody>
            <Skeleton className="h-8 w-1/3 rounded mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Skeleton className="h-5 w-3/4 rounded mb-3" />
                <Skeleton className="h-5 w-2/3 rounded mb-3" />
                <Skeleton className="h-5 w-1/2 rounded mb-3" />
              </div>
              <div>
                <Skeleton className="h-5 w-3/4 rounded mb-3" />
                <Skeleton className="h-5 w-2/3 rounded mb-3" />
                <Skeleton className="h-5 w-1/2 rounded mb-3" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center p-10">
        <div className="text-center">
          <div className="bg-red-50 rounded-full p-4 inline-block mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">
            Order Not Found
          </h3>
          <p className="text-gray-500 mb-6">
            The order you are looking for could not be found or may have been
            removed.
          </p>
          <Button
            color="primary"
            onPress={() => router.push("/admin/all-orders")}
          >
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  // Invoice Modal
  const renderInvoiceModal = () => (
    <Modal
      isOpen={!!viewInvoice}
      onClose={() => {
        setViewInvoice(null);
        setProofImageUrl(null);
      }}
      size="2xl"
    >
      <ModalContent className="rounded-xl overflow-hidden">
        <ModalHeader className="flex flex-col">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl">Invoice Details</h3>
              {viewInvoice && (
                <p className="text-sm font-normal text-gray-500">
                  Invoice: {viewInvoice.invoiceId}
                </p>
              )}
            </div>
            {viewInvoice && (
              <Chip
                color={getStatusColor(viewInvoice.status) as any}
                variant="flat"
              >
                {viewInvoice.status}
              </Chip>
            )}
          </div>
        </ModalHeader>
        <Divider />
        <ModalBody>
          {viewInvoice && (
            <div className="mb-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-500 block">Invoice ID</span>
                  <span className="font-medium">{viewInvoice.invoiceId}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Release Date</span>
                  <span className="font-medium">
                    {formatDate(viewInvoice.releaseDate)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Status</span>
                  <span className="font-medium">{viewInvoice.status}</span>
                </div>
                {viewInvoice.price !== undefined && (
                  <div className="col-span-2">
                    <span className="text-gray-500 block">Price</span>
                    {formatPriceWithTax(viewInvoice.price)}
                  </div>
                )}
                {viewInvoice.paidAt && (
                  <div>
                    <span className="text-gray-500 block">Paid At</span>
                    <span className="font-medium">
                      {formatDate(viewInvoice.paidAt)}
                    </span>
                  </div>
                )}
                {viewInvoice.verifiedBy && (
                  <div>
                    <span className="text-gray-500 block">Verified By</span>
                    <span className="font-medium">
                      {viewInvoice.verifiedBy}
                    </span>
                  </div>
                )}
                {viewInvoice.expired && (
                  <div>
                    <span className="text-gray-500 block">Expires On</span>
                    <span className="font-medium">
                      {formatDate(viewInvoice.expired)}
                    </span>
                  </div>
                )}
              </div>

              {viewInvoice.proofOfPaid && (
                <div className="mt-4">
                  <span className="text-gray-500 block mb-2">
                    Proof of Payment
                  </span>
                  <div className="border rounded-lg overflow-hidden">
                    {loadingImage ? (
                      <div className="h-[300px] w-full flex items-center justify-center bg-gray-100">
                        <div className="text-center">
                          <svg
                            className="animate-spin h-8 w-8 text-primary mx-auto mb-2"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          <p className="text-sm text-gray-500">
                            Loading image...
                          </p>
                        </div>
                      </div>
                    ) : proofImageUrl ? (
                      <Image
                        src={proofImageUrl}
                        alt="Payment Proof"
                        width={400}
                        height={300}
                        className="mx-auto object-contain max-h-[300px]"
                      />
                    ) : (
                      <div className="h-[300px] w-full flex items-center justify-center bg-gray-100">
                        <div className="text-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-12 text-gray-400 mx-auto mb-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <p className="text-sm text-gray-500">
                            Failed to load image
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  {proofImageUrl && (
                    <div className="mt-2 text-center">
                      <a
                        href={proofImageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline text-sm"
                      >
                        Open Full Image
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </ModalBody>
        <Divider />
        <ModalFooter>
          {viewInvoice && viewInvoice.status === "paid" && (
            <Button
              color="success"
              onPress={() => {
                handleVerifyInvoice(viewInvoice._id);
                setViewInvoice(null);
              }}
              isLoading={verifyingInvoice === viewInvoice._id}
              className="mr-2"
            >
              Verify Payment
            </Button>
          )}
          <Button
            color="primary"
            onPress={() => {
              setViewInvoice(null);
              setProofImageUrl(null);
            }}
            variant="flat"
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );

  // Derive the status from invoices
  const getOrderStatus = (order: Order): string => {
    if (!order.invoices || order.invoices.length === 0) {
      return "pending";
    }

    // Sort invoices to get the latest
    const latestInvoice = [...order.invoices].sort(
      (a, b) =>
        new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
    )[0];

    if (latestInvoice.status === "verified") {
      return "active"; // If latest invoice is verified, order is active
    }

    if (latestInvoice.status === "paid") {
      return "pending verification";
    }

    if (latestInvoice.status === "unpaid") {
      return "pending payment";
    }

    return latestInvoice.status || "pending";
  };

  const orderStatus = getOrderStatus(order);
  const orderInvoices = order.invoices || [];
  const unpaidInvoices = getUniqueInvoices(orderInvoices).filter(
    (inv) => inv.status === "unpaid"
  );
  const otherInvoices = getUniqueInvoices(orderInvoices).filter(
    (inv) => inv.status !== "unpaid"
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {renderInvoiceModal()}

      {/* Modern Header Section */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.5))]"></div>
        <div className="relative p-8 text-white">
          <div className="flex items-center gap-4 mb-6">
            <Button
              color="default"
              variant="solid"
              className="bg-white backdrop-blur-sm "
              startContent={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              }
              onPress={() => router.push("/admin/all-orders")}
            >
              Back to Orders
            </Button>
            <Button
              color="default"
              className="bg-white backdrop-blur-sm "
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
              onPress={fetchOrder}
            >
              Refresh
            </Button>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">
                {order.space.name}
              </h1>
              <p className="text-white/80 max-w-2xl">
                {order.space.description}
              </p>
              {ppn !== null && (
                <span className="mt-2 inline-block bg-white/20 backdrop-blur-sm text-white px-2 py-0.5 rounded text-sm">
                  PPN Rate: {ppn}%
                </span>
              )}
            </div>
            {/* <Chip
              color={getStatusColor(orderStatus) as any}
              size="lg"
              variant="solid"
              className="text-base px-4 py-2 font-medium"
            >
              {orderStatus}
            </Chip> */}
          </div>
        </div>
      </div>

      {/* Information Cards with Modern Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Customer Info Card - Updated Design */}
        <Card className="border border-gray-100 shadow-md hover:shadow-lg transition-all duration-200 rounded-xl overflow-hidden">
          <CardHeader className="flex gap-3 border-b border-gray-100 bg-gray-50/50">
            <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-2 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Customer Information</h3>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-4 divide-y divide-gray-100">
              <div>
                <span className="text-gray-500 text-sm">Full Name</span>
                <p className="font-medium">{order.user.fullName}</p>
              </div>
              <div>
                <span className="text-gray-500 text-sm">Username</span>
                <p className="font-medium">{order.user.username}</p>
              </div>
              <div>
                <span className="text-gray-500 text-sm">Email</span>
                <p className="font-medium">{order.user.email}</p>
              </div>
              <div>
                <span className="text-gray-500 text-sm">Phone</span>
                <p className="font-medium">{order.user.phone}</p>
              </div>
              <div>
                <span className="text-gray-500 text-sm">Role</span>
                <p className="font-medium">{order.user.roleType}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Provider Info Card - Updated Design */}
        <Card className="border border-gray-100 shadow-md hover:shadow-lg transition-all duration-200 rounded-xl overflow-hidden">
          <CardHeader className="flex gap-3 border-b border-gray-100 bg-gray-50/50">
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-2 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-600"
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
            </div>
            <div>
              <h3 className="text-lg font-semibold">Provider Information</h3>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-4 divide-y divide-gray-100">
              <div>
                <span className="text-gray-500 text-sm">Provider Name</span>
                <p className="font-medium">{order.provider.name}</p>
              </div>
              <div>
                <span className="text-gray-500 text-sm">Email</span>
                <p className="font-medium">{order.provider.contact.email}</p>
              </div>
              <div>
                <span className="text-gray-500 text-sm">Phone</span>
                <p className="font-medium">{order.provider.contact.phone}</p>
              </div>
              {order.provider.address && (
                <div>
                  <span className="text-gray-500 block">Address</span>
                  <p className="font-medium">{order.provider.address}</p>
                </div>
              )}
              {order.provider.description && (
                <div>
                  <span className="text-gray-500 block">Description</span>
                  <p className="font-medium">{order.provider.description}</p>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Invoices Section - Modern Card Design */}
      <Card className="border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl overflow-hidden">
        <CardHeader className="flex gap-3 border-b border-gray-100 bg-gray-50/50">
          <div className="bg-gradient-to-br from-amber-100 to-orange-100 p-2 rounded-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-amber-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Invoices</h3>
            <p className="text-sm text-gray-500">
              Payment history and upcoming invoices
            </p>
          </div>
        </CardHeader>
        <CardBody className="p-6">
          {/* Unpaid Invoices */}
          {unpaidInvoices.length > 0 && (
            <div className="mb-8">
              <h4 className="text-md font-semibold mb-4 flex items-center text-red-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Upcoming Invoices
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {unpaidInvoices.map((invoice) => (
                  <Card
                    key={invoice._id}
                    className="group border border-red-200 bg-gradient-to-br from-red-50 to-white rounded-xl hover:shadow-md transition-all duration-200"
                  >
                    <CardBody className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium">{invoice.invoiceId}</h5>
                          <p className="text-sm text-gray-600">
                            Released: {formatDate(invoice.releaseDate)}
                          </p>
                          {invoice.expired && (
                            <p className="text-sm text-red-600 font-semibold">
                              Expires: {formatDate(invoice.expired)}
                            </p>
                          )}
                          {invoice.price && (
                            <div className="mt-2">
                              {formatPriceWithTax(invoice.price)}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Chip color="warning" variant="flat">
                            {invoice.status}
                          </Chip>
                          <Button
                            size="sm"
                            color="primary"
                            onPress={() => handleViewInvoice(invoice)}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Other Invoices */}
          {otherInvoices.length > 0 && (
            <div>
              <h4 className="text-md font-semibold mb-4 text-gray-700">
                Invoice History
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {otherInvoices.map((invoice) => (
                  <Card
                    key={invoice._id}
                    className="group border border-gray-200 hover:border-gray-300 bg-gradient-to-br from-gray-50 to-white rounded-xl hover:shadow-md transition-all duration-200"
                  >
                    <CardBody className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium">{invoice.invoiceId}</h5>
                          <p className="text-sm text-gray-600">
                            Released: {formatDate(invoice.releaseDate)}
                          </p>
                          {invoice.paidAt && (
                            <p className="text-sm text-green-600">
                              Paid: {formatDate(invoice.paidAt)}
                            </p>
                          )}
                          {invoice.price && (
                            <div className="mt-2">
                              {formatPriceWithTax(invoice.price)}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Chip
                            color={getStatusColor(invoice.status) as any}
                            variant="flat"
                          >
                            {invoice.status}
                          </Chip>
                          <Button
                            size="sm"
                            color="primary"
                            onPress={() => handleViewInvoice(invoice)}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {orderInvoices.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full p-4 inline-block mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <p className="text-gray-500">
                No invoices available for this order
              </p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Invoice Modal */}
      <Modal
        isOpen={!!viewInvoice}
        onClose={() => {
          setViewInvoice(null);
          setProofImageUrl(null);
        }}
        size="2xl"
      >
        <ModalContent className="rounded-xl overflow-hidden">
          <ModalHeader className="flex flex-col">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl">Invoice Details</h3>
                {viewInvoice && (
                  <p className="text-sm font-normal text-gray-500">
                    Invoice: {viewInvoice.invoiceId}
                  </p>
                )}
              </div>
              {viewInvoice && (
                <Chip
                  color={getStatusColor(viewInvoice.status) as any}
                  variant="flat"
                >
                  {viewInvoice.status}
                </Chip>
              )}
            </div>
          </ModalHeader>
          <Divider />
          <ModalBody>
            {viewInvoice && (
              <div className="mb-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-500 block">Invoice ID</span>
                    <span className="font-medium">{viewInvoice.invoiceId}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Release Date</span>
                    <span className="font-medium">
                      {formatDate(viewInvoice.releaseDate)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Status</span>
                    <span className="font-medium">{viewInvoice.status}</span>
                  </div>
                  {viewInvoice.price !== undefined && (
                    <div className="col-span-2">
                      <span className="text-gray-500 block">Price</span>
                      {formatPriceWithTax(viewInvoice.price)}
                    </div>
                  )}
                  {viewInvoice.paidAt && (
                    <div>
                      <span className="text-gray-500 block">Paid At</span>
                      <span className="font-medium">
                        {formatDate(viewInvoice.paidAt)}
                      </span>
                    </div>
                  )}
                  {viewInvoice.verifiedBy && (
                    <div>
                      <span className="text-gray-500 block">Verified By</span>
                      <span className="font-medium">
                        {viewInvoice.verifiedBy}
                      </span>
                    </div>
                  )}
                  {viewInvoice.expired && (
                    <div>
                      <span className="text-gray-500 block">Expires On</span>
                      <span className="font-medium">
                        {formatDate(viewInvoice.expired)}
                      </span>
                    </div>
                  )}
                </div>

                {viewInvoice.proofOfPaid && (
                  <div className="mt-4">
                    <span className="text-gray-500 block mb-2">
                      Proof of Payment
                    </span>
                    <div className="border rounded-lg overflow-hidden">
                      {loadingImage ? (
                        <div className="h-[300px] w-full flex items-center justify-center bg-gray-100">
                          <div className="text-center">
                            <svg
                              className="animate-spin h-8 w-8 text-primary mx-auto mb-2"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            <p className="text-sm text-gray-500">
                              Loading image...
                            </p>
                          </div>
                        </div>
                      ) : proofImageUrl ? (
                        <Image
                          src={proofImageUrl}
                          alt="Payment Proof"
                          width={400}
                          height={300}
                          className="mx-auto object-contain max-h-[300px]"
                        />
                      ) : (
                        <div className="h-[300px] w-full flex items-center justify-center bg-gray-100">
                          <div className="text-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-12 w-12 text-gray-400 mx-auto mb-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <p className="text-sm text-gray-500">
                              Failed to load image
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    {proofImageUrl && (
                      <div className="mt-2 text-center">
                        <a
                          href={proofImageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline text-sm"
                        >
                          Open Full Image
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </ModalBody>
          <Divider />
          <ModalFooter>
            {viewInvoice && viewInvoice.status === "paid" && (
              <Button
                color="success"
                onPress={() => {
                  handleVerifyInvoice(viewInvoice._id);
                  setViewInvoice(null);
                }}
                isLoading={verifyingInvoice === viewInvoice._id}
                className="mr-2"
              >
                Verify Payment
              </Button>
            )}
            <Button
              color="primary"
              onPress={() => {
                setViewInvoice(null);
                setProofImageUrl(null);
              }}
              variant="flat"
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
