"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { title, subtitle } from "@/components/primitives";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Image } from "@heroui/image";
import { Skeleton } from "@heroui/skeleton";
import { button as buttonStyles } from "@heroui/theme";
import { Link } from "@heroui/link";
import { Divider } from "@heroui/divider";
import { Chip } from "@heroui/chip";
import { motion } from "framer-motion";
import axios from "axios";
import {
  ChevronLeft,
  ChevronRight,
  Server,
  Building,
  Mail,
  Phone,
  MapPin,
  Tag,
  Layers,
  ArrowLeft,
  ChevronDown,
  ExternalLink,
} from "lucide-react";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerChildren = {
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
}

// Helper function to check if a URL is complete
const isFullUrl = (url: string): boolean => {
  return url.startsWith("http://") || url.startsWith("https://");
};

// Update the S3 image URL fetching function to use url property
const getS3ImageUrl = async (imageKey: string): Promise<string> => {
  try {
    // Skip API call if it's already a full URL
    if (isFullUrl(imageKey)) {
      return imageKey;
    }

    // Handle empty or invalid image keys
    if (!imageKey || typeof imageKey !== "string") {
      console.warn("Invalid image key:", imageKey);
      return "/images/data-center.gif"; // Fallback image
    }

    const encodedKey = encodeURIComponent(imageKey);
    const response = await axios.get(`/api/get-s3-image?key=${encodedKey}`);

    if (response.data.status === "ok" && response.data.url) {
      return response.data.url;
    } else {
      console.warn("S3 API returned unexpected response:", response.data);
      return `/api/get-s3-image?key=${encodedKey}&direct=true`;
    }
  } catch (error) {
    console.error("Failed to get S3 image URL:", error);
    return "/images/data-center.gif"; // Fallback image on error
  }
};

interface Space {
  _id: string;
  name: string;
  datacenter: string;
  description: string;
  price: number;
  size: string;
  images?: string[];
  imagesUrl?: string[];
  provider: Provider;
  _addedBy: string;
  publish?: boolean;
}

interface DataCenter {
  _id: string;
  name: string;
  address: string;
  coordinate: string;
  description: string;
  provider: string;
  spaces: Space[];
}

