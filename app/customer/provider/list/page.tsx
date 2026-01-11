"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardFooter } from "@heroui/card";
import { Input } from "@heroui/input";
import { Spinner } from "@heroui/spinner";
import { Link } from "@heroui/link";
import { button as buttonStyles } from "@heroui/theme";
import { Select, SelectItem } from "@heroui/select";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { motion } from "framer-motion";
import { Skeleton } from "@heroui/skeleton";
import {
  Search,
  Building,
  MapPin,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
  Filter,
  Server,
  X,
  ExternalLink,
} from "lucide-react";
import axios from "axios";
import { useS3Image } from "@/hooks/useS3Image";

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
  logo?: string;
  status?: string; // Can be "granted", "in review", etc.
  _isActive?: boolean; // Provider active status
  contact: {
    email: string;
    phone: string;
  };
}

interface Province {
  id_provinsi: string;
  nama_provinsi: string;
}

interface Regency {
  id_kabupaten: string;
  nama_kabupaten: string;
}

export default function ProviderListPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Location filter states
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [regencies, setRegencies] = useState<Regency[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>("");
  const [selectedProvinceName, setSelectedProvinceName] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [locationLoading, setLocationLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Fetch provinces
  const fetchProvinces = async () => {
    try {
      const response = await axios.get("/api/wilayah?type=provinces");
      setProvinces(response.data);
    } catch (error) {
      console.error("Failed to fetch provinces:", error);
    }
  };

  // Fetch regencies/cities
  const fetchRegencies = async (provinceCode: string) => {
    if (!provinceCode) return;

    setLocationLoading(true);
    try {
      const response = await axios.get(
        `/api/wilayah?type=regencies&provinceCode=${provinceCode}`
      );
      setRegencies(response.data);
    } catch (error) {
      console.error("Failed to fetch regencies:", error);
    } finally {
      setLocationLoading(false);
    }
  };

  const fetchProviders = async () => {
    setLoading(true);
    try {
      let url = "/api/customer/catalog/provider";

      // Add query parameters for filtering
      const params = new URLSearchParams();

      if (selectedProvinceName) {
        params.append("province", selectedProvinceName);
      }

      if (selectedCity) {
        params.append("city", selectedCity);
      }

      // Add params to URL if any exist
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }

      const response = await axios.get(url);
      if (response.data.status === "ok") {
        setProviders(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch partner:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchProvinces();
    fetchProviders();
  }, []);

  // When province changes, fetch cities
  useEffect(() => {
    if (selectedProvinceId) {
      fetchRegencies(selectedProvinceId);
      setSelectedCity(""); // Reset city when province changes

      // Fetch providers with the new province filter
      fetchProviders();
    }
  }, [selectedProvinceId, selectedProvinceName]);

  // When city filter changes, fetch providers
  useEffect(() => {
    fetchProviders();
    setCurrentPage(1); // Reset pagination
  }, [selectedCity]);

  // Reset pagination when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Handle province change
  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinceId = e.target.value;
    setSelectedProvinceId(provinceId);

    // Get and store the province name for filtering
    const provinceName =
      provinces.find((province) => province.id_provinsi === provinceId)
        ?.nama_provinsi || "";

    setSelectedProvinceName(provinceName);
  };

  // Handle city change
  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // For @heroui/select, we need to explicitly get the city name
    const cityName =
      regencies.find((city) => city.id_kabupaten === e.target.value)
        ?.nama_kabupaten || e.target.value;

    setSelectedCity(cityName);
  };

  // Filter providers based on search query and grant status
  const filteredProviders = providers.filter(
    (provider) =>
      provider.status === "granted" &&
      provider._isActive === true &&
      provider.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Paginate providers
  const totalPages = Math.ceil(filteredProviders.length / itemsPerPage);
  const paginatedProviders = filteredProviders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Reset all filters
  const clearFilters = () => {
    setSelectedProvinceId("");
    setSelectedProvinceName("");
    setSelectedCity("");
    setSearchQuery("");
    fetchProviders(); // Refetch without filters
  };

  // Provider Card component
  const ProviderCard = ({ provider }: { provider: Provider }) => {
    const { imageUrl, isLoading } = useS3Image(provider.logo, {});

    return (
      <Card className="overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-blue-100 dark:border-blue-900 h-full">
        <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
        <CardBody className="p-6 flex flex-col h-full">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/50 flex items-center justify-center mr-3 overflow-hidden border border-blue-100 dark:border-blue-800">
              {provider.logo ? (
                isLoading ? (
                  <Skeleton className="w-full h-full" />
                ) : (
                  <img
                    src={imageUrl}
                    alt={`${provider.name} logo`}
                    className="w-full h-full object-contain p-1"
                  />
                )
              ) : (
                <Server
                  className="text-blue-600 dark:text-blue-400"
                  size={20}
                />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">
                {provider.name}
              </h3>
              <div className="mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Active
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-start mb-4">
            <MapPin
              className="text-blue-500 mr-2 mt-1 flex-shrink-0"
              size={16}
            />
            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
              {provider.address}
            </p>
          </div>

          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-5 min-h-[4.5rem]">
            {provider.description}
          </p>

          <div className="space-y-2 border-t border-gray-100 dark:border-gray-800 pt-4 mt-auto">
            <div className="flex items-center">
              <Mail className="text-blue-500 mr-2 flex-shrink-0" size={16} />
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {provider.contact.email}
              </p>
            </div>
            <div className="flex items-center">
              <Phone className="text-blue-500 mr-2 flex-shrink-0" size={16} />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {provider.contact.phone}
              </p>
            </div>
          </div>
        </CardBody>

        <CardFooter className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-t border-blue-100 dark:border-blue-900">
          <Link
            href={`/customer/provider/${provider._id}`}
            className={buttonStyles({
              color: "primary",
              variant: "flat",
              className:
                "w-full font-medium transition-all hover:bg-blue-100 dark:hover:bg-blue-900/50",
            })}
          >
            View Details
            <ExternalLink size={16} className="ml-1" />
          </Link>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="min-h-screen ">
      {/* Hero Section */}
      <section className="bg-[#155183] text-white py-16 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="max-w-3xl mx-auto text-center"
          >
            <p className="text-sm uppercase tracking-wider text-blue-100 mb-2">
              Find Your Partner
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Data Center Partners
            </h1>
            <p className="text-xl text-blue-100">
              Explore premium data center providers for your enterprise hosting
              needs
            </p>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-10 right-[10%] w-64 h-64 rounded-full bg-blue-400/10"></div>
          <div className="absolute bottom-10 left-[10%] w-56 h-56 rounded-full bg-blue-400/10"></div>
        </div>

        {/* Wave effect at bottom */}
      </section>

      {/* Search & Filter Section */}
      <section className="py-10 max-w-6xl mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 -mt-16 relative z-10 border border-gray-100 dark:border-gray-800"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <Input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startContent={<Search size={18} className="text-blue-500" />}
              endContent={
                searchQuery && (
                  <button onClick={() => setSearchQuery("")}>
                    <X
                      size={16}
                      className="text-gray-400 hover:text-gray-600"
                    />
                  </button>
                )
              }
              className="w-full shadow-sm"
              size="lg"
              classNames={{
                input: "font-medium",
                inputWrapper: "border-blue-100 dark:border-blue-900",
              }}
            />

            {/* Province */}
            <Select
              label=""
              placeholder="Select Province"
              value={selectedProvinceId}
              onChange={handleProvinceChange}
              startContent={<MapPin size={18} className="text-blue-500" />}
              size="lg"
              classNames={{
                trigger: "border-blue-100 dark:border-blue-900",
              }}
            >
              {provinces.map((province) => (
                <SelectItem
                  key={province.id_provinsi}
                  textValue={province.nama_provinsi}
                >
                  {province.nama_provinsi}
                </SelectItem>
              ))}
            </Select>

            {/* City */}
            <Select
              label=""
              placeholder={
                selectedProvinceId ? "Select City" : "Select province first"
              }
              value={selectedCity}
              onChange={handleCityChange}
              startContent={<Building size={18} className="text-blue-500" />}
              isDisabled={!selectedProvinceId || locationLoading}
              isLoading={locationLoading}
              size="lg"
              classNames={{
                trigger: "border-blue-100 dark:border-blue-900",
              }}
            >
              {regencies.map((regency) => (
                <SelectItem
                  key={regency.id_kabupaten}
                  textValue={regency.nama_kabupaten}
                >
                  {regency.nama_kabupaten}
                </SelectItem>
              ))}
            </Select>
          </div>

          {/* Active Filters */}
          {(selectedProvinceName || selectedCity || searchQuery) && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                <Filter size={14} className="mr-1" />
                Active filters:
              </span>

              {searchQuery && (
                <Chip
                  variant="flat"
                  color="primary"
                  onClose={() => setSearchQuery("")}
                  className="text-sm"
                >
                  Search: {searchQuery}
                </Chip>
              )}

              {selectedProvinceName && (
                <Chip
                  variant="flat"
                  color="primary"
                  onClose={() => {
                    setSelectedProvinceId("");
                    setSelectedProvinceName("");
                  }}
                  className="text-sm"
                >
                  Province: {selectedProvinceName}
                </Chip>
              )}

              {selectedCity && (
                <Chip
                  variant="flat"
                  color="primary"
                  onClose={() => setSelectedCity("")}
                  className="text-sm"
                >
                  City: {selectedCity}
                </Chip>
              )}

              <button
                onClick={clearFilters}
                className={buttonStyles({
                  color: "danger",
                  variant: "light",
                  size: "sm",
                  className: "ml-auto",
                })}
              >
                Clear All
              </button>
            </div>
          )}
        </motion.div>
      </section>

      {/* Providers List Section */}
      <section className="py-10 max-w-6xl mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="text-center mb-8"
        >
          <Chip color="primary" variant="flat" className="mb-4">
            Directory
          </Chip>
          <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
            Available Data Centers
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Connect with the right data center provider to support your
            infrastructure needs
          </p>
          <Divider className="max-w-xs mx-auto mt-4" />
        </motion.div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center h-60">
            <Spinner size="lg" color="primary" />
          </div>
        ) : filteredProviders.length > 0 ? (
          <>
            {/* Provider Cards */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              {paginatedProviders.map((provider) => (
                <motion.div key={provider._id} variants={fadeIn}>
                  <ProviderCard provider={provider} />
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                className="flex justify-center items-center gap-2 mt-12"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
              >
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={buttonStyles({
                    color: "default",
                    variant: "flat",
                    size: "sm",
                    isDisabled: currentPage === 1,
                    className: "border border-blue-200 dark:border-blue-800",
                  })}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage > totalPages - 3) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={buttonStyles({
                        color: "default",
                        variant: "flat",
                        size: "sm",
                        className:
                          "border border-blue-200 dark:border-blue-800",
                      })}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={buttonStyles({
                    color: "default",
                    variant: "flat",
                    size: "sm",
                    isDisabled: currentPage === totalPages,
                    className: "border border-blue-200 dark:border-blue-800",
                  })}
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </motion.div>
            )}
          </>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500 dark:text-gray-400">
              No providers found matching your criteria.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
