"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { Image } from "@heroui/image";
import { title } from "@/components/primitives";
import axios from "axios";
import { Link } from "@heroui/link";
import { Spinner } from "@heroui/spinner";
import { addToast } from "@heroui/toast";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { motion } from "framer-motion";
import {
  Building,
  ShoppingCart,
  Calendar,
  Tag,
  MapPin,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  ChevronLeft,
  CreditCard,
  Layers,
  Server,
  X,
} from "lucide-react";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
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

interface Space {
  _id: string;
  name: string;
  description: string;
  price: number;
  size: string;
  images?: string[];
  imagesUrl?: string[];
  provider: Provider;
  _addedBy: string;
  paymentPlan?: {
    monthly?: number;
    quarterly?: number;
    annually?: number;
  };
}

// Add a Settings interface for PPN
interface Settings {
  _id: string;
  ppn: number;
  isMaintenance: boolean;
}

export default function NewOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const spaceId = searchParams.get("id");

  const [submitting, setSubmitting] = useState(false);
  const [space, setSpace] = useState<Space | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("monthly");
  const [pricingPlans, setPricingPlans] = useState<
    {
      id: string;
      name: string;
      months: number;
      discount: number;
    }[]
  >([]);
  // Add state for PPN
  const [ppnRate, setPpnRate] = useState<number>(0);
  const [ppnLoading, setPpnLoading] = useState(true);

  useEffect(() => {
    // Fetch both space data and PPN settings
    const fetchData = async () => {
      if (!spaceId) {
        addToast({
          title: "Error",
          color: "danger",
          description: "No space selected",
        });
        router.push("/customer/catalog");
        return;
      }

      try {
        setLoading(true);

        // Fetch space data and PPN settings in parallel
        const [spaceResponse, settingsResponse] = await Promise.all([
          axios.get(`/api/customer/catalog/space/${spaceId}`),
          axios.get("/api/setting"),
        ]);

        console.log("Space data response:", spaceResponse.data);

        // Process space data
        if (spaceResponse.data.status === "ok") {
          setSpace(spaceResponse.data.data);
          localStorage.setItem(
            "selectedSpace",
            JSON.stringify(spaceResponse.data.data)
          );
        } else {
          addToast({
            title: "Error",
            color: "danger",
            description: "Failed to load space data",
          });
        }

        // Process settings data to get PPN
        if (settingsResponse.data.status === "ok") {
          setPpnRate(settingsResponse.data.data.ppn);
        } else {
          console.warn("Failed to load PPN rate, using default 0%");
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        addToast({
          title: "Error",
          color: "danger",
          description: "Failed to load required data",
        });
      } finally {
        setLoading(false);
        setPpnLoading(false);
      }
    };

    fetchData();
  }, [spaceId, router]);

  useEffect(() => {
    if (space) {
      // Generate pricing plans based on space.paymentPlan
      const plans = [];

      // Monthly plan is always included
      plans.push({
        id: "monthly",
        name: "Monthly",
        months: 1,
        discount: space.paymentPlan?.monthly || 0,
      });

      // Only add quarterly plan if it exists and is not 0
      if (
        space.paymentPlan?.quarterly !== undefined &&
        space.paymentPlan.quarterly !== 0
      ) {
        plans.push({
          id: "quarterly",
          name: "Quarterly",
          months: 3,
          discount: space.paymentPlan.quarterly,
        });
      }

      // Only add annually plan if it exists and is not 0
      if (
        space.paymentPlan?.annually !== undefined &&
        space.paymentPlan.annually !== 0
      ) {
        plans.push({
          id: "annually",
          name: "Annually",
          months: 12,
          discount: space.paymentPlan.annually,
        });
      }

      setPricingPlans(plans);
    }
  }, [space]);

  const handleShowTerms = () => {
    setIsTermsModalOpen(true);
  };

  const handleAgreeAndOrder = () => {
    setTermsAgreed(true);
    setIsTermsModalOpen(false);
    handleOrder();
  };

  const handleOrder = async () => {
    if (!spaceId) {
      addToast({
        title: "Error",
        color: "danger",
        description: "Invalid space selected",
      });
      return;
    }

    try {
      setSubmitting(true);

      const response = await axios.post("/api/rent/new", {
        spaceId,
        plan: selectedPlan,
        ppnRate: ppnRate, // Send the PPN rate with the order
      });

      if (response.data.status === "ok") {
        addToast({
          title: "Success",
          color: "success",
          description: "Order created successfully",
        });
        router.push("/customer/orders");
      } else {
        addToast({
          title: "Warning",
          color: "warning",
          description: response.data.message || "Failed to create order",
        });
      }
    } catch (error: any) {
      console.error("Failed to create order:", error);
      addToast({
        title: "Error",
        color: "danger",
        description: error.response?.data?.message || "Failed to create order",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const calculatePrice = (basePrice: number, planId: string) => {
    const plan = pricingPlans.find((p) => p.id === planId);
    if (!plan) return basePrice;

    const discountedPrice = basePrice * (1 - plan.discount / 100);

    return discountedPrice * plan.months;
  };

  // Add a function to calculate PPN amount
  const calculatePpnAmount = (subtotal: number) => {
    return (subtotal * ppnRate) / 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex justify-center items-center">
        <Spinner size="lg" color="primary" />
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
        <h1 className={title({ color: "blue" })}>Invalid Order Request</h1>
        <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          Please select a server rack from the catalog first to proceed with
          your order.
        </p>
        <Link
          href="/customer/provider/list"
          className="mt-8 inline-flex items-center px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
        >
          <ChevronLeft className="mr-2 h-5 w-5" />
          Browse Providers
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <section className="bg-[#155183] text-white py-12 relative overflow-hidden">
        <div className="container max-w-6xl mx-auto px-4 relative z-10">
          <motion.div initial="hidden" animate="visible" variants={fadeIn}>
            <Link
              href={`/customer/space/${space._id}`}
              className="flex items-center text-blue-100 mb-4 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Space Details
            </Link>

            <div className="flex items-center">
              <ShoppingCart className="w-8 h-8 mr-3" />
              <h1 className="text-3xl font-bold">Complete Your Order</h1>
            </div>
            <p className="text-blue-100 mt-2 max-w-2xl">
              You're ordering rack space from {space.provider.name}. Please
              review your order details and select a payment plan.
            </p>
          </motion.div>
        </div>

        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-50">
          <div className="absolute top-1/4 right-10 w-64 h-64 rounded-full bg-blue-400/10"></div>
          <div className="absolute bottom-1/4 left-10 w-48 h-48 rounded-full bg-blue-400/10"></div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            className="w-full h-[70px] translate-y-1"
          ></svg>
        </div>
      </section>

      {/* Display the payment plans section only when pricingPlans have been loaded */}
      {!loading && space && (
        <div className="container mx-auto px-4 py-8 -mt-10 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="max-w-6xl mx-auto"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="border border-blue-100 dark:border-blue-900 shadow-lg overflow-hidden">
                  <CardHeader className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-900 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center">
                        <Server className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                          Space Details
                        </h2>
                      </div>
                      <Chip color="primary" variant="flat" size="sm">
                        <span className="flex items-center">
                          <Layers className="mr-1 h-4 w-4" />
                          {space.size}U
                        </span>
                      </Chip>
                    </div>
                  </CardHeader>

                  <CardBody className="p-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                      <div className="relative h-full">
                        {(space.imagesUrl ?? []).length > 0 ||
                        (space.images ?? []).length > 0 ? (
                          <div className="relative aspect-square md:aspect-auto md:h-[400px]">
                            <Image
                              src={
                                space.imagesUrl?.[0] || space.images?.[0] || ""
                              }
                              alt={space.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center aspect-square md:aspect-auto md:h-full bg-gray-100 dark:bg-gray-800">
                            <Server className="h-20 w-20 text-gray-300 dark:text-gray-700" />
                          </div>
                        )}
                      </div>

                      <div className="p-6">
                        <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                          {space.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          {space.description}
                        </p>

                        <div className="space-y-4 mt-6">
                          <div className="flex items-center">
                            <Building className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                            <span className="text-gray-700 dark:text-gray-300">
                              {space.provider.name}
                            </span>
                          </div>

                          <div className="flex items-center">
                            <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                            <span className="text-gray-700 dark:text-gray-300">
                              {space.provider.address}
                            </span>
                          </div>

                          <div className="flex items-center">
                            <Tag className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                            <span className="text-gray-700 dark:text-gray-300 font-medium">
                              Base Price: {formatPrice(space.price)}/month
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
                <Card className="border border-blue-100 dark:border-blue-900 shadow-lg mt-6">
                  <CardHeader className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-900 p-6">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                      <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        Select Payment Plan
                      </h2>
                    </div>
                  </CardHeader>

                  <CardBody className="p-0">
                    <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
                      {pricingPlans.map((plan) => {
                        const totalPrice = calculatePrice(space.price, plan.id);
                        const monthlyEquivalent = totalPrice / plan.months;
                        const isSelected = selectedPlan === plan.id;

                        return (
                          <div
                            key={plan.id}
                            className={`relative cursor-pointer p-0 ${
                              isSelected ? "bg-blue-50 dark:bg-blue-900/20" : ""
                            }`}
                            onClick={() => setSelectedPlan(plan.id)}
                          >
                            <div className="flex items-center p-6">
                              <div className="w-6 h-6 mr-4 flex-shrink-0">
                                <div
                                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                    isSelected
                                      ? "border-blue-600 dark:border-blue-400"
                                      : "border-gray-300 dark:border-gray-600"
                                  }`}
                                >
                                  {isSelected && (
                                    <div className="w-3 h-3 rounded-full bg-blue-600 dark:bg-blue-400"></div>
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-1 justify-between items-center">
                                <div className="flex flex-col">
                                  <div className="flex items-center">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                      {plan.name}
                                    </h3>
                                    {plan.discount > 0 && (
                                      <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400 text-xs font-medium rounded-full">
                                        Save {plan.discount}%
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {plan.id === "monthly" &&
                                      "Standard pricing, no commitment"}
                                    {plan.id === "quarterly" &&
                                      "3-month commitment with 10% savings"}
                                    {plan.id === "annually" &&
                                      "12-month commitment with 20% savings"}
                                  </p>
                                </div>

                                <div className="text-right ml-4">
                                  <div className="text-lg md:text-xl font-bold text-blue-600 dark:text-blue-400">
                                    {formatPrice(totalPrice)}
                                  </div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    for {plan.months} month
                                    {plan.months > 1 ? "s" : ""}
                                  </p>
                                  {plan.months > 1 && (
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                      ({formatPrice(monthlyEquivalent)}/month)
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>

                            <input
                              type="radio"
                              name="paymentPlan"
                              id={`plan-${plan.id}`}
                              value={plan.id}
                              checked={selectedPlan === plan.id}
                              onChange={() => setSelectedPlan(plan.id)}
                              className="sr-only"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </CardBody>
                </Card>
              </div>

              <div>
                <Card className="border border-blue-100 dark:border-blue-900 shadow-lg sticky top-4">
                  <CardHeader className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-900 p-6">
                    <div className="flex items-center">
                      <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
                      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        Order Summary
                      </h2>
                    </div>
                  </CardHeader>

                  <CardBody className="p-6">
                    <div className="space-y-5">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Server Rack
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {space.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Size
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {space.size}U
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Payment Plan
                        </p>
                        <div className="font-semibold text-gray-900 dark:text-white flex items-center">
                          <span className="mr-2">
                            {
                              pricingPlans.find((p) => p.id === selectedPlan)
                                ?.name
                            }
                          </span>
                          <Chip size="sm" color="primary" variant="flat">
                            <span>
                              {
                                pricingPlans.find((p) => p.id === selectedPlan)
                                  ?.months
                              }{" "}
                              month
                              {pricingPlans.find((p) => p.id === selectedPlan)
                                ?.months! > 1
                                ? "s"
                                : ""}
                            </span>
                          </Chip>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Base Price
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatPrice(space.price)}/month
                        </p>
                      </div>
                      {(pricingPlans.find((p) => p.id === selectedPlan)
                        ?.discount ?? 0) > 0 && (
                        <div className="flex justify-between text-green-600 dark:text-green-400">
                          <p className="flex items-center">
                            <span>Discount</span>
                          </p>
                          <p className="font-semibold">
                            -
                            {
                              pricingPlans.find((p) => p.id === selectedPlan)
                                ?.discount
                            }
                            %
                          </p>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <p className="text-gray-900 dark:text-white">
                          Duration
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {
                            pricingPlans.find((p) => p.id === selectedPlan)
                              ?.months
                          }{" "}
                          month
                          {pricingPlans.find((p) => p.id === selectedPlan)
                            ?.months! > 1
                            ? "s"
                            : ""}
                        </p>
                      </div>
                      {/* Replace the old message with actual PPN calculation */}
                      <div className="flex justify-between items-center">
                        <p className="flex items-center text-gray-900 dark:text-white">
                          <span>PPN ({ppnRate}%)</span>
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatPrice(
                            calculatePpnAmount(
                              calculatePrice(space.price, selectedPlan)
                            )
                          )}
                        </p>
                      </div>
                      <Divider />
                      <div className="flex justify-between items-center">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          Total Price
                        </p>
                        <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                          {formatPrice(
                            calculatePrice(space.price, selectedPlan) +
                              calculatePpnAmount(
                                calculatePrice(space.price, selectedPlan)
                              )
                          )}
                        </p>
                      </div>
                      {selectedPlan !== "monthly" && (
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-900">
                          <div className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-green-700 dark:text-green-300">
                              You save{" "}
                              {formatPrice(
                                space.price *
                                  pricingPlans.find(
                                    (p) => p.id === selectedPlan
                                  )!.months *
                                  (pricingPlans.find(
                                    (p) => p.id === selectedPlan
                                  )!.discount /
                                    100)
                              )}{" "}
                              with this plan!
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardBody>

                  <CardFooter className="flex flex-col gap-3 border-t border-gray-100 dark:border-gray-800 p-6">
                    <Button
                      color="primary"
                      size="lg"
                      className="w-full"
                      onClick={handleShowTerms}
                      isLoading={submitting}
                      startContent={<CreditCard className="h-5 w-5" />}
                    >
                      Confirm Order
                    </Button>

                    <Link
                      href={`/customer/space/${space._id}`}
                      className="w-full"
                    >
                      <Button
                        variant="flat"
                        size="lg"
                        className="w-full border border-gray-200 dark:border-gray-700"
                        startContent={<ChevronLeft className="h-5 w-5" />}
                      >
                        Back to Details
                      </Button>
                    </Link>

                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                      By proceeding, you agree to our terms and conditions.
                    </p>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {isTermsModalOpen && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gray-200 dark:border-gray-700 shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Syarat dan Ketentuan
                </h3>
                <button
                  onClick={() => setIsTermsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="text-gray-700 dark:text-gray-300 space-y-4 text-sm">
                <h4 className="font-bold text-lg text-blue-600 dark:text-blue-400">
                  Syarat dan Ketentuan Program APJII Data Center
                </h4>
                <p>
                  Dokumen Syarat dan Ketentuan ini disusun berdasarkan Surat
                  Keputusan Ketua Umum Asosiasi Penyelenggara Jasa Internet
                  Indonesia Nomor 47 Tahun 2025 tentang Pedoman Teknis
                  Pelaksanaan Program APJII Data Center. Syarat dan Ketentuan
                  ini berlaku bagi perusahaan penyedia layanan Data Center yang
                  hendak menjadi mitra dan bagi Anggota APJII yang menggunakan
                  layanan dalam program ini.
                </p>

                <div className="space-y-4">
                  <div>
                    <h5 className="font-bold text-gray-900 dark:text-white">
                      Pasal 1: Definisi
                    </h5>
                    <ul className="list-disc pl-5 space-y-2 mt-2">
                      <li>
                        Program APJII Data Center adalah program kolaborasi
                        antara APJII dengan perusahaan penyedia layanan Data
                        Center yang dilaksanakan sebagai bentuk pelaksanaan
                        program kerja Bidang IIX dan Data Center APJII.
                      </li>
                      <li>
                        Mitra APJII Data Center ("Mitra APJII DC") adalah
                        perusahaan penyedia layanan Data Center yang memiliki
                        izin penyelenggaraan telekomunikasi resmi dan masih
                        berlaku.
                      </li>
                      <li>
                        Indonesia Internet Exchange (IIX) adalah jaringan
                        interkoneksi internet yang dimiliki dan dikelola oleh
                        APJII.
                      </li>
                      <li>
                        Node IIX adalah simpul perpanjangan IIX-APJII yang
                        menghubungkan konektivitas antar IIX.
                      </li>
                      <li>
                        Anggota adalah anggota Asosiasi Penyelenggara Jasa
                        Internet Indonesia (APJII).
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-bold text-gray-900 dark:text-white">
                      Pasal 2: Persyaratan Menjadi Mitra APJII DC
                    </h5>
                    <p className="mt-2">
                      Untuk dapat menjadi Mitra APJII DC, calon mitra wajib
                      memenuhi persyaratan sebagai berikut:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mt-2">
                      <li>
                        Calon Mitra APJII DC merupakan Mitra Node IIX yang
                        mengikuti aturan pada Surat Keputusan Ketua Umum Nomor
                        29 Tahun 2022 tentang Petunjuk Teknis Pembentukan Node
                        IIX.
                      </li>
                      <li>
                        Calon Mitra APJII DC harus mengikuti standar tier Data
                        Center sesuai dengan TIA-942.
                      </li>
                      <li>
                        Calon Mitra APJII DC harus mengikuti standar ISO 27001
                        dan ISO 9001.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-bold text-gray-900 dark:text-white">
                      Pasal 3: Spesifikasi dan Standar Teknis Mitra
                    </h5>
                    <p className="mt-2">
                      Mitra APJII DC wajib memenuhi dan memelihara spesifikasi
                      serta standar teknis yang merujuk pada kualifikasi standar
                      TIA-942, sebagai berikut:
                    </p>

                    <p className="mt-2 font-medium">
                      Kualifikasi Tier Data Center:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mt-1">
                      <li>
                        <span className="font-medium">TIER 1 - Basic:</span>
                        Menggunakan sistem single path untuk power dan
                        pendinginan (N). Estimasi downtime maksimal adalah 28.8
                        jam per tahun.
                      </li>
                      <li>
                        <span className="font-medium">
                          TIER 2 - Redundant Components:
                        </span>
                        Menggunakan sistem single path untuk power dan
                        pendinginan, namun mencakup komponen redundansi (N+1).
                        Memiliki raised floor, UPS, dan generator cadangan.
                        Estimasi downtime maksimal adalah 22 jam per tahun.
                      </li>
                      <li>
                        <span className="font-medium">
                          TIER 3 - Concurrently Maintainable:
                        </span>
                        Memiliki jalur distribusi daya dan pendinginan ganda
                        (satu jalur aktif) dengan komponen redundansi (N+1).
                        Memungkinkan aktivitas pemeliharaan terencana tanpa
                        mengganggu operasi. Estimasi downtime maksimal adalah
                        1,6 jam per tahun.
                      </li>
                      <li>
                        <span className="font-medium">
                          TIER 4 - Fault Tolerant:
                        </span>
                        Memiliki beberapa jalur distribusi daya dan pendinginan
                        yang aktif secara bersamaan dengan komponen redundansi
                        2(N+1). Dirancang untuk dapat menahan setidaknya satu
                        kejadian tidak terencana tanpa dampak pada critical
                        load. Estimasi downtime maksimal adalah 0,4 jam per
                        tahun.
                      </li>
                    </ul>

                    <p className="mt-3 font-medium">Pertimbangan Lingkungan:</p>
                    <p>
                      Mitra APJII DC harus mempertimbangkan keamanan lingkungan
                      Data Center, mencakup:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mt-1">
                      <li>
                        Resiko bencana alam seperti banjir, gempa bumi, atau
                        kebakaran hutan.
                      </li>
                      <li>
                        Akses terhadap infrastruktur pendukung seperti utilitas
                        listrik, jaringan komunikasi, dan transportasi.
                      </li>
                      <li>
                        Kepatuhan terhadap peraturan pusat dan daerah terkait
                        zonasi dan perlindungan lingkungan.
                      </li>
                      <li>
                        Dampak lingkungan jangka panjang dan kemungkinan
                        penggunaan sumber energi terbarukan.
                      </li>
                    </ul>

                    <p className="mt-3 font-medium">Daya (Power):</p>
                    <p>
                      Mitra APJII DC harus memastikan keandalan daya dengan
                      ketentuan:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mt-1">
                      <li>
                        Sistem distribusi daya dirancang dengan redundansi
                        sesuai level tier.
                      </li>
                      <li>
                        Penggunaan Uninterruptible Power Supply (UPS) dan
                        generator adalah wajib untuk menjaga kontinuitas
                        layanan.
                      </li>
                      <li>
                        Jalur distribusi dirancang untuk meminimalkan single
                        point of failure.
                      </li>
                      <li>
                        Harus ada perhitungan kapasitas daya untuk kebutuhan
                        saat ini dan perluasan di masa depan.
                      </li>
                    </ul>

                    <p className="mt-3 font-medium">Pendinginan (Cooling):</p>
                    <p>
                      Mitra APJII DC harus memiliki sistem pendinginan yang
                      krusial dengan standar:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mt-1">
                      <li>
                        Sistem pendinginan dirancang dengan redundansi yang
                        sesuai (N, N+1, atau 2N).
                      </li>
                      <li>
                        Distribusi pendinginan harus mempertimbangkan
                        kontinuitas aliran udara, seperti konfigurasi hot
                        aisle/cold aisle.
                      </li>
                      <li>
                        Untuk level yang lebih tinggi, sistem harus mampu
                        menjalankan pendinginan tanpa henti selama pemeliharaan.
                      </li>
                    </ul>

                    <p className="mt-3 font-medium">Ketentuan Operasional:</p>
                    <ul className="list-disc pl-5 space-y-2 mt-1">
                      <li>
                        Mitra APJII DC harus menyediakan akses 24 jam untuk
                        layanan yang diberikan.
                      </li>
                      <li>
                        Mitra APJII DC harus menyediakan helpdesk yang dapat
                        dihubungi selama 24 jam untuk layanan yang diberikan.
                      </li>
                      <li>
                        Ketentuan mengenai cross connect disesuaikan dengan
                        kebijakan internal masing-masing Mitra APJII DC.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-bold text-gray-900 dark:text-white">
                      Pasal 4: Mekanisme Kerja Sama dan Layanan
                    </h5>

                    <p className="mt-2 font-medium">Proses Kemitraan:</p>
                    <ul className="list-disc pl-5 space-y-2 mt-1">
                      <li>
                        Calon Mitra mengajukan permohonan kerja sama kepada
                        APJII dengan melampirkan dokumen yang menunjukkan
                        pemenuhan syarat.
                      </li>
                      <li>
                        APJII akan melakukan asesmen terhadap pemenuhan
                        persyaratan tersebut.
                      </li>
                      <li>
                        Apabila seluruh persyaratan terpenuhi, APJII akan
                        menunjuk Mitra APJII Data Center melalui sebuah
                        Perjanjian Kerja Sama.
                      </li>
                      <li>
                        APJII akan memberikan akses Dashboard Portal APJII DC
                        kepada Mitra untuk mengelola tenant.
                      </li>
                    </ul>

                    <p className="mt-3 font-medium">
                      Proses Layanan untuk Anggota:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mt-1">
                      <li>
                        Anggota APJII yang ingin menggunakan layanan wajib
                        mengajukan permohonan melalui Portal APJII DC.
                      </li>
                      <li>
                        APJII akan memproses layanan sesuai dengan kapasitas
                        yang disediakan oleh Mitra APJII DC.
                      </li>
                      <li>
                        Seluruh pembayaran atas layanan yang digunakan oleh
                        Anggota, wajib dibayarkan oleh Anggota kepada APJII.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-bold text-gray-900 dark:text-white">
                      Pasal 5: Ketentuan Umum
                    </h5>
                    <ul className="list-disc pl-5 space-y-2 mt-2">
                      <li>
                        <span className="font-medium">Evaluasi:</span> APJII dan
                        Mitra APJII Data Center akan melakukan evaluasi secara
                        berkala terhadap layanan guna memastikan standar yang
                        disepakati terpenuhi.
                      </li>
                      <li>
                        <span className="font-medium">
                          Perubahan Ketentuan:
                        </span>
                        Apabila di kemudian hari terdapat kekeliruan dalam
                        penetapan Surat Keputusan yang menjadi dasar dokumen
                        ini, maka akan diadakan perbaikan seperlunya.
                      </li>
                      <li>
                        <span className="font-medium">Lain-lain:</span> Hal-hal
                        lain yang belum diatur dalam Syarat dan Ketentuan ini
                        akan disesuaikan dengan ketentuan yang berlaku.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-8 mb-4 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <input
                  type="checkbox"
                  id="agree-terms"
                  checked={termsAgreed}
                  onChange={(e) => setTermsAgreed(e.target.checked)}
                  className="h-5 w-5 accent-blue-600 rounded"
                />
                <label
                  htmlFor="agree-terms"
                  className="text-gray-900 dark:text-white font-medium"
                >
                  Saya telah membaca dan menyetujui syarat dan ketentuan di atas
                </label>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="flat"
                  onClick={() => setIsTermsModalOpen(false)}
                  className="border border-gray-200 dark:border-gray-700"
                >
                  Batal
                </Button>
                <Button
                  color="primary"
                  onClick={handleAgreeAndOrder}
                  isLoading={submitting}
                  isDisabled={!termsAgreed}
                >
                  Konfirmasi Pesanan
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