export default function SpaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const spaceId = params.id as string;

  const [space, setSpace] = useState<Space | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [dataCenter, setDataCenter] = useState<DataCenter | null>(null);
  const [relatedSpaces, setRelatedSpaces] = useState<Space[]>([]);
  const [processedImages, setProcessedImages] = useState<string[]>([]);

  const fetchSpaceData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `/api/customer/catalog/space/${spaceId}`
      );
      if (response.data.status === "ok") {
        const spaceData = response.data.data;

        // Process images to get direct S3 URLs if needed
        if (spaceData.images && spaceData.images.length > 0) {
          const imagePromises = spaceData.images.map((img: string) =>
            getS3ImageUrl(img)
          );
          const resolvedImages = await Promise.all(imagePromises);
          setProcessedImages(resolvedImages);
        }

        setSpace(spaceData);
        localStorage.setItem("selectedSpace", JSON.stringify(spaceData));

        // Fetch datacenter data
        if (spaceData.datacenter) {
          fetchDataCenterData(spaceData.datacenter);
        }
      }
    } catch (error) {
      console.error("Failed to fetch space data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update fetchDataCenterData to use the same url property consistently
  const fetchDataCenterData = async (dataCenterId: string) => {
    try {
      const response = await axios.get(
        `/api/customer/catalog/datacenter/${dataCenterId}`
      );
      if (response.data.status === "ok") {
        setDataCenter(response.data.data);

        // Filter related spaces (exclude current space)
        if (response.data.data.spaces) {
          const related = response.data.data.spaces.filter(
            (relatedSpace: Space) =>
              relatedSpace._id !== spaceId && relatedSpace.publish === true
          );

          // Process each space's images - use url property instead of data
          const processedSpaces = await Promise.all(
            related.map(async (relatedSpace: Space) => {
              if (relatedSpace.images && relatedSpace.images.length > 0) {
                // Always use only the first image
                const firstImageUrl = await getS3ImageUrl(
                  relatedSpace.images[0]
                );

                console.log(
                  `Processed URL for ${relatedSpace.name}:`,
                  firstImageUrl
                );

                return {
                  ...relatedSpace,
                  processedImageUrl: firstImageUrl,
                };
              }
              return relatedSpace;
            })
          );

          setRelatedSpaces(processedSpaces);
        }
      }
    } catch (error) {
      console.error("Failed to fetch datacenter data:", error);
    }
  };

  useEffect(() => {
    if (spaceId) {
      const storedSpace = localStorage.getItem("selectedSpace");
      if (storedSpace) {
        const parsedSpace = JSON.parse(storedSpace);
        if (parsedSpace._id === spaceId) {
          setSpace(parsedSpace);

          // Process images for cached space data
          if (parsedSpace.images && parsedSpace.images.length > 0) {
            const processImages = async () => {
              const imagePromises = parsedSpace.images.map((img: string) =>
                getS3ImageUrl(img)
              );
              const resolvedImages = await Promise.all(imagePromises);
              setProcessedImages(resolvedImages);
            };
            processImages();
          }

          setLoading(false);

          // Still fetch datacenter data even when using cached space data
          if (parsedSpace.datacenter) {
            fetchDataCenterData(parsedSpace.datacenter);
          }
          return;
        }
      }
      fetchSpaceData();
    }
  }, [spaceId]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const nextImage = () => {
    const imageCount = space?.images?.length || space?.imagesUrl?.length || 0;
    if (imageCount > 0) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === imageCount - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const prevImage = () => {
    const imageCount = space?.images?.length || space?.imagesUrl?.length || 0;
    if (imageCount > 0) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? imageCount - 1 : prevIndex - 1
      );
    }
  };

  const selectImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Loading Skeleton Hero */}
        <div className="bg-[#155183] text-white py-16 relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <Skeleton className="h-10 w-2/3 max-w-xl rounded-lg mb-3" />
            <Skeleton className="h-6 w-1/3 max-w-md rounded-lg" />
          </div>
          <div className="absolute bottom-0 left-0 right-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1440 120"
              preserveAspectRatio="none"
              className="w-full h-[70px] translate-y-1"
            >
              <path
                fill="currentColor"
                fillOpacity="1"
                className="text-gray-50 dark:text-gray-950"
                d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,80C672,64,768,64,864,74.7C960,85,1056,107,1152,112C1248,117,1344,107,1392,101.3L1440,96L1440,120L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
              ></path>
            </svg>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 -mt-10 relative z-10 space-y-8">
          {/* Main content loading skeleton */}
          <Card className="border border-blue-100 dark:border-blue-900 shadow-xl overflow-hidden">
            <CardBody className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Image gallery skeleton */}
                <div className="space-y-4">
                  <Skeleton className="aspect-square w-full rounded-xl" />
                  <div className="flex gap-2 justify-center">
                    <Skeleton className="w-20 h-20 rounded-md" />
                    <Skeleton className="w-20 h-20 rounded-md" />
                    <Skeleton className="w-20 h-20 rounded-md" />
                    <Skeleton className="w-20 h-20 rounded-md" />
                  </div>
                </div>

                {/* Details skeleton */}
                <div className="space-y-6">
                  <div>
                    <Skeleton className="h-8 w-48 rounded-lg mb-2" />
                    <Skeleton className="h-5 w-64 rounded-lg" />
                  </div>

                  <Divider />

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-24 rounded mb-1" />
                        <Skeleton className="h-6 w-40 rounded" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-28 rounded mb-1" />
                        <Skeleton className="h-6 w-32 rounded" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-36 rounded mb-1" />
                        <Skeleton className="h-6 w-full rounded" />
                      </div>
                    </div>
                  </div>

                  <Divider />

                  <div className="flex gap-3">
                    <Skeleton className="h-12 w-1/2 rounded-lg" />
                    <Skeleton className="h-12 w-1/2 rounded-lg" />
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Provider info skeleton */}
          <Card className="border border-blue-100 dark:border-blue-900 shadow-md overflow-hidden">
            <CardHeader>
              <Skeleton className="h-8 w-48 rounded-lg" />
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-24 rounded mb-1" />
                    <Skeleton className="h-6 w-56 rounded" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-28 rounded mb-1" />
                    <Skeleton className="h-6 w-48 rounded" />
                    <Skeleton className="h-6 w-40 rounded mt-1" />
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center px-4 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <Server className="h-24 w-24 text-blue-300 dark:text-blue-700 mx-auto" />
        </motion.div>
        <h1 className={title({ color: "blue" })}>Server Rack Not Found</h1>
        <p className={subtitle({ class: "mt-4 max-w-lg" })}>
          The server rack you are looking for does not exist or has been
          removed.
        </p>
        <Link
          href="/customer/provider/list"
          className={buttonStyles({
            color: "primary",
            class: "mt-8",
            radius: "lg",
            size: "lg",
          })}
        >
          Browse Providers
        </Link>
      </div>
    );
  }

  // Function to render related space cards - update image handling
  const renderRelatedSpaceCard = (relatedSpace: any) => {
    // Get the processed image URL
    const imageUrl = relatedSpace.processedImageUrl || null;

    console.log(
      `Rendering card for ${relatedSpace.name}, image URL:`,
      imageUrl
    );

    return (
      <motion.div
        key={relatedSpace._id}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
        className="flex-shrink-0 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-3"
      >
        <Card className="h-full border border-blue-100 dark:border-blue-900 hover:shadow-lg transition-all duration-300">
          <CardBody className="p-3">
            <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-3">
              {imageUrl ? (
                <div className="w-full h-full relative">
                  <img
                    src={imageUrl}
                    alt={relatedSpace.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error(
                        `Image failed to load for ${relatedSpace.name}:`,
                        imageUrl
                      );
                      e.currentTarget.style.display = "none";
                      // Show server icon fallback
                      const parent = e.currentTarget.parentElement;
                      if (parent instanceof HTMLElement) {
                        const iconContainer = document.createElement("div");
                        iconContainer.className =
                          "absolute inset-0 flex items-center justify-center";
                        iconContainer.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-300 dark:text-gray-700"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`;
                        parent.appendChild(iconContainer);
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Server className="w-10 h-10 text-gray-300 dark:text-gray-700" />
                </div>
              )}
              <div className="absolute top-2 right-2">
                <Chip
                  color="primary"
                  variant="solid"
                  size="sm"
                  className="bg-blue-600/90"
                >
                  {relatedSpace.size}U
                </Chip>
              </div>
            </div>
            <h3 className="text-md font-semibold line-clamp-1 mb-1">
              {relatedSpace.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
              {relatedSpace.description}
            </p>
            <p className="text-blue-600 dark:text-blue-400 font-bold">
              {formatPrice(relatedSpace.price)}
              <span className="text-xs font-normal text-gray-500">/month</span>
            </p>
          </CardBody>
          <CardFooter className="pt-0 pb-3 px-3">
            <Link
              href={`/customer/space/${relatedSpace._id}`}
              className={buttonStyles({
                color: "primary",
                variant: "flat",
                radius: "lg",
                class: "w-full text-sm",
              })}
            >
              View Details
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen ">
      {/* Hero Section */}
      <section className="bg-[#155183] text-white py-16 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial="hidden" animate="visible" variants={fadeIn}>
            <Link
              href={`/customer/provider/${space.provider._id}`}
              className="flex items-center text-blue-100 mb-4 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to {space.provider.name}
            </Link>

            <h1 className="text-4xl font-bold mb-3">{space.name}</h1>
            <p className="text-xl text-blue-100">
              Enterprise-grade server rack provided by{" "}
              <Link
                href={`/customer/provider/${space.provider._id}`}
                className="font-medium underline hover:text-white"
              >
                {space.provider.name}
              </Link>
            </p>

            <div className="flex flex-wrap gap-3 mt-5">
              <Chip
                color="primary"
                variant="solid"
                className="bg-blue-400/20 border border-blue-300/30 text-white"
              >
                <span className="flex items-center">
                  <Layers className="w-4 h-4 mr-2" />
                  {space.size}U Rack
                </span>
              </Chip>
              <Chip
                color="primary"
                variant="solid"
                className="bg-blue-400/20 border border-blue-300/30 text-white"
              >
                <span className="flex items-center">
                  <Tag className="w-4 h-4 mr-2" />
                  {formatPrice(space.price)}/month
                </span>
              </Chip>
            </div>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-50">
          <div className="absolute top-1/4 right-10 w-64 h-64 rounded-full bg-blue-400/10"></div>
          <div className="absolute bottom-1/4 left-10 w-48 h-48 rounded-full bg-blue-400/10"></div>
        </div>

        {/* Wave effect at bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            className="w-full h-[70px] translate-y-1"
          ></svg>
        </div>
      </section>

      {/* Main Content - Improved spacing and layout */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="mt-[-4rem] mb-12 space-y-8">
          {/* Main details card */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <Card className="border border-blue-100 dark:border-blue-900 shadow-xl overflow-hidden">
              <CardBody className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                  {/* Space Images - Updated to work with both image properties */}
                  <div className="p-0 md:border-r border-gray-100 dark:border-gray-800">
                    {(space.images && space.images.length > 0) ||
                    (space.imagesUrl && space.imagesUrl.length > 0) ? (
                      <div>
                        {" "}
                        {/* Main Image Display */}{" "}
                        <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden">
                          {/* Update the main image display section to use processedImages consistently */}
                          <img
                            src={processedImages[currentImageIndex] || ""}
                            alt={`${space.name} - Image ${currentImageIndex + 1}`}
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              objectPosition: "center",
                            }}
                            onError={(e) => {
                              console.error(
                                `Image failed to load:`,
                                e.currentTarget.src
                              );
                              // Hide the failed image
                              e.currentTarget.style.display = "none";

                              // Show icon directly in parent
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                const iconContainer =
                                  document.createElement("div");
                                iconContainer.className =
                                  "absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800";
                                iconContainer.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-300 dark:text-gray-700"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`;
                                parent.appendChild(iconContainer);
                              }
                            }}
                          />
                          {/* Navigation buttons */}
                          <button
                            onClick={prevImage}
                            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-3 rounded-full shadow-lg transition-colors z-10"
                            aria-label="Previous image"
                            disabled={
                              (space.images?.length ||
                                space.imagesUrl?.length ||
                                0) <= 1
                            }
                          >
                            <ChevronLeft className="w-5 h-5 text-white" />
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-3 rounded-full shadow-lg transition-colors z-10"
                            aria-label="Next image"
                            disabled={
                              (space.images?.length ||
                                space.imagesUrl?.length ||
                                0) <= 1
                            }
                          >
                            <ChevronRight className="w-5 h-5 text-white" />
                          </button>
                          {/* Image counter indicator */}
                          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full text-sm text-white z-10 font-medium">
                            {currentImageIndex + 1}/
                            {space.images?.length ||
                              space.imagesUrl?.length ||
                              1}
                          </div>
                        </div>
                        {/* Thumbnail strip - adjusted to properly handle S3 images */}
                        {processedImages.length > 1 && (
                          <div className="flex overflow-x-auto gap-2 p-4 snap-x">
                            {processedImages.map((img, idx) => (
                              <button
                                key={idx}
                                className={`relative min-w-[50px] h-[70px] rounded-md overflow-hidden flex-shrink-0 snap-center transition-all duration-200 ${
                                  idx === currentImageIndex
                                    ? "ring-2 ring-blue-600 dark:ring-blue-500 scale-105"
                                    : "opacity-70 hover:opacity-100"
                                }`}
                                onClick={() => setCurrentImageIndex(idx)}
                                title={`Image ${idx + 1}`}
                              >
                                <Image
                                  src={img || "/images/data-center.gif"}
                                  alt={`${space.name} - Thumbnail ${idx + 1}`}
                                  width={120}
                                  height={120}
                                  className="w-full h-full object-cover"
                                />
                                {idx === currentImageIndex && (
                                  <div className="absolute inset-0 border-2 border-blue-600 dark:border-blue-500 "></div>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="aspect-square bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center">
                        <Server className="w-20 h-20 text-gray-300 dark:text-gray-700" />
                        <p className="text-gray-500 dark:text-gray-400 mt-4">
                          No images available
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Space Details */}
                  <div className="p-8">
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                          Server Rack Details
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                          Enterprise-grade server rack with premium features
                        </p>
                        {dataCenter && (
                          <div className="mt-2 flex items-center">
                            <Server className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2" />
                            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                              Located at {dataCenter.name}
                            </span>
                          </div>
                        )}
                      </div>

                      <Divider />

                      <div className="space-y-5">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full flex-shrink-0">
                            <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Rack Size
                            </p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                              {space.size}U
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full flex-shrink-0">
                            <Tag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Monthly Price
                            </p>
                            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                              {formatPrice(space.price)}
                              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                /month
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full flex-shrink-0 mt-1">
                            <Server className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Description
                            </p>
                            <p className="text-gray-700 dark:text-gray-300">
                              {space.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      <Divider />

                      <div className="flex gap-3">
                        <Link
                          href={`/customer/provider/${space.provider._id}`}
                          className={buttonStyles({
                            color: "default",
                            variant: "flat",
                            radius: "lg",
                            class:
                              "flex-1 border border-blue-200 dark:border-blue-800 font-medium",
                          })}
                        >
                          View Provider
                        </Link>
                        {space.publish !== false && (
                          <button
                            onClick={() => {
                              localStorage.setItem(
                                "selectedSpace",
                                JSON.stringify(space)
                              );
                              router.push(
                                `/customer/orders/new?id=${space._id}`
                              );
                            }}
                            className={buttonStyles({
                              color: "primary",
                              radius: "lg",
                              class: "flex-1 font-medium",
                            })}
                          >
                            Order Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* Data Center Info Card */}
          {dataCenter && (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="mt-8"
            >
              <Card className="border border-blue-100 dark:border-blue-900 shadow-md overflow-hidden">
                <CardHeader className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 p-6">
                  <div className="flex items-center">
                    <Server className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Data Center Information
                    </h2>
                  </div>
                </CardHeader>
                <CardBody className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        {dataCenter.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {dataCenter.description}
                      </p>

                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full flex-shrink-0">
                          <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">
                          {dataCenter.address}
                        </p>
                      </div>

                      {dataCenter.coordinate && (
                        <div className="mt-4">
                          <Link
                            href={`https://maps.google.com/maps?q=${dataCenter.coordinate}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={buttonStyles({
                              color: "primary",
                              variant: "flat",
                              radius: "lg",
                              size: "sm",
                              class: "font-medium",
                            })}
                          >
                            <MapPin className="w-4 h-4 mr-2" />
                            View on Google Maps
                            <ExternalLink className="w-3 h-3 ml-2" />
                          </Link>
                        </div>
                      )}
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4">
                      <h4 className="text-md font-medium text-blue-700 dark:text-blue-400 mb-2">
                        Data Center Features
                      </h4>
                      <p>{dataCenter.description}</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          )}

          {/* Provider Info Card - separated with proper spacing */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="mt-8"
          >
            <Card className="border border-blue-100 dark:border-blue-900 shadow-md overflow-hidden">
              <CardHeader className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 p-6">
                <div className="flex items-center">
                  <Building className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    About {space.provider.name}
                  </h2>
                </div>
              </CardHeader>
              <CardBody className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full flex-shrink-0">
                      <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Location
                      </p>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {space.provider.address}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full flex-shrink-0">
                      <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Email
                      </p>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {space.provider.contact.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full flex-shrink-0">
                      <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Phone
                      </p>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {space.provider.contact.phone}
                      </p>
                    </div>
                  </div>
                </div>
              </CardBody>
              <CardFooter className="bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 p-6">
                <Link
                  href={`/customer/provider/${space.provider._id}`}
                  className={buttonStyles({
                    color: "primary",
                    variant: "flat",
                    radius: "lg",
                    class: "font-medium",
                  })}
                >
                  <Building className="w-4 h-4 mr-2" />
                  Browse More Racks from this Provider
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Link>
              </CardFooter>
            </Card>
          </motion.div>
        </div>

        {/* Related Spaces Section */}
        {relatedSpaces.length > 0 && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerChildren}
            className="mb-6"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                More Spaces at {dataCenter?.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Browse other server racks available at this data center
              </p>
            </div>

            <div className="flex flex-wrap -mx-3">
              {relatedSpaces.map((relatedSpace) =>
                renderRelatedSpaceCard(relatedSpace)
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Back to Catalog - better spacing */}
      <div className="text-center mt-12 mb-4">
        <Link
          href="/customer/provider/list"
          className={buttonStyles({
            color: "default",
            variant: "light",
            radius: "lg",
          })}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Browse All Providers
        </Link>
      </div>
    </div>
  );
}
