"use client";

import { useEffect, useState, useContext } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { Skeleton } from "@heroui/skeleton";
import { addToast } from "@heroui/toast";
import axios from "axios";
import { ProviderSettingsContext } from "../../../layout";

interface Invoice {
  invoiceId: string;
  releaseDate: string;
  paidAt?: string;
  verifiedBy?: string;
  proofOfPaid?: string;
  status: string;
  _id: string;
  price?: number;
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

interface User {
  _id: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
}

interface Space {
  _id: string;
  name: string;
  description: string;
  price: number;
  size: string;
  images: string[];
  provider: string;
}

interface Order {
  _id: string;
  by?: User;
  user?: User;
  space: Space;
  provider: any;
  paidAttempt: boolean;
  price?: number;
  createdAt: string;
  updatedAt: string;
  rent?: string;
  baa?: string;
  status?: string;
  contract?: Contract; // Make contract optional to handle cases where it might be undefined
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { ppn } = useContext(ProviderSettingsContext);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        setLoading(true);
        // The id from the URL params is actually the contract ID
        const response = await axios.get(`/api/rent/detail/${id}`);

        if (response.data.status === "ok") {
          // Log the response data for debugging
          console.log("Contract details response:", response.data.data);

          // The API returns a contract object directly, not an order with a contract
          const contractData = response.data.data;

          if (!contractData) {
            console.warn("Response is missing contract data");
            return;
          }

          // Transform the contract data into the expected Order structure
          const orderData: Order = {
            _id: contractData._id || "",
            space: contractData.space,
            provider: contractData.provider,
            paidAttempt: contractData.paidAttempt,
            createdAt: contractData.createdAt,
            updatedAt: contractData.updatedAt,
            user: contractData.user,
            // Set the contract as the entire response data
            contract: {
              _id: contractData._id,
              rent: contractData.rent,
              space: contractData.space._id,
              provider: contractData.provider._id,
              user: contractData.user._id,
              paidAttempt: contractData.paidAttempt,
              paymentPlan: contractData.paymentPlan,
              invoices: contractData.invoices || [],
              createdAt: contractData.createdAt,
              updatedAt: contractData.updatedAt,
            },
          };

          setOrder(orderData);
        } else {
          addToast({
            title: "Error",
            color: "danger",
            description:
              response.data.message || "Failed to fetch order details",
          });
        }
      } catch (error: any) {
        console.error("Error fetching order details:", error);
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

    if (id) {
      fetchOrderDetail();
    }
  }, [id]);

  // Helper functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };
  const getOrderStatus = (order: Order): string => {
    // Ensure status is a string before calling toLowerCase
    if (
      order.status &&
      typeof order.status === "string" &&
      order.status.toLowerCase() === "active"
    ) {
      return "active";
    }

    // Check if contract exists before accessing its properties
    if (!order.contract) {
      return "pending";
    }

    const invoices = order.contract.invoices || [];
    if (invoices.length === 0) {
      return "pending";
    }

    const latestInvoice = [...invoices].sort(
      (a, b) =>
        new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
    )[0];

    // Ensure status is a string
    const status =
      typeof latestInvoice.status === "string"
        ? latestInvoice.status
        : "pending";

    switch (status) {
      case "verified":
        return "provisioned";
      case "paid":
        return "pending verification";
      case "unpaid":
        return "pending payment";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    // Make sure status is a string before trying to use toLowerCase()
    if (typeof status !== "string") {
      return "default";
    }

    switch (status.toLowerCase()) {
      case "completed":
        return "success";
      case "active":
        return "success";
      case "provisioned":
        return "primary";
      case "verified":
        return "success";
      case "pending":
      case "pending payment":
      case "pending verification":
        return "warning";
      case "cancelled":
        return "danger";
      default:
        return "default";
    }
  };

  const calculatePriceWithPPN = (basePrice: number) => {
    if (ppn === null) return basePrice;
    const taxAmount = (basePrice * ppn) / 100;
    return basePrice + taxAmount;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-1/3 rounded" />
          <Skeleton className="h-10 w-24 rounded" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3 rounded" />
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <Skeleton className="h-6 w-full rounded" />
              <Skeleton className="h-6 w-2/3 rounded" />
              <Skeleton className="h-6 w-1/2 rounded" />
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Order Not Found
          </h3>
          <p className="text-gray-500 mb-6">
            The order you are looking for doesn't exist or you may not have
            permission to view it.
          </p>
          <Button
            color="primary"
            onPress={() => router.push("/provider/orders")}
          >
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }
  const customer = order.by || order.user;
  const orderStatus = getOrderStatus(order);

  // Check if contract exists before accessing its properties
  // This will prevent "TypeError: order.contract is undefined"
  const contract: Contract = order.contract || {
    _id: "",
    rent: "",
    space: "",
    provider: "",
    user: "",
    paidAttempt: false,
    paymentPlan: 0,
    invoices: [],
    createdAt: "",
    updatedAt: "",
  };
  const invoices = contract.invoices || [];

  return (
    <div className="space-y-6">
      {/* Header with back button and actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="light"
            onPress={() => router.push("/provider/orders")}
            startContent={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            }
          >
            Back to Orders
          </Button>
          <h1 className="text-2xl font-bold">Order Details</h1>
        </div>

        <Chip
          color={getStatusColor(orderStatus) as any}
          variant="flat"
          size="lg"
        >
          {orderStatus}
        </Chip>
      </div>

      {/* Order Summary Card */}
      <Card className="shadow-sm border-0">
        <CardHeader className="border-b">
          <h2 className="text-xl font-semibold">Order Summary</h2>
        </CardHeader>
        <CardBody className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-2">
                Order Information
              </h3>
              <div className="space-y-2">
                {" "}
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-medium">{order._id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">
                    {formatDate(order.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="font-medium">
                    {formatDate(order.updatedAt)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Contract ID:</span>
                  <span className="font-medium">
                    {order.contract?._id || "Not available"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Chip
                    size="sm"
                    color={getStatusColor(orderStatus) as any}
                    variant="flat"
                  >
                    {orderStatus}
                  </Chip>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-2">
                Customer Information
              </h3>{" "}
              {customer && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{customer.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{customer.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{customer.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Username:</span>
                    <span className="font-medium">{customer.username}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Divider className="my-6" />

          <div>
            <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-4">
              Space Details
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-lg">{order.space.name}</h4>
                  <p className="text-gray-600 mt-1">
                    {order.space.description}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-blue-600 text-lg">
                    Rp{" "}
                    {calculatePriceWithPPN(order.space.price).toLocaleString()}
                  </div>
                  {ppn !== null && (
                    <div className="text-xs text-gray-500">
                      (incl. {ppn}% tax)
                    </div>
                  )}
                  <div className="mt-1 text-xs bg-gray-200 px-2 py-0.5 rounded">
                    Size: {order.space.size}U
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Divider className="my-6" />

          <div>
            <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-4">
              Invoices
            </h3>

            {invoices.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoice ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Released
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Paid At
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invoices.map((invoice) => (
                      <tr key={invoice._id}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                          {invoice.invoiceId}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          {formatDate(invoice.releaseDate)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Chip
                            size="sm"
                            color={getStatusColor(invoice.status) as any}
                            variant="flat"
                          >
                            {invoice.status}
                          </Chip>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          {invoice.price && (
                            <>
                              Rp{" "}
                              {calculatePriceWithPPN(
                                invoice.price
                              ).toLocaleString()}
                              {ppn !== null && (
                                <span className="text-xs text-gray-500 block">
                                  (Base: Rp {invoice.price.toLocaleString()})
                                </span>
                              )}
                            </>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          {invoice.paidAt ? formatDate(invoice.paidAt) : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <p className="text-gray-500">
                  No invoices available for this order.
                </p>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Action buttons */}
      <div className="flex justify-end mt-4 gap-3">
        <Button variant="light" onPress={() => router.push("/provider/orders")}>
          Back to Orders
        </Button>

        {orderStatus === "provisioned" && (
          <Button
            color="primary"
            onPress={() => {
              // Handle activation
              router.push(`/provider/orders?activate=${order._id}`);
            }}
          >
            Activate Order
          </Button>
        )}
      </div>
    </div>
  );
}
