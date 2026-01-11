"use client";

import { useState, useEffect } from "react";
import { title, subtitle } from "@/components/primitives";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Image } from "@heroui/image";
import { Skeleton } from "@heroui/skeleton";
import { Chip } from "@heroui/chip";
import { button as buttonStyles } from "@heroui/theme";
import { Link } from "@heroui/link";
import { Divider } from "@heroui/divider";
import { useParams } from "next/navigation";
import axios from "axios";
import clsx from "clsx";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Select, SelectItem } from "@heroui/select";
import { Pagination } from "@heroui/pagination";
import { Tabs, Tab } from "@heroui/tabs";
import { Input } from "@heroui/input";
import { useS3Image } from "@/hooks/useS3Image";

// Icons
import {
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/outline";
import {
  Building,
  Server,
  Shield,
  Wifi,
  Cable,
  Clock,
  Database,
  ChevronLeft,
  ExternalLink,
  Layers,
} from "lucide-react";

interface Provider {
  _id: string;
  name: string;
  contact: {
    email: string;
    phone: string;
  };
  description: string;
  address: string;
  logo?: string; // Add logo field
}

interface Space {
  _id: string;
  name: string;
  description: string;
  price: number;
  size: string;
  provider: Provider;
  _addedBy: string;
  images: string[];
}

export default function ProviderDetailPage() {
  const params = useParams();
  const providerId = params.id as string;
  const [provider, setProvider] = useState<Provider | null>(null);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const { imageUrl: providerLogo, isLoading: logoLoading } = useS3Image(
    provider?.logo
  );
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [totalSpaces, setTotalSpaces] = useState(0);
  const [imageLoading, setImageLoading] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [activeTab, setActiveTab] = useState("all");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000000 });
  const [originalSpaces, setOriginalSpaces] = useState<Space[]>([]);
  const [filteredSpaces, setFilteredSpaces] = useState<Space[]>([]);

  const fetchProviderData = async () => {
    setLoading(true);
    try {
      const providerResponse = await axios.get(
        `/api/customer/catalog/provider/${providerId}`
      );

      if (providerResponse.data.status === "ok") {
        setProvider(providerResponse.data.data);
      }

      const spacesResponse = await axios.get(
        `/api/customer/catalog/provider/${providerId}/spaces?page=${page}&limit=${limit}`
      );

      if (spacesResponse.data.status === "ok") {
        const spacesData = spacesResponse.data.data;
        setSpaces(spacesData);
        setOriginalSpaces(spacesData);

        let totalCount = 0;
        if (
          spacesResponse.data.meta &&
          typeof spacesResponse.data.meta.total === "number"
        ) {
          totalCount = spacesResponse.data.meta.total;
        } else if (typeof spacesResponse.data.total === "number") {
          totalCount = spacesResponse.data.total;
        } else if (typeof spacesResponse.data.count === "number") {
          totalCount = spacesResponse.data.count;
        } else {
          totalCount = spacesData.length;
        }
        setTotalSpaces(totalCount);
      }
    } catch (error) {
      console.error("Failed to fetch partner data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageLoad = (spaceId: string) => {
    setImageLoading((prev) => ({
      ...prev,
      [spaceId]: false,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLimit(Number(event.target.value));
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleTabChange = (key: React.Key) => {
    setActiveTab(key as string);
    setPage(1);
  };

  const applyFilters = (spaces: Space[]) => {
    // First filter by search term
    let filtered = spaces.filter(
      (space) =>
        space.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        space.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Apply size filter based on active tab
    if (activeTab !== "all") {
      filtered = filtered.filter((space) => {
        const sizeNum = parseInt(space.size);
        if (activeTab === "small" && sizeNum <= 10) return true;
        if (activeTab === "medium" && sizeNum > 10 && sizeNum <= 30)
          return true;
        if (activeTab === "large" && sizeNum > 30) return true;
        return false;
      });
    }

    // Then filter by price
    filtered = filtered.filter(
      (space) => space.price >= priceRange.min && space.price <= priceRange.max
    );

    // Finally sort
    return filtered.sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "size-asc") return parseInt(a.size) - parseInt(b.size);
      if (sortBy === "size-desc") return parseInt(b.size) - parseInt(a.size);
      return a.name.localeCompare(b.name);
    });
  };

  useEffect(() => {
    if (filteredSpaces.length > 0) {
      const newLoadingState = filteredSpaces.reduce(
        (acc, space) => {
          acc[space._id] = imageLoading[space._id] || true;
          return acc;
        },
        {} as { [key: string]: boolean }
      );
      setImageLoading(newLoadingState);
    }
  }, [filteredSpaces]);

  useEffect(() => {
    if (providerId) {
      fetchProviderData();
    }
  }, [providerId, page, limit]);

  useEffect(() => {
    if (originalSpaces.length > 0) {
      const filtered = applyFilters(originalSpaces);
      setFilteredSpaces(filtered);
    }
  }, [originalSpaces, searchTerm, activeTab, priceRange, sortBy]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const DebugInfo = () => {
    if (process.env.NODE_ENV !== "development") return null;
    return (
      <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs z-50 max-w-xs">
        <div>
          <strong>Debug:</strong>
        </div>
        <div>Total spaces: {originalSpaces.length}</div>
        <div>Filtered spaces: {filteredSpaces.length}</div>
        <div>Active tab: {activeTab}</div>
        <button
          onClick={() => console.log({ originalSpaces, filteredSpaces })}
          className="mt-2 bg-blue-600 px-2 py-1 rounded text-white"
        >
          Log Data
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="space-y-6">
            <Skeleton className="h-12 w-2/3 rounded-lg" />
            <Skeleton className="h-5 w-1/2 rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <Card className="col-span-2">
                <CardBody>
                  <div className="space-y-4">
                    <Skeleton className="h-7 w-1/3 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full rounded-lg" />
                      <Skeleton className="h-4 w-full rounded-lg" />
                      <Skeleton className="h-4 w-3/4 rounded-lg" />
                    </div>
                  </div>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <div className="space-y-4">
                    <Skeleton className="h-7 w-1/2 rounded-lg" />
                    <div className="space-y-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-4 w-3/4 rounded-lg" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-48 rounded-lg" />
            <Skeleton className="h-10 w-64 rounded-lg" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="p-0">
                  <Skeleton className="w-full h-48 rounded-t-lg" />
                </CardHeader>
                <CardBody>
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-2/3 rounded-lg" />
                    <Skeleton className="h-6 w-1/4 rounded-full" />
                    <Skeleton className="h-4 w-1/2 rounded-lg" />
                    <Skeleton className="h-4 w-1/3 rounded-lg" />
                    <Skeleton className="h-6 w-1/3 rounded-lg" />
                    <Skeleton className="h-3 w-full rounded-lg" />
                    <Skeleton className="h-3 w-5/6 rounded-lg" />
                  </div>
                </CardBody>
                <CardFooter>
                  <div className="flex gap-2 w-full">
                    <Skeleton className="h-10 w-1/2 rounded-full" />
                    <Skeleton className="h-10 w-1/2 rounded-full" />
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
        <BuildingOffice2Icon className="h-24 w-24 text-default-300 mx-auto" />
        <h1 className={title({ color: "blue" })}>Partner Not Found</h1>
        <p className={subtitle({ class: "mt-4 max-w-lg" })}>
          The provider you are looking for does not exist or has been removed
          from our marketplace.
        </p>
        <Link
          href="/customer/provider/list"
          className={buttonStyles({
            color: "primary",
            class: "mt-8",
            radius: "full",
            size: "lg",
          })}
        >
          Browse All Providers
        </Link>
      </div>
    );
  }

  // Helper component for space images
  const SpaceImage = ({ space }: { space: Space }) => {
    const { imageUrl: spaceImageUrl, isLoading: spaceImageLoading } =
      useS3Image(space.images?.[0]);

    if (!space.images?.[0]) {
      return (
        <div className="w-full h-60 bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
          <Server className="h-16 w-16 text-blue-300 dark:text-blue-700" />
        </div>
      );
    }

    return (
      <>
        {spaceImageLoading && (
          <Skeleton className="absolute inset-0 w-full h-60 rounded-none" />
        )}
        <div className="relative w-full h-60 overflow-hidden flex items-center justify-center">
          {spaceImageUrl && (
            <Image
              src={spaceImageUrl}
              alt={space.name}
              width={600}
              height={400}
              className={clsx(
                "w-full h-full object-cover hover:scale-105 transition-transform duration-500",
                spaceImageLoading && "opacity-0"
              )}
            />
          )}
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen ">
      {process.env.NODE_ENV === "development" && <DebugInfo />}

      <section className="bg-[#155183] text-white py-16 relative overflow-hidden ">
        <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-7xl">
          <Link
            href="/customer/provider/list"
            className="inline-flex items-center text-blue-100 mb-4 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to All Providers
          </Link>
          <div className="flex items-center gap-4 mb-3">
            {provider?.logo ? (
              logoLoading ? (
                // Show skeleton while loading
                <Skeleton className="h-16 w-16 rounded-full" />
              ) : (
                // Show logo when loaded
                <div className="min-w-16 min-h-16 h-16 w-16 rounded-full overflow-hidden bg-white/20 flex-shrink-0 flex items-center justify-center">
                  <img
                    src={providerLogo}
                    alt={`${provider?.name} logo`}
                    className="max-w-full max-h-full object-contain p-1"
                  />
                </div>
              )
            ) : null}
            <h1 className="text-4xl sm:text-5xl font-bold">{provider?.name}</h1>
          </div>
          <p className="text-xl text-blue-100 max-w-3xl mb-6">
            Premium data center provider offering modern infrastructure
            solutions for your enterprise needs
          </p>

          <div className="flex justify-center flex-wrap gap-3">
            <Chip
              color="primary"
              variant="solid"
              className="bg-blue-400/20 border border-blue-300/30 text-white"
            >
              <div className="flex items-center">
                <Building className="w-4 h-4 mr-2" />
                Data Center Provider
              </div>
            </Chip>
            <Chip
              color="primary"
              variant="solid"
              className="bg-blue-400/20 border border-blue-300/30 text-white"
            >
              <div className="flex items-center">
                <Server className="w-4 h-4 mr-2" />
                {totalSpaces} Available Racks
              </div>
            </Chip>
          </div>
        </div>
      </section>

      <section className="py-10 max-w-7xl mx-auto px-4 -mt-16 relative z-10">
        <Card className="border border-blue-100 dark:border-blue-900 shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            <div className="md:col-span-2 p-8 md:border-r border-gray-100 dark:border-gray-800">
              <div className="flex items-center mb-4">
                {provider?.logo ? (
                  logoLoading ? (
                    // Show skeleton while loading
                    <Skeleton className="w-12 h-12 rounded-full mr-4" />
                  ) : (
                    // Show logo when loaded
                    <div className="min-w-12 min-h-12 w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex-shrink-0 flex items-center justify-center mr-4 overflow-hidden">
                      <img
                        src={providerLogo}
                        alt={`${provider.name} logo`}
                        className="max-w-full max-h-full object-contain p-1"
                      />
                    </div>
                  )
                ) : (
                  // Default icon if no logo property
                  <div className="min-w-12 min-h-12 w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex-shrink-0 flex items-center justify-center mr-4">
                    <Building className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                )}
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  About {provider.name}
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {provider.description ||
                  `${provider.name} is an established data center partner offering secure, reliable, and scalable 
                  infrastructure solutions. With state-of-the-art facilities and expert technical support, 
                  they provide optimal conditions for your IT equipment.`}
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-8">
              <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center">
                <Cable className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                Contact Information
              </h3>
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm">
                    <EnvelopeIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Email
                    </h4>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {provider.contact.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm">
                    <PhoneIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Phone
                    </h4>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {provider.contact.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm">
                    <MapIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Address
                    </h4>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {provider.address}
                    </p>
                  </div>
                </div>

                <div className="mt-8">
                  <Link
                    href={`mailto:${provider.contact.email}`}
                    className={buttonStyles({
                      color: "primary",
                      variant: "solid",
                      radius: "lg",
                      class: "w-full justify-center",
                    })}
                  >
                    Contact Provider
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      <section className="py-16 max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <Chip color="primary" variant="flat" className="mb-2">
                {totalSpaces}
                Server Equipment
              </Chip>
            </div>
            <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white flex items-center">
              Available Server Racks
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-xl">
              Browse through our selection of enterprise-grade server racks
              available for immediate deployment
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Input
              classNames={{
                input: "text-small",
                inputWrapper:
                  "h-10 border border-blue-200 dark:border-blue-800",
              }}
              placeholder="Search racks..."
              value={searchTerm}
              onChange={handleSearch}
              startContent={
                <MagnifyingGlassIcon className="h-4 w-4 text-blue-500" />
              }
              className="max-w-xs"
            />
            <Dropdown>
              <DropdownTrigger>
                <button
                  className={buttonStyles({
                    variant: "flat",
                    color: "primary",
                    size: "sm",
                    className: "border border-blue-200 dark:border-blue-800",
                  })}
                >
                  <AdjustmentsHorizontalIcon className="h-4 w-4 mr-1" /> Sort{" "}
                  <ChevronDownIcon className="h-4 w-4 ml-1" />
                </button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Sort options"
                onAction={(key) => handleSortChange(key as string)}
                selectedKeys={[sortBy]}
                selectionMode="single"
              >
                <DropdownItem key="name">Name (A-Z)</DropdownItem>
                <DropdownItem key="price-asc">Price: Low to High</DropdownItem>
                <DropdownItem key="price-desc">Price: High to Low</DropdownItem>
                <DropdownItem key="size-asc">Size: Small to Large</DropdownItem>
                <DropdownItem key="size-desc">
                  Size: Large to Small
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>

        <Tabs
          aria-label="Space size options"
          selectedKey={activeTab}
          onSelectionChange={handleTabChange}
          color="primary"
          variant="underlined"
          classNames={{
            tabList: "gap-6",
            tab: "h-12",
          }}
        >
          <Tab
            key="all"
            title={
              <div className="flex items-center">
                <Layers className="w-4 h-4 mr-2" />
                All sizes
              </div>
            }
          />
          <Tab
            key="small"
            title={
              <div className="flex items-center">
                <Database className="w-4 h-4 mr-2" />
                Small (1-10U)
              </div>
            }
          />
          <Tab
            key="medium"
            title={
              <div className="flex items-center">
                <Database className="w-4 h-4 mr-2" />
                Medium (11-30U)
              </div>
            }
          />
          <Tab
            key="large"
            title={
              <div className="flex items-center">
                <Database className="w-4 h-4 mr-2" />
                Large (30U+)
              </div>
            }
          />
        </Tabs>

        {filteredSpaces.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredSpaces.map((space, index) => (
              <div
                key={space._id}
                className="space-card-item"
                style={{
                  display: "block",
                  opacity: 1,
                  visibility: "visible",
                }}
              >
                <Card className="overflow-hidden border border-blue-100 dark:border-blue-900 shadow-md hover:shadow-lg transition-all duration-300">
                  <CardHeader className="p-0 relative overflow-hidden">
                    <SpaceImage space={space} />
                    <div className="absolute top-3 left-3 z-10">
                      <Chip
                        color="success"
                        variant="solid"
                        size="sm"
                        classNames={{
                          base: "shadow-md border border-white/20",
                          content: "font-medium text-white",
                        }}
                      >
                        Available Now
                      </Chip>
                    </div>
                  </CardHeader>
                  <CardBody className="p-5">
                    <h3 className="text-lg font-bold mb-1 line-clamp-1 text-gray-900 dark:text-white">
                      {space.name}
                    </h3>
                    <div className="flex items-center mb-2">
                      <MapIcon className="h-4 w-4 mr-1 text-blue-500" />
                      <span className="text-gray-600 dark:text-gray-400 text-sm">
                        {provider.address.split(",")[0]}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm font-medium flex items-center text-gray-700 dark:text-gray-300">
                        <span className="mr-2">Size:</span>
                        <Chip size="sm" color="primary" variant="flat">
                          {space.size}U
                        </Chip>
                      </div>
                      <div className="text-blue-600 dark:text-blue-400 font-bold">
                        {formatPrice(space.price)}
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          /month
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-1">
                      {space.description ||
                        "Enterprise-grade rack space with guaranteed uptime and excellent connectivity options."}
                    </p>
                  </CardBody>
                  <CardFooter className="px-5 pt-0 pb-5">
                    <div className="flex gap-2 w-full">
                      <Link
                        href={`/customer/space/${space._id}`}
                        className={buttonStyles({
                          color: "primary",
                          radius: "lg",
                          variant: "flat",
                          class:
                            "flex-1 border border-blue-200 dark:border-blue-800",
                          size: "sm",
                        })}
                      >
                        View Details
                      </Link>
                    </div>
                  </CardFooter>
                </Card>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-blue-100 dark:border-blue-900">
            <Server className="h-16 w-16 text-blue-300 dark:text-blue-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              No Server Racks Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              {searchTerm
                ? `No racks matching "${searchTerm}" were found. Try a different search term or filter.`
                : "This partner currently has no available server racks with the selected criteria."}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className={buttonStyles({
                  color: "primary",
                  variant: "flat",
                  radius: "lg",
                  size: "md",
                  className: "mt-4",
                })}
              >
                Clear Search
              </button>
            )}
          </div>
        )}

        {totalSpaces > limit && (
          <div className="flex flex-col sm:flex-row justify-between items-center mt-10 gap-4">
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-600 dark:text-gray-400">
                Show:
              </label>
              <Select
                value={limit.toString()}
                onChange={handleLimitChange}
                size="sm"
                className="w-24"
                classNames={{
                  trigger: "border-blue-200 dark:border-blue-800",
                }}
              >
                <SelectItem key="8">8</SelectItem>
                <SelectItem key="12">12</SelectItem>
                <SelectItem key="24">24</SelectItem>
                <SelectItem key="48">48</SelectItem>
              </Select>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                of {totalSpaces} items
              </span>
            </div>
            <Pagination
              total={Math.ceil(totalSpaces / limit)}
              initialPage={page}
              onChange={handlePageChange}
              color="primary"
              classNames={{
                item: "border border-blue-200 dark:border-blue-800",
                cursor: "bg-blue-600",
              }}
            />
          </div>
        )}
      </section>

      <section className="py-16 bg-blue-50 dark:bg-blue-950">
        <div className="max-w-4xl mx-auto text-center px-4">
          <Chip color="primary" variant="flat" className="mb-4">
            Need Help?
          </Chip>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Can't find what you're looking for?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 mx-auto max-w-2xl">
            Browse our complete catalog of data center providers or contact our
            team for personalized assistance with your infrastructure needs.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/customer/provider/list"
              className={buttonStyles({
                color: "primary",
                radius: "lg",
                size: "lg",
                className: "px-8",
              })}
            >
              Browse All Providers
            </Link>
            <Link
              href="/customer/contact"
              className={buttonStyles({
                variant: "flat",
                radius: "lg",
                size: "lg",
                className: "px-8 border border-blue-300 dark:border-blue-700",
              })}
            >
              Contact Support
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
