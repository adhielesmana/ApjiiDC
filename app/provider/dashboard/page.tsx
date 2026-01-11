"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import {
  RectangleStackIcon,
  UserGroupIcon,
  ChartBarIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import { Skeleton } from "@heroui/skeleton";
import { useS3Image } from "@/hooks/useS3Image";

interface Provider {
  _id: string;
  name: string;
  description: string;
  address: string;
  logo?: string;
  contact: {
    email: string;
    phone: string;
  };
  members: any[];
}

interface Rent {
  _id: string;
  status: string;
  price: number;
  space: {
    _id: string;
    name: string;
    price: number;
    size: string;
    images: string[];
  };
  createdAt: string;
}

interface DashboardData {
  provider: Provider;
  rents: Rent[];
  spaceCount: number;
}

export default function ProviderDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { imageUrl: logoUrl, isLoading: logoLoading } = useS3Image(
    data?.provider?.logo
  );

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/provider/dashboard", {
          cache: "no-store",
        });
        const json = await res.json();
        if (json.status === "ok") {
          setData(json.data);
        }
      } catch (e) {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
        <Skeleton className="h-8 w-44 rounded-lg mt-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold">Failed to load dashboard</h1>
      </div>
    );
  }

  const { provider, rents, spaceCount } = data;

  const stats = [
    {
      label: "Total Members",
      value: provider?.members?.length || 0,
      icon: UserGroupIcon,
      color: "blue",
    },
    {
      label: "Total Products",
      value: spaceCount || 0,
      icon: CubeIcon,
      color: "green",
    },
    {
      label: "Total Orders",
      value: rents?.length || 0,
      icon: RectangleStackIcon,
      color: "purple",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section with Gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-lg overflow-hidden mb-8">
        <div className="px-8 py-10 text-white">
          <h1 className="text-3xl font-bold mb-3">
            {provider?.name} Dashboard
          </h1>
          <div className="opacity-90 max-w-2xl mb-6">
            Welcome to your provider dashboard. Monitor platform statistics and
            manage your products and orders from a central location.
          </div>

          <Button
            color="default"
            className="bg-white text-blue-700 font-medium px-6 py-3 rounded-xl hover:bg-blue-50 flex items-center gap-2 shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
            onPress={() => window.location.reload()}
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="border-0 shadow-md rounded-xl overflow-hidden"
          >
            <CardBody className="p-6">
              <div className="flex items-center gap-4">
                <div className={`bg-${stat.color}-100 p-3 rounded-full`}>
                  <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{stat.label}</h3>
                  <div className={`text-3xl font-bold text-${stat.color}-600`}>
                    {stat.value}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
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
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Partner Information
        </h2>

        <Card className="border-0 shadow-md rounded-xl overflow-hidden">
          <CardBody className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  {logoUrl ? (
                    <div className="min-w-16 min-h-16 w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0 flex items-center justify-center bg-white mr-3">
                      <img
                        src={logoUrl}
                        alt={`${provider?.name} logo`}
                        className="max-w-full max-h-full object-contain p-1"
                      />
                    </div>
                  ) : (
                    <div className="min-w-16 min-h-16 w-16 h-16 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center mr-3">
                      <span className="text-blue-600 text-xl font-bold">
                        {provider?.name?.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold">{provider?.name}</h3>
                    <p className="text-default-500 text-sm mt-1">
                      {provider?.description}
                    </p>
                  </div>
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
                      <p className="text-sm">{provider?.contact?.email}</p>
                      <p className="text-sm">{provider?.contact?.phone}</p>
                    </div>
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
                  <p className="text-sm">{provider?.address}</p>
                </div>

                <h4 className="font-medium text-gray-600 mt-4">Members</h4>
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-purple-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm">
                    {provider?.members?.length} team members
                  </p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Recent Orders
        </h2>

        {rents && rents.length > 0 ? (
          <Card className="border-0 shadow-md rounded-xl overflow-hidden">
            <CardBody className="p-0">
              {rents.slice(0, 5).map((rent, index) => (
                <div
                  key={rent._id}
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    index !== rents.slice(0, 5).length - 1
                      ? "border-b border-gray-100"
                      : ""
                  }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {rent.space.name}
                      </h3>
                      <div className="mt-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            rent.status === "active"
                              ? "bg-green-100 text-green-800"
                              : rent.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : rent.status === "completed"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {rent.status}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-600">Size</h4>
                      <p className="text-sm">{rent.space.size}</p>
                    </div>

                    <div className="text-right">
                      <h4 className="font-medium text-gray-600">Price</h4>
                      <p className="text-lg font-bold text-primary">
                        {/* Rp {rent.price.toLocaleString("id-ID")} */}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(rent.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        ) : (
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
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-700 mb-2">
                  No Recent Orders
                </h3>
                <p className="text-gray-500 mb-4 max-w-md mx-auto">
                  Order information will appear here when customers place orders
                  for your products.
                </p>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
