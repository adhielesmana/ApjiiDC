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
                  Terms and Conditions
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
                  APJII Data Center Program Terms and Conditions
                </h4>
                <p>
                  This Terms and Conditions document is prepared based on the
                  Decree of the Chairman of the Indonesian Internet Service
                  Provider Association Number 47 of 2025 concerning Technical
                  Guidelines for the Implementation of the APJII Data Center Program.
                  These Terms and Conditions apply to data center service providers
                  seeking to become partners and to APJII Members using services
                  within this program.
                </p>

                <div className="space-y-4">
                  <div>
                    <h5 className="font-bold text-gray-900 dark:text-white">
                      Article 1: Definitions
                    </h5>
                    <ul className="list-disc pl-5 space-y-2 mt-2">
                      <li>
                        The APJII Data Center Program is a collaborative initiative
                        between APJII and data center service providers, implemented
                        as part of the IIX and Data Center Division's work program
                        under APJII.
                      </li>
                      <li>
                        An APJII Data Center Partner ("APJII DC Partner") is a
                        data center service provider that holds a valid
                        telecommunications operating license.
                      </li>
                      <li>
                        Indonesia Internet Exchange (IIX) is an internet
                        interconnection network owned and managed by APJII.
                      </li>
                      <li>
                        An IIX Node is an extension node of IIX-APJII that
                        connects inter-IIX connectivity.
                      </li>
                      <li>
                        A Member is a member of the Indonesian Internet Service
                        Provider Association (APJII).
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-bold text-gray-900 dark:text-white">
                      Article 2: Requirements to Become an APJII DC Partner
                    </h5>
                    <p className="mt-2">
                      To become an APJII DC Partner, prospective partners must
                      meet the following requirements:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mt-2">
                      <li>
                        Prospective APJII DC Partners must be IIX Node Partners
                        in compliance with Chairman's Decree Number 29 of 2022
                        concerning Technical Guidelines for IIX Node Establishment.
                      </li>
                      <li>
                        Prospective APJII DC Partners must comply with data center
                        tier standards in accordance with TIA-942.
                      </li>
                      <li>
                        Prospective APJII DC Partners must comply with ISO 27001
                        and ISO 9001 standards.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-bold text-gray-900 dark:text-white">
                      Article 3: Partner Technical Specifications and Standards
                    </h5>
                    <p className="mt-2">
                      APJII DC Partners must meet and maintain technical specifications
                      and standards that reference TIA-942 standard qualifications,
                      as follows:
                    </p>

                    <p className="mt-2 font-medium">
                      Data Center Tier Qualifications:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mt-1">
                      <li>
                        <span className="font-medium">TIER 1 - Basic:</span>
                        Uses a single path system for power and cooling (N).
                        Maximum estimated downtime is 28.8 hours per year.
                      </li>
                      <li>
                        <span className="font-medium">
                          TIER 2 - Redundant Components:
                        </span>
                        Uses a single path system for power and cooling, but
                        includes redundant components (N+1). Features raised floor,
                        UPS, and backup generator. Maximum estimated downtime is
                        22 hours per year.
                      </li>
                      <li>
                        <span className="font-medium">
                          TIER 3 - Concurrently Maintainable:
                        </span>
                        Features dual power and cooling distribution paths (one
                        active path) with redundant components (N+1). Enables
                        planned maintenance activities without disrupting operations.
                        Maximum estimated downtime is 1.6 hours per year.
                      </li>
                      <li>
                        <span className="font-medium">
                          TIER 4 - Fault Tolerant:
                        </span>
                        Features multiple power and cooling distribution paths
                        active simultaneously with 2(N+1) redundant components.
                        Designed to withstand at least one unplanned event without
                        impact on critical load. Maximum estimated downtime is
                        0.4 hours per year.
                      </li>
                    </ul>

                    <p className="mt-3 font-medium">Environmental Considerations:</p>
                    <p>
                      APJII DC Partners must consider data center environmental
                      security, including:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mt-1">
                      <li>
                        Natural disaster risks such as flooding, earthquakes, or
                        forest fires.
                      </li>
                      <li>
                        Access to supporting infrastructure such as electrical
                        utilities, communication networks, and transportation.
                      </li>
                      <li>
                        Compliance with national and regional regulations regarding
                        zoning and environmental protection.
                      </li>
                      <li>
                        Long-term environmental impact and potential use of
                        renewable energy sources.
                      </li>
                    </ul>

                    <p className="mt-3 font-medium">Power:</p>
                    <p>
                      APJII DC Partners must ensure power reliability with the
                      following provisions:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mt-1">
                      <li>
                        Power distribution systems are designed with redundancy
                        according to tier level.
                      </li>
                      <li>
                        Use of Uninterruptible Power Supply (UPS) and generators
                        is required to maintain service continuity.
                      </li>
                      <li>
                        Distribution paths are designed to minimize single
                        points of failure.
                      </li>
                      <li>
                        Power capacity calculations for current and future
                        expansion needs are required.
                      </li>
                    </ul>

                    <p className="mt-3 font-medium">Cooling:</p>
                    <p>
                      APJII DC Partners must have critical cooling systems with
                      the following standards:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mt-1">
                      <li>
                        Cooling systems are designed with appropriate redundancy
                        (N, N+1, or 2N).
                      </li>
                      <li>
                        Cooling distribution must consider airflow continuity,
                        such as hot aisle/cold aisle configurations.
                      </li>
                      <li>
                        For higher tier levels, systems must be capable of
                        continuous cooling operation during maintenance.
                      </li>
                    </ul>

                    <p className="mt-3 font-medium">Operational Requirements:</p>
                    <ul className="list-disc pl-5 space-y-2 mt-1">
                      <li>
                        APJII DC Partners must provide 24-hour access for
                        the services provided.
                      </li>
                      <li>
                        APJII DC Partners must provide a 24-hour helpdesk
                        for the services provided.
                      </li>
                      <li>
                        Cross-connect provisions are adjusted according to
                        each APJII DC Partner's internal policies.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-bold text-gray-900 dark:text-white">
                      Article 4: Partnership and Service Mechanisms
                    </h5>

                    <p className="mt-2 font-medium">Partnership Process:</p>
                    <ul className="list-disc pl-5 space-y-2 mt-1">
                      <li>
                        Prospective partners submit a cooperation application to
                        APJII with documents demonstrating compliance with
                        requirements.
                      </li>
                      <li>
                        APJII will conduct an assessment of requirement
                        fulfillment.
                      </li>
                      <li>
                        If all requirements are met, APJII will appoint the
                        APJII Data Center Partner through a Cooperation Agreement.
                      </li>
                      <li>
                        APJII will provide Dashboard Portal APJII DC access
                        to Partners to manage tenants.
                      </li>
                    </ul>

                    <p className="mt-3 font-medium">
                      Service Process for Members:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mt-1">
                      <li>
                        APJII Members who wish to use services must submit an
                        application through the APJII DC Portal.
                      </li>
                      <li>
                        APJII will process services according to the capacity
                        provided by the APJII DC Partner.
                      </li>
                      <li>
                        All payments for services used by Members must be
                        remitted by Members to APJII.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-bold text-gray-900 dark:text-white">
                      Article 5: General Provisions
                    </h5>
                    <ul className="list-disc pl-5 space-y-2 mt-2">
                      <li>
                        <span className="font-medium">Evaluation:</span> APJII and
                        APJII Data Center Partners will conduct periodic evaluations
                        of services to ensure agreed standards are met.
                      </li>
                      <li>
                        <span className="font-medium">
                          Amendment of Provisions:
                        </span>
                        If errors are subsequently found in the Decree that forms
                        the basis of this document, necessary corrections will be made.
                      </li>
                      <li>
                        <span className="font-medium">Miscellaneous:</span> Other
                        matters not covered in these Terms and Conditions will be
                        adjusted according to applicable regulations.
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
