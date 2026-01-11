"use client";

import { useState, useEffect } from "react";
import { title, subtitle } from "@/components/primitives";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Image } from "@heroui/image";
import { Skeleton } from "@heroui/skeleton";
import { Chip } from "@heroui/chip";
import { button as buttonStyles } from "@heroui/theme";
import { Link } from "@heroui/link";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Tabs, Tab } from "@heroui/tabs";
import { Select, SelectItem } from "@heroui/select";
import { Badge } from "@heroui/badge";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { motion } from "framer-motion";
import clsx from "clsx";
import axios from "axios";
import { useS3Image } from "@/hooks/useS3Image";
import {
  MapPinIcon,
  BuildingOffice2Icon,
  ServerIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

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
  contact: {
    email: string;
    phone: string;
  };
  description: string;
  address: string;
  logo?: string;
}

interface Datacenter {
  _id: string;
  name: string;
  address: string;
  coordinate: string;
  description: string;
  provider: string;
  _isActive: boolean;
  image?: string;
}

interface Space {
  _id: string;
  name: string;
  description: string;
  price: number;
  size: string;
  images: string[];
  provider: Provider;
  datacenter: Datacenter;
  _addedBy: string;
  imagesUrl?: string[];
  _isDeleted?: boolean;
  paymentPlan?: {
    monthly: number;
    quarterly: number;
  };
}

interface CatalogResponse {
  status: string;
  message: string;
  data: Space[];
  count: number;
  total: number;
  page: number;
  pages: number;
}

interface ProviderResponse {
  status: string;
  message: string;
  data: Provider[];
}

interface DatacenterResponse {
  status: string;
  message: string;
  data: Datacenter[];
}

