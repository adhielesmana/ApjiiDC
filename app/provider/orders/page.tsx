"use client";

import { useEffect, useState, useContext, useMemo } from "react";
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Button, ButtonGroup } from "@heroui/button";
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
import { ProviderSettingsContext } from "../layout";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Tabs, Tab } from "@heroui/tabs";
import { Pagination } from "../../../components/pagination";
import { Accordion, AccordionItem } from "@heroui/accordion";
import { Badge } from "@heroui/badge";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { ActionsSection } from "./actions-section";

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
  contract: Contract;
}

// S3Image component to handle async image loading
const S3Image = ({
  imagePath,
  onClick,
}: {
  imagePath: string | undefined;
  onClick?: () => void;
}) => {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const loadImage = async () => {
      if (!imagePath) {
        setError(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        if (imagePath.startsWith("http")) {
          setImageUrl(imagePath);
        } else {
          // Use the S3 image API to get the direct URL
          const response = await axios.get(
            `/api/get-s3-image?key=${encodeURIComponent(imagePath)}`
          );
          console.log("S3 image response:", response.data);
          if (response.data && response.data.url) {
            setImageUrl(response.data.url);
          } else {
            setError(true);
          }
        }
      } catch (err) {
        console.error("Error loading S3 image:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [imagePath]);

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[200px] bg-gray-50">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !imageUrl) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full min-h-[200px] text-center p-4 bg-gray-50">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 text-gray-400 mb-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <p className="text-gray-500 font-medium">Unable to load image</p>
        <p className="text-gray-400 text-sm mt-1">
          The image may not be available
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 w-full h-full flex items-center justify-center">
      <img
        src={imageUrl}
        alt="Proof of Payment"
        className="object-contain w-full h-full cursor-pointer hover:opacity-90 transition-opacity"
        onClick={onClick}
      />
    </div>
  );
};

// Download S3 image component
const DownloadS3Image = ({
  imagePath,
  fileName,
}: {
  imagePath: string | undefined;
  fileName: string;
}) => {
  const [downloadUrl, setDownloadUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadDownloadUrl = async () => {
      if (!imagePath) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        if (imagePath.startsWith("http")) {
          setDownloadUrl(imagePath);
        } else {
          // Use the S3 image API to get the direct URL
          const response = await axios.get(
            `/api/get-s3-image?key=${encodeURIComponent(imagePath)}`
          );
          if (response.data && response.data.url) {
            setDownloadUrl(response.data.url);
          }
        }
      } catch (err) {
        console.error("Error loading download URL:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDownloadUrl();
  }, [imagePath]);

  if (loading) {
    return (
      <div className="text-blue-600 text-sm flex items-center gap-1 opacity-70 px-2 py-1 rounded hover:bg-blue-50">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        Loading download link...
      </div>
    );
  }

  if (!downloadUrl) {
    return null;
  }

  return (
    <a
      href={downloadUrl}
      download={fileName}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 text-sm flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-50 transition-colors w-fit"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16v-5h.581m0 0a8.003 8.003 0 0115.357 2m-15.357-2H15"
        />
      </svg>
      Download Image
    </a>
  );
};

export default function ProviderOrdersPage() {
  const { ppn } = useContext(ProviderSettingsContext);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activatingOrder, setActivatingOrder] = useState<string | null>(null);
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [activeTab, setActiveTab] = useState("all");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/rent/list");

      if (response.data.status === "ok") {
        // Map the response data to our Order interface
        const mappedOrders = response.data.data.map((order: any) => ({
          ...order,
          by: order.by || order.user,
          price: order.price || order.space.price,
          contract: order.contract,
        }));
        setOrders(mappedOrders || []);
      } else {
        addToast({
          title: "Error",
          color: "danger",
          description: response.data.message || "Failed to load orders",
        });
      }
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      addToast({
        title: "Error",
        color: "danger",
        description: error.response?.data?.message || "Failed to load orders",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleActivation = async (contractId: string) => {
    try {
      if (!selectedFile) {
        addToast({
          title: "Error",
          color: "danger",
          description: "Please select a BAA document first",
        });
        return;
      }

      setLoading(true);
      const formData = new FormData();
      formData.append("contractId", contractId);
      formData.append("baa", selectedFile);

      console.log("Form data:", formData);

      const response = await axios.post("/api/rent/activate", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.status === "ok") {
        addToast({
          title: "Success",
          color: "success",
          description: "Order activated successfully",
        });
        setSelectedFile(null);
        setActivatingOrder(null);
        fetchOrders();
      } else {
        throw new Error(response.data.message || "Failed to activate order");
      }
    } catch (error: any) {
      console.error("Activation error:", error);
      addToast({
        title: "Error",
        color: "danger",
        description:
          error.response?.data?.message ||
          error.message ||
          "Failed to activate order",
      });
    } finally {
      setLoading(false);
    }
  };

  // Add this helper function to filter unique invoices
  const getUniqueInvoices = (invoices: Invoice[]) => {
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

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "success";
      case "active":
        return "success";
      case "provisioned":
        return "cyan";
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Add function to view proof of payment
  const [isImageViewOpen, setIsImageViewOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const [imageLoading, setImageLoading] = useState(false);

  const getS3ImageUrl = async (imagePath: string | undefined) => {
    if (!imagePath) return "";

    // If the image is already a full URL, return it as is
    if (imagePath.startsWith("http")) return imagePath;

    // Otherwise, fetch the URL from the API
    try {
      setImageLoading(true);
      const response = await axios.get(
        `/api/get-s3-image?key=${encodeURIComponent(imagePath)}`
      );
      if (response.data && response.data.url) {
        return response.data.url;
      }
      return "";
    } catch (error) {
      console.error("Error fetching S3 image URL:", error);
      return "";
    } finally {
      setImageLoading(false);
    }
  };

  const viewImage = async (imagePath: string | undefined) => {
    if (!imagePath) return;

    setImageLoading(true);
    const imageUrl = await getS3ImageUrl(imagePath);
    if (imageUrl) {
      setCurrentImage(imageUrl);
      setIsImageViewOpen(true);
    } else {
      addToast({
        title: "Error",
        color: "danger",
        description: "Unable to load image",
      });
    }
    setImageLoading(false);
  };
  // Get the latest invoice status or a default status
  const getOrderStatus = (order: Order): string => {
    // If the order has a direct status, prioritize it (this handles active and provisioned cases directly from API)
    if (order.status) {
      return order.status.toLowerCase();
    }

    // Otherwise check invoices
    const invoices = order.contract?.invoices || [];
    if (invoices.length === 0) {
      return "pending";
    }

    // Find the latest invoice by release date
    const latestInvoice = [...invoices].sort(
      (a, b) =>
        new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
    )[0];

    switch (latestInvoice.status) {
      case "verified":
        // If invoice is verified but order doesn't have a BAA, it should be provisioned
        return order.baa ? "active" : "provisioned";
      case "paid":
        return "pending verification";
      case "unpaid":
        return "pending payment";
      default:
        return latestInvoice.status;
    }
  };

  // Add PPN calculation functions
  const calculatePriceWithPPN = (basePrice: number) => {
    if (ppn === null) return basePrice;

    const taxAmount = (basePrice * ppn) / 100;
    return basePrice + taxAmount;
  };

  const formatPriceWithTax = (price: number) => {
    if (ppn === null) return `Rp ${price.toLocaleString()}`;

    const basePrice = price;
    const withTax = calculatePriceWithPPN(price);

    return (
      <div>
        <p className="text-xl text-primary font-bold">
          Rp {withTax.toLocaleString()}
        </p>
        <div className="text-xs text-gray-500">
          <p>Base: Rp {basePrice.toLocaleString()}</p>
          <p>
            PPN {ppn}%: Rp {((basePrice * ppn) / 100).toLocaleString()}
          </p>
        </div>
      </div>
    );
  };

  // Filter and sort functions
  const filterOrders = (orders: Order[]) => {
    return orders.filter((order) => {
      // Filter by search term
      const customer = order.by || order.user;
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        (customer && customer.fullName.toLowerCase().includes(searchLower)) ||
        order.space.name.toLowerCase().includes(searchLower) ||
        (order.contract?._id &&
          order.contract._id.toLowerCase().includes(searchLower));

      // Filter by status
      const orderStatus = getOrderStatus(order);
      const matchesStatus =
        statusFilter === "all" || statusFilter === orderStatus;

      return matchesSearch && matchesStatus;
    });
  };

  const sortOrders = (orders: Order[]) => {
    return [...orders].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "price-high":
          return (b.price || b.space.price) - (a.price || a.space.price);
        case "price-low":
          return (a.price || a.space.price) - (b.price || b.space.price);
        case "name-asc":
          return a.space.name.localeCompare(b.space.name);
        case "name-desc":
          return b.space.name.localeCompare(a.space.name);
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });
  };
  // Calculate status counts for tabs
  const statusCounts = useMemo(() => {
    return {
      all: orders.length,
      active: orders.filter((o) => getOrderStatus(o) === "active").length,
      pending: orders.filter((o) => getOrderStatus(o).includes("pending"))
        .length,
      provisioned: orders.filter((o) => getOrderStatus(o) === "provisioned")
        .length,
    };
  }, [orders]);

  // Get filtered, sorted and paginated orders
  const filteredOrders = useMemo(() => {
    const filtered = filterOrders(orders);
    return sortOrders(filtered);
  }, [orders, searchTerm, statusFilter, sortBy]);

  const currentOrders = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * pageSize;
    const lastPageIndex = firstPageIndex + pageSize;
    return filteredOrders.slice(firstPageIndex, lastPageIndex);
  }, [filteredOrders, currentPage, pageSize]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredOrders.length / pageSize);
  }, [filteredOrders, pageSize]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleTabChange = (key: string | number) => {
    setActiveTab(key.toString());
    setStatusFilter(key.toString() === "all" ? "all" : key.toString());
    setCurrentPage(1);
  };

  const displayCount = useMemo(() => {
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(start + pageSize - 1, filteredOrders.length);
    return `${start}-${end} dari ${filteredOrders.length} order`;
  }, [currentPage, pageSize, filteredOrders.length]);
  return (
    <div className="space-y-4">
      {/* Image Viewer Modal */}
      <Modal
        isOpen={isImageViewOpen}
        onClose={() => setIsImageViewOpen(false)}
        size="3xl"
        classNames={{
          base: "bg-white dark:bg-gray-900 shadow-2xl",
        }}
      >
        <ModalContent className="rounded-xl overflow-hidden max-h-[90vh]">
          <ModalHeader className="flex justify-between bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
            <h3 className="text-xl font-semibold">Proof of Payment</h3>
            <Button
              size="sm"
              variant="light"
              isIconOnly
              className="bg-white/20 text-white hover:bg-white/30"
              onClick={() => setIsImageViewOpen(false)}
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
          </ModalHeader>
          <ModalBody className="p-0 flex justify-center bg-gray-100">
            {imageLoading ? (
              <div className="flex items-center justify-center p-12 min-h-[400px]">
                <div className="w-14 h-14 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="max-w-full max-h-[70vh] overflow-auto bg-neutral-800 flex items-center justify-center p-4">
                <img
                  src={currentImage}
                  alt="Proof of Payment"
                  className="max-w-full max-h-[65vh] object-contain shadow-lg"
                />
              </div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
      {/* Invoice Detail Modal */}
      <Modal
        isOpen={!!viewInvoice}
        onClose={() => setViewInvoice(null)}
        size="2xl"
      >
        <ModalContent className="rounded-xl overflow-hidden">
          <ModalHeader className="flex flex-col bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold">Invoice Details</h3>
                {viewInvoice && (
                  <p className="text-sm font-normal text-blue-100">
                    Invoice: {viewInvoice.invoiceId}
                  </p>
                )}
              </div>
              {viewInvoice && (
                <Chip
                  color={getStatusColor(viewInvoice.status) as any}
                  variant="flat"
                  className="font-medium"
                >
                  {viewInvoice.status}
                </Chip>
              )}
            </div>
          </ModalHeader>
          <Divider />
          <ModalBody className="px-6 py-4">
            {viewInvoice && (
              <div className="text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="border border-gray-100 rounded-lg p-3 bg-gray-50">
                    <span className="text-gray-500 block text-xs mb-1 uppercase tracking-wider font-medium">
                      Invoice ID
                    </span>
                    <span className="font-medium text-base">
                      {viewInvoice.invoiceId}
                    </span>
                  </div>
                  <div className="border border-gray-100 rounded-lg p-3 bg-gray-50">
                    <span className="text-gray-500 block text-xs mb-1 uppercase tracking-wider font-medium">
                      Release Date
                    </span>
                    <span className="font-medium text-base">
                      {formatDate(viewInvoice.releaseDate)}
                    </span>
                  </div>
                  <div className="border border-gray-100 rounded-lg p-3 bg-gray-50">
                    <span className="text-gray-500 block text-xs mb-1 uppercase tracking-wider font-medium">
                      Status
                    </span>
                    <div className="font-medium text-base flex items-center gap-2">
                      <Chip
                        size="sm"
                        color={getStatusColor(viewInvoice.status) as any}
                        variant="flat"
                      >
                        {viewInvoice.status}
                      </Chip>
                    </div>
                  </div>
                  {viewInvoice.price !== undefined && (
                    <div className="border border-gray-100 rounded-lg p-3 bg-gray-50 md:col-span-2">
                      <span className="text-gray-500 block text-xs mb-1 uppercase tracking-wider font-medium">
                        Price
                      </span>
                      {ppn !== null ? (
                        <div>
                          <p className="font-semibold text-base text-blue-600">
                            Total: Rp{" "}
                            {calculatePriceWithPPN(
                              viewInvoice.price
                            ).toLocaleString()}
                          </p>
                          <div className="mt-1 text-xs text-gray-500 space-y-1">
                            <p>
                              Base price: Rp{" "}
                              {viewInvoice.price.toLocaleString()}
                            </p>
                            <p>
                              PPN ({ppn}%): Rp{" "}
                              {(
                                (viewInvoice.price * ppn) /
                                100
                              ).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span className="font-medium text-base">
                          Rp {viewInvoice.price.toLocaleString()}
                        </span>
                      )}
                    </div>
                  )}
                  {viewInvoice.paidAt && (
                    <div className="border border-gray-100 rounded-lg p-3 bg-gray-50">
                      <span className="text-gray-500 block text-xs mb-1 uppercase tracking-wider font-medium">
                        Paid At
                      </span>
                      <span className="font-medium text-base flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-green-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {formatDate(viewInvoice.paidAt)}
                      </span>
                    </div>
                  )}
                  {viewInvoice.verifiedBy && (
                    <div className="border border-gray-100 rounded-lg p-3 bg-gray-50">
                      <span className="text-gray-500 block text-xs mb-1 uppercase tracking-wider font-medium">
                        Verified By
                      </span>
                      <span className="font-medium text-base flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-blue-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                          />
                        </svg>
                        {viewInvoice.verifiedBy}
                      </span>
                    </div>
                  )}
                  {viewInvoice.proofOfPaid && (
                    <div className="md:col-span-2 border border-gray-100 rounded-lg p-3 bg-white mt-2">
                      <span className="text-gray-500 block text-xs mb-2 uppercase tracking-wider font-medium">
                        Proof of Payment
                      </span>
                      <div className="flex flex-col space-y-3">
                        <div className="relative aspect-video w-full max-h-80 overflow-hidden rounded-lg shadow-sm">
                          {/* Using a component to handle async image loading */}
                          <S3Image
                            imagePath={viewInvoice.proofOfPaid}
                            onClick={() => viewImage(viewInvoice.proofOfPaid)}
                          />

                          <div className="absolute bottom-3 right-3">
                            <Button
                              size="sm"
                              color="primary"
                              variant="solid"
                              onClick={() => viewImage(viewInvoice.proofOfPaid)}
                              isLoading={imageLoading}
                              className="shadow-md"
                              startContent={
                                !imageLoading && (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                  </svg>
                                )
                              }
                            >
                              View Full Image
                            </Button>
                          </div>
                        </div>
                        <div className="border-t border-gray-100 pt-2 mt-2">
                          <DownloadS3Image
                            imagePath={viewInvoice.proofOfPaid}
                            fileName={`proof-of-payment-${viewInvoice.invoiceId}`}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </ModalBody>
          <Divider />
          <ModalFooter>
            <Button
              color="primary"
              onPress={() => setViewInvoice(null)}
              variant="light"
              className="font-medium"
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>{" "}
      {/* Header Section with Gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-lg overflow-hidden mb-8">
        <div className="px-8 py-10 text-white">
          <h1 className="text-3xl font-bold mb-3">Orders Management</h1>
          <div className="opacity-90 max-w-2xl mb-6">
            View and manage all customer orders across different statuses.
            Filter orders by their current status or search for specific orders.
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
        <div className="w-full md:max-w-xs">
          <Input
            placeholder="Search by customer name or order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            isClearable
            onClear={() => setSearchTerm("")}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch({
                  preventDefault: () => {},
                } as React.FormEvent);
              }
            }}
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

        {/* Right Side - Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <Select
              label="Sort by"
              size="sm"
              className="min-w-[140px]"
              defaultSelectedKeys={[sortBy]}
              onChange={(e) => handleSortChange(e.target.value)}
            >
              <SelectItem key="newest">Newest</SelectItem>
              <SelectItem key="oldest">Oldest</SelectItem>
              <SelectItem key="price-high">Price (High-Low)</SelectItem>
              <SelectItem key="price-low">Price (Low-High)</SelectItem>
              <SelectItem key="name-asc">Name (A-Z)</SelectItem>
              <SelectItem key="name-desc">Name (Z-A)</SelectItem>
            </Select>
          </div>
          <div className="flex items-center gap-1">
            <Select
              label="Items"
              size="sm"
              className="min-w-[100px]"
              defaultSelectedKeys={[`${pageSize}`]}
              onChange={handlePageSizeChange}
            >
              <SelectItem key="10">10</SelectItem>
              <SelectItem key="20">20</SelectItem>
              <SelectItem key="50">50</SelectItem>
              <SelectItem key="100">100</SelectItem>
            </Select>
          </div>
        </div>
      </div>
      {/* Tab Navigation for Status Filters */}{" "}
      <Tabs
        selectedKey={activeTab}
        onSelectionChange={handleTabChange}
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
              <span>All Orders</span>{" "}
              <Chip size="sm" variant="flat" color="default">
                {statusCounts.all}
              </Chip>
            </div>
          }
        />
        <Tab
          key="active"
          title={
            <div className="flex items-center gap-2">
              <span>Active</span>{" "}
              <Chip size="sm" variant="flat" color="success">
                {statusCounts.active}
              </Chip>
            </div>
          }
        />
        <Tab
          key="pending"
          title={
            <div className="flex items-center gap-2">
              <span>Pending</span>{" "}
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
              <span>Provisioned</span>{" "}
              <Chip size="sm" variant="flat" color="primary">
                {statusCounts.provisioned}
              </Chip>
            </div>
          }
        />
      </Tabs>
      {/* Loading State */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Card
              key={i}
              className="border border-gray-100 shadow-sm rounded-lg overflow-hidden"
            >
              <CardBody className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-1/2">
                    <Skeleton className="h-5 rounded mb-2" />
                    <Skeleton className="h-3 w-3/4 rounded" />
                  </div>
                  <div className="ml-auto">
                    <Skeleton className="h-6 w-24 rounded" />
                  </div>
                </div>
                <Divider className="my-3" />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <Skeleton className="h-4 w-1/3 rounded mb-1" />
                    <Skeleton className="h-4 w-1/2 rounded" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-1/3 rounded mb-1" />
                    <Skeleton className="h-4 w-1/2 rounded" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-1/3 rounded mb-1" />
                    <Skeleton className="h-5 w-2/3 rounded" />
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : filteredOrders.length > 0 ? (
        <>
          <div>
            {/* Results Count */}
            <div className="text-sm text-gray-600 mb-2.5 flex justify-between items-center px-1">
              <span>Showing {displayCount}</span>
              {searchTerm && (
                <Button
                  size="sm"
                  variant="light"
                  color="default"
                  onPress={() => {
                    setSearchTerm("");
                    setCurrentPage(1);
                  }}
                  className="text-xs"
                >
                  Clear Search
                </Button>
              )}
            </div>

            {/* Order List */}
            <div className="space-y-3">
              {currentOrders.map((order) => {
                const customer = order.by || order.user;
                const orderStatus = getOrderStatus(order);

                // Added detailed logging to identify issues with status determination
                console.log(`Order ${order._id}:`, {
                  apiStatus: order.status || "undefined",
                  calculatedStatus: orderStatus,
                  hasBaa: !!order.baa,
                  hasVerifiedInvoice: order.contract?.invoices?.some(
                    (inv) => inv.status === "verified"
                  ),
                });
                const invoices = order.contract?.invoices || [];

                // Debug invoices to check their structure
                console.log(
                  `Order ${order._id} invoices:`,
                  invoices.map((inv) => ({
                    id: inv._id,
                    invoiceId: inv.invoiceId,
                    status: inv.status,
                  }))
                );

                // First try to find a verified invoice, if not present use the most recent one
                const latestInvoice =
                  invoices.length > 0
                    ? invoices.find((inv) => inv.status === "verified") ||
                      [...invoices].sort(
                        (a, b) =>
                          new Date(b.releaseDate).getTime() -
                          new Date(a.releaseDate).getTime()
                      )[0]
                    : undefined;
                const invoicePrice =
                  latestInvoice && typeof latestInvoice.price === "number"
                    ? latestInvoice.price
                    : undefined;

                // Keep for reference of where showActivation would be defined
                // We no longer need this variable as we're using orderStatus directly in ActionsSection
                const showActivation = orderStatus === "provisioned";

                return (
                  <Card
                    key={order._id}
                    className="border border-gray-100 shadow-sm hover:shadow-md transition-all rounded-lg overflow-hidden"
                  >
                    <CardHeader className="p-0">
                      <div
                        className={`h-1.5 w-full ${
                          orderStatus === "active"
                            ? "bg-green-500"
                            : orderStatus === "pending" ||
                                orderStatus === "pending payment" ||
                                orderStatus === "pending verification"
                              ? "bg-yellow-500"
                              : orderStatus === "completed"
                                ? "bg-blue-500"
                                : orderStatus === "provisioned"
                                  ? "bg-cyan-500"
                                  : "bg-gray-400"
                        }`}
                      ></div>
                    </CardHeader>
                    <CardBody className="p-4">
                      <div className="flex flex-wrap justify-between gap-2 items-start mb-3">
                        <div>
                          <h3 className="text-base md:text-lg font-semibold text-gray-800 line-clamp-1">
                            {order.space.name}
                          </h3>
                          <p className="text-gray-500 text-xs md:text-sm line-clamp-1">
                            {order.space.description}
                          </p>
                        </div>
                        <Chip
                          color={getStatusColor(orderStatus) as any}
                          variant="flat"
                          className="font-medium text-xs"
                          size="sm"
                        >
                          {orderStatus}
                        </Chip>
                      </div>

                      <Divider className="my-2" />

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500 text-xs">
                            Customer:
                          </span>
                          {customer && (
                            <div className="flex items-center gap-1">
                              <span className="font-medium text-gray-800 line-clamp-1">
                                {customer.fullName}
                              </span>
                            </div>
                          )}
                          {customer && customer.email && (
                            <div className="text-xs text-gray-500 line-clamp-1">
                              {customer.email}
                            </div>
                          )}
                        </div>

                        <div>
                          <span className="text-gray-500 text-xs">
                            Order ID:
                          </span>
                          <div className="font-mono text-xs line-clamp-1">
                            {order._id}
                          </div>
                          <div className="text-xs text-gray-500">
                            Created:{" "}
                            {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        <div>
                          <span className="text-gray-500 text-xs">Price:</span>
                          <div className="font-medium text-blue-600">
                            {invoicePrice !== undefined &&
                            invoicePrice !== order.space.price
                              ? `Rp ${calculatePriceWithPPN(invoicePrice).toLocaleString()}`
                              : `Rp ${calculatePriceWithPPN(order.space.price).toLocaleString()}`}
                          </div>
                        </div>
                      </div>

                      {/* Invoice and Actions Row */}
                      <div className="mt-3 flex flex-wrap justify-between items-center pt-2 gap-2">
                        {/* Invoices */}
                        <div className="flex flex-wrap gap-1.5">
                          {getUniqueInvoices(invoices)
                            .slice(0, 2)
                            .map((inv) => (
                              <Button
                                key={inv._id}
                                size="sm"
                                variant="flat"
                                color={getStatusColor(inv.status) as any}
                                className="text-xs"
                                startContent={
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-3.5 w-3.5"
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
                                }
                                onPress={() => setViewInvoice(inv)}
                              >
                                Invoice{" "}
                                {inv.invoiceId
                                  ? inv.invoiceId.includes("-")
                                    ? `#${inv.invoiceId.split("-")[1]}`
                                    : `#${inv.invoiceId}`
                                  : "#0000"}
                              </Button>
                            ))}

                          {invoices.length > 2 && (
                            <Dropdown>
                              <DropdownTrigger>
                                <Button
                                  size="sm"
                                  variant="flat"
                                  className="text-xs bg-gray-100"
                                >
                                  +{invoices.length - 2} more
                                </Button>
                              </DropdownTrigger>
                              <DropdownMenu aria-label="More invoices">
                                {getUniqueInvoices(invoices)
                                  .slice(2)
                                  .map((inv) => (
                                    <DropdownItem
                                      key={inv._id}
                                      onPress={() => setViewInvoice(inv)}
                                      startContent={
                                        <Chip
                                          size="sm"
                                          color={
                                            getStatusColor(inv.status) as any
                                          }
                                          variant="flat"
                                        >
                                          {inv.status}
                                        </Chip>
                                      }
                                    >
                                      {" "}
                                      Invoice{" "}
                                      {inv.invoiceId
                                        ? inv.invoiceId.includes("-")
                                          ? `#${inv.invoiceId.split("-")[1]}`
                                          : `#${inv.invoiceId}`
                                        : "#0000"}
                                    </DropdownItem>
                                  ))}
                              </DropdownMenu>
                            </Dropdown>
                          )}
                        </div>{" "}
                        {/* Actions */}
                        <div className="ml-auto">
                          <ActionsSection
                            orderId={order._id}
                            contractId={order.contract._id}
                            showActivation={showActivation}
                            onActivate={setActivatingOrder}
                            activatingOrder={activatingOrder}
                            onCancelActivation={() => setActivatingOrder(null)}
                            onSubmitActivation={handleActivation}
                            selectedFile={selectedFile}
                            setSelectedFile={setSelectedFile}
                            orderStatus={orderStatus}
                          />
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>

            {/* Pagination */}
            {filteredOrders.length > 0 && (
              <div className="mt-6 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalCount={filteredOrders.length}
                  pageSize={pageSize}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </>
      ) : (
        <Card className="border border-gray-100 shadow-md rounded-lg overflow-hidden">
          <CardBody className="p-0">
            <div className="text-center py-10 px-6">
              <div className="bg-blue-50 rounded-full p-4 inline-flex items-center justify-center mb-4">
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
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                No Orders Found
              </h3>
              <p className="text-gray-500 mb-4 max-w-md mx-auto text-sm">
                You don't have any orders yet. Orders will appear here when
                customers purchase your products.
              </p>
              <Button
                color="primary"
                size="sm"
                className="px-4 bg-gradient-to-r from-blue-600 to-cyan-600"
                onPress={fetchOrders}
                startContent={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                }
              >
                Refresh Orders
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
