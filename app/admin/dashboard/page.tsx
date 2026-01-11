"use client";

import { useEffect, useState } from "react";
import { Card, CardBody } from "@heroui/card";
import axios from "axios";
import { addToast } from "@heroui/toast";
import { Button } from "@heroui/button";
import { Skeleton } from "@heroui/skeleton";

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

export default function AdminDashboard() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/admin/providers");
      if (response.data.status === "ok") {
        setProviders(response.data.data || []);
      }
    } catch (error: any) {
      addToast({
        title: "Error",
        color: "danger",
        description: "Failed to fetch providers",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Section with Gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-lg overflow-hidden mb-8">
        <div className="px-8 py-10 text-white">
          <h1 className="text-3xl font-bold mb-3">Admin Dashboard</h1>
          <div className="opacity-90 max-w-2xl mb-6">
            Welcome to the admin dashboard. Monitor platform statistics and
            manage partners from a central location.
          </div>

          <Button
            color="default"
            className="bg-white text-blue-700 font-medium px-6 py-3 rounded-xl hover:bg-blue-50 flex items-center gap-2 shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
            onPress={fetchProviders}
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
            Refresh Data
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-md rounded-xl overflow-hidden">
          <CardBody className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-600"
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
                <h3 className="text-lg font-semibold">Partners</h3>
                <div className="text-3xl font-bold text-blue-600">
                  {loading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    providers.length
                  )}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
        {/* 
        <Card className="border-0 shadow-md rounded-xl overflow-hidden">
          <CardBody className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-green-600"
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
              <div>
                <h3 className="text-lg font-semibold">Active Orders</h3>
                <div className="text-3xl font-bold text-green-600">
                  {loading ? <Skeleton className="h-8 w-16" /> : "0"}
                </div>
              </div>
            </div>
          </CardBody>
        </Card> */}

        {/* <Card className="border-0 shadow-md rounded-xl overflow-hidden">
          <CardBody className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Revenue</h3>
                <div className="text-3xl font-bold text-purple-600">
                  {loading ? <Skeleton className="h-8 w-24" /> : "Rp 0"}
                </div>
              </div>
            </div>
          </CardBody>
        </Card> */}
      </div>

      <div className="space-y-4 mt-8">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          Partners List
        </h2>

        {loading ? (
          // Skeleton loading state
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card
                key={i}
                className="border-0 shadow-md rounded-xl overflow-hidden"
              >
                <CardBody>
                  <Skeleton className="h-6 w-1/3 rounded mb-4" />
                  <Skeleton className="h-4 w-2/3 rounded mb-2" />
                  <div className="mt-2">
                    <Skeleton className="h-4 w-1/4 rounded mb-1" />
                    <Skeleton className="h-4 w-1/4 rounded" />
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        ) : providers.length === 0 ? (
          <Card className="border-0 shadow-md rounded-xl overflow-hidden">
            <CardBody className="p-0">
              <div className="text-center py-16 px-6">
                <div className="bg-blue-50 rounded-full p-4 inline-block mb-4">
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
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-700 mb-2">
                  No Partners Found
                </h3>
                <p className="text-gray-500 mb-4 max-w-md mx-auto">
                  There are no partners registered in the system yet. Partners
                  will appear here once they join the platform.
                </p>
              </div>
            </CardBody>
          </Card>
        ) : (
          providers.map((provider) => (
            <Card
              key={provider._id}
              className="w-full border-0 shadow-md hover:shadow-lg transition-all rounded-xl overflow-hidden"
            >
              <CardBody className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">{provider.name}</h3>
                    <p className="text-default-500 text-sm mt-1">
                      {provider.description}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-600">Contact</h4>
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-full">
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
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm">{provider.contact.email}</p>
                        <p className="text-sm">{provider.contact.phone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-600">Location</h4>
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-2 rounded-full">
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
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                      <p className="text-sm">{provider.address}</p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