export default function CatalogPage() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [datacenters, setDatacenters] = useState<Datacenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [loadingDatacenters, setLoadingDatacenters] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [selectedDatacenter, setSelectedDatacenter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [imageLoading, setImageLoading] = useState<{ [key: string]: boolean }>({});

  const fetchSpaces = async () => {
    setLoading(true);
    try {
      let url = `/api/customer/catalog?page=${page}&limit=${limit}`;

      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }

      if (selectedProvider) {
        url += `&provider=${selectedProvider}`;
      }

      if (selectedDatacenter) {
        url += `&datacenter=${selectedDatacenter}`;
      }

      console.log('Fetching spaces from:', url);
      const response = await axios.get(url);
      const data: CatalogResponse = response.data;
      
      console.log('API Response:', data);

      if (data.status === "ok") {
        console.log('Spaces data:', data.data);
        setSpaces(data.data || []);
        setTotalItems(data.total || 0);
        setTotalPages(data.pages || 1);
      } else {
        console.error("API returned error:", data);
        setSpaces([]);
        setTotalItems(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.error("Failed to fetch catalog data:", error);
      setSpaces([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchProviders = async () => {
    setLoadingProviders(true);
    try {
      const response = await axios.get(`/api/customer/catalog/provider`);
      const data: ProviderResponse = response.data;

      if (data.status === "ok") {
        setProviders(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch providers:", error);
    } finally {
      setLoadingProviders(false);
    }
  };

  const fetchDatacenters = async () => {
    setLoadingDatacenters(true);
    try {
      const response = await axios.get(`/api/customer/catalog/datacenter`);
      const data: DatacenterResponse = response.data;

      if (data.status === "ok") {
        setDatacenters(data.data.filter(dc => dc._isActive));
      }
    } catch (error) {
      console.error("Failed to fetch datacenters:", error);
    } finally {
      setLoadingDatacenters(false);
    }
  };

  useEffect(() => {
    fetchProviders();
    fetchDatacenters();
  }, []);

  useEffect(() => {
    fetchSpaces();
  }, [page, limit, selectedProvider, selectedDatacenter, searchTerm]);

  useEffect(() => {
    const newLoadingState = spaces.reduce(
      (acc, space) => {
        acc[space._id] = true;
        return acc;
      },
      {} as { [key: string]: boolean }
    );
    setImageLoading(newLoadingState);
  }, [spaces]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setPage(1);
  };

  const handleProviderChange = (providerId: string | null) => {
    setSelectedProvider(providerId);
    setPage(1);
  };

  const handleDatacenterChange = (datacenterId: string | null) => {
    setSelectedDatacenter(datacenterId);
    setPage(1);
  };

  const handleImageLoad = (spaceId: string) => {
    setImageLoading((prev) => ({
      ...prev,
      [spaceId]: false,
    }));
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSearchInput("");
    setSelectedProvider(null);
    setSelectedDatacenter(null);
    setPage(1);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getSelectedProviderName = () => {
    return providers.find(p => p._id === selectedProvider)?.name;
  };

  const getSelectedDatacenterName = () => {
    return datacenters.find(dc => dc._id === selectedDatacenter)?.name;
  };

  const SpaceCard = ({ space, provider }: { space: any; provider: any }) => {
    const imageSource = space?.images?.[0] || space?.space_image || space?.image;
    
    // Check if we have a valid image source
    const hasValidImageSource = imageSource && 
      imageSource !== null && 
      imageSource !== '' && 
      imageSource !== 'null' && 
      imageSource !== 'undefined';
    
    // Only use S3Image hook if we have a valid image source
    const { imageUrl, isLoading, error } = useS3Image(hasValidImageSource ? imageSource : null);
    const [imageLoaded, setImageLoaded] = useState(false);

    // Debug log only if there are issues
    if (error || (!hasValidImageSource && imageSource)) {
      console.log('SpaceCard image issue:', { 
        spaceName: space?.space_name || space?.name,
        imageSource, 
        hasValidImageSource, 
        imageUrl, 
        isLoading, 
        error 
      });
    }

    const handleImageLoad = () => {
      setImageLoaded(true);
    };

    const handleImageError = () => {
      setImageLoaded(false);
    };

    // Jika space tidak ada atau tidak valid, jangan render
    if (!space) {
      return null;
    }

    // Determine if we should show image content
    const shouldShowImage = hasValidImageSource && !error && imageUrl && !isLoading;
    const shouldShowLoading = hasValidImageSource && isLoading;
    const shouldShowPlaceholder = !hasValidImageSource || error || (!isLoading && !imageUrl);

    return (
      <div className="hover:scale-105 transition-transform duration-200">
        <Card className="p-0 shadow-lg border-none hover:shadow-xl transition-shadow duration-300 h-full">
          <div className="relative overflow-hidden">
            <div className="relative w-full h-48 bg-gray-200 rounded-t-lg overflow-hidden">
              {/* Show loading only if we're actually trying to load an image */}
              {shouldShowLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              
              {/* Show image only if we have a valid image URL and no errors */}
              {shouldShowImage && (
                <img
                  src={imageUrl}
                  alt={space.space_name || space.name || 'Space image'}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  loading="lazy"
                />
              )}
              
              {/* Show placeholder if no valid image source OR if there's an error OR if image failed to load */}
              {shouldShowPlaceholder && (
                <div className="w-full h-full bg-gray-200 flex flex-col items-center justify-center">
                  <ServerIcon className="h-12 w-12 text-gray-400 mb-2" />
                  <div className="text-gray-400 text-sm">No Image Available</div>
                </div>
              )}

              {/* Overlay gradient for better text readability - only show if we have an image */}
              {shouldShowImage && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              )}
            </div>
          </div>

        <CardBody className="p-4 space-y-3 flex-grow">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-1">
                {space.space_name || space.name || 'Unnamed Space'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                {space.provider_name || space.provider?.name || 'Unknown Provider'}
              </p>
            </div>
            <Badge color="success" variant="flat" size="sm">
              Available
            </Badge>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <ServerIcon className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-300">
                {space.datacenter.name || space.datacenter || 'Unknown Datacenter'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPinIcon className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-300 truncate max-w-[180px]">
              {space.datacenter.address || space.datacenter || 'Unknown Location'}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-blue-600">
                {space.price ? formatPrice(space.price) : 'Price not available'}
              </span>
              <span className="text-sm text-gray-500">/month</span>
            </div>
          </div>
        </CardBody>

        <CardFooter className="p-4 pt-0">
          <Button
            as={Link}
            href={`/customer/space/${space._id || space.id || '#'}`}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium"
            size="sm"
            isDisabled={!space._id && !space.id}
          >
            View Details
          </Button>
        </CardFooter>
      </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white dark:from-blue-950/30 dark:to-gray-950">
      {/* Hero Section */}
      <section className="bg-[#155183] text-white py-16 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-7xl">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="text-center"
          >
            <p className="text-sm uppercase tracking-wider text-blue-100 mb-2">
              Explore Our Catalog
            </p>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Server Rack Solutions
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              Explore enterprise-grade rack solutions tailored to your infrastructure requirements
            </p>
          </motion.div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-10 right-[10%] w-64 h-64 rounded-full bg-blue-400/10"></div>
          <div className="absolute bottom-10 left-[10%] w-56 h-56 rounded-full bg-blue-400/10"></div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-7xl relative -mt-8 z-10">
        {/* Search and Filters Card */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <Card className="mb-8 border border-blue-100 dark:border-blue-900 shadow-xl">
          <CardBody className="p-6">
            <div className="space-y-6">
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="flex gap-3">
                <Input
                  type="search"
                  placeholder="Search spaces by name or description..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="flex-1"
                  startContent={<MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />}
                  disabled={loading}
                  size="lg"
                  endContent={
                    searchInput && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchInput("");
                          if (searchTerm) {
                            setSearchTerm("");
                            setPage(1);
                          }
                        }}
                        className="focus:outline-none hover:bg-gray-100 dark:hover:bg-gray-800 rounded p-1"
                        disabled={loading}
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    )
                  }
                />
                <Button
                  type="submit"
                  color="primary"
                  size="lg"
                  isLoading={loading}
                  className="px-8"
                >
                  Search
                </Button>
              </form>

              {/* Filter Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Provider Filter */}
                <Select
                  label="Filter by Provider"
                  placeholder="Select provider"
                  selectedKeys={selectedProvider ? [selectedProvider] : []}
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0] as string;
                    handleProviderChange(selectedKey || null);
                  }}
                  isLoading={loadingProviders}
                  startContent={<BuildingOffice2Icon className="h-4 w-4" />}
                >
                  {providers.map((provider) => (
                    <SelectItem key={provider._id}>
                      {provider.name}
                    </SelectItem>
                  ))}
                </Select>

                {/* Datacenter Filter */}
                <Select
                  label="Filter by Datacenter"
                  placeholder="Select datacenter"
                  selectedKeys={selectedDatacenter ? [selectedDatacenter] : []}
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0] as string;
                    handleDatacenterChange(selectedKey || null);
                  }}
                  isLoading={loadingDatacenters}
                  startContent={<MapPinIcon className="h-4 w-4" />}
                >
                  {datacenters.map((datacenter) => (
                    <SelectItem key={datacenter._id}>
                      {datacenter.name}
                    </SelectItem>
                  ))}
                </Select>

                {/* Items per page */}
                <Select
                  label="Items per page"
                  selectedKeys={[limit.toString()]}
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0] as string;
                    handleLimitChange(parseInt(selectedKey));
                  }}
                >
                  <SelectItem key="12">12 per page</SelectItem>
                  <SelectItem key="24">24 per page</SelectItem>
                  <SelectItem key="36">36 per page</SelectItem>
                  <SelectItem key="48">48 per page</SelectItem>
                </Select>
              </div>
            </div>
          </CardBody>
        </Card>
        </motion.div>

        {/* Active Filters */}
        {(searchTerm || selectedProvider || selectedDatacenter) && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-3 items-center p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Active Filters:
              </span>
              
              {searchTerm && (
                <Chip
                  onClose={() => {
                    setSearchTerm("");
                    setSearchInput("");
                    setPage(1);
                  }}
                  variant="flat"
                  color="primary"
                >
                  Search: {searchTerm}
                </Chip>
              )}
              
              {selectedProvider && (
                <Chip
                  onClose={() => handleProviderChange(null)}
                  variant="flat"
                  color="secondary"
                  startContent={<BuildingOffice2Icon className="h-3 w-3" />}
                >
                  Provider: {getSelectedProviderName()}
                </Chip>
              )}
              
              {selectedDatacenter && (
                <Chip
                  onClose={() => handleDatacenterChange(null)}
                  variant="flat"
                  color="success"
                  startContent={<MapPinIcon className="h-3 w-3" />}
                >
                  Datacenter: {getSelectedDatacenterName()}
                </Chip>
              )}

              <Button
                onClick={clearFilters}
                size="sm"
                variant="light"
                color="danger"
                className="ml-auto"
              >
                Clear All
              </Button>
            </div>
          </div>
        )}

        {/* Results Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Available Spaces
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {loading ? "Loading..." : `${totalItems} spaces found`}
              </p>
            </div>
          </div>

          {/* Space Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 12 }).map((_, index) => (
                <Card key={index} className="h-full">
                  <CardHeader className="p-0">
                    <Skeleton className="w-full h-48 rounded-none" />
                  </CardHeader>
                  <CardBody className="p-4 space-y-3">
                    <Skeleton className="w-3/4 h-6 rounded" />
                    <Skeleton className="w-full h-4 rounded" />
                    <Skeleton className="w-full h-4 rounded" />
                    <div className="flex justify-between items-center pt-2">
                      <Skeleton className="w-24 h-6 rounded" />
                      <Skeleton className="w-16 h-4 rounded" />
                    </div>
                  </CardBody>
                  <CardFooter className="p-4 pt-0">
                    <Skeleton className="w-full h-10 rounded" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : spaces && spaces.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {spaces.map((space, index) => {
           
                return (
                  <div key={space._id || index}>
                    <SpaceCard space={space} provider={null} />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <ServerIcon className="h-24 w-24 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                No Spaces Found
              </h3>
              <p className="text-gray-500 dark:text-gray-500 mb-6">
                {searchTerm || selectedProvider || selectedDatacenter
                  ? "Try adjusting your filters or search terms"
                  : "No server rack spaces are currently available"}
              </p>
              {(searchTerm || selectedProvider || selectedDatacenter) && (
                <Button onClick={clearFilters} color="primary" variant="flat">
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="flat"
                isDisabled={page === 1}
                onPress={() => handlePageChange(page - 1)}
              >
                Previous
              </Button>
              
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else {
                    if (page <= 3) pageNum = i + 1;
                    else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = page - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      size="sm"
                      variant={page === pageNum ? "solid" : "flat"}
                      color={page === pageNum ? "primary" : "default"}
                      onPress={() => handlePageChange(pageNum)}
                      className="min-w-unit-8"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                size="sm"
                variant="flat"
                isDisabled={page === totalPages}
                onPress={() => handlePageChange(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
