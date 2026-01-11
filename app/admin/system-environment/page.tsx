"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Skeleton } from "@heroui/skeleton";
import { AlertCircle, Info, Eye, EyeOff } from "lucide-react";
import { addToast } from "@heroui/toast";

interface EnvVariables {
  [key: string]: string;
}

export default function SystemEnvironmentPage() {
  const [envVars, setEnvVars] = useState<EnvVariables | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hiddenValues, setHiddenValues] = useState<{ [key: string]: boolean }>(
    {}
  );

  useEffect(() => {
    fetchEnvVars();
  }, []);

  const fetchEnvVars = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get("/api/admin/system-env");

      if (response.data.status === "ok") {
        setEnvVars(response.data.data);
        // Initialize all sensitive fields as hidden
        const hidden = Object.keys(response.data.data).reduce(
          (acc, key) => {
            acc[key] =
              key.includes("SECRET") ||
              key.includes("PASSWORD") ||
              key.includes("KEY") ||
              key.includes("TOKEN");
            return acc;
          },
          {} as { [key: string]: boolean }
        );
        setHiddenValues(hidden);
      } else {
        setError(
          response.data.message || "Failed to fetch environment variables"
        );
      }
    } catch (error: any) {
      setError(
        error.response?.data?.message || "Failed to fetch environment variables"
      );
      addToast({
        title: "Error",
        color: "danger",
        description:
          error.response?.data?.message ||
          "Failed to fetch environment variables",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleValueVisibility = (key: string) => {
    setHiddenValues((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl overflow-hidden">
          <Skeleton className="h-40 w-full" />
        </div>
        <Card className="border-0 shadow-md rounded-xl overflow-hidden">
          <CardHeader className="bg-gray-50 py-3">
            <Skeleton className="h-6 w-3/4 rounded mb-2" />
          </CardHeader>
          <CardBody className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between items-center">
                  <Skeleton className="h-6 w-1/4 rounded" />
                  <Skeleton className="h-6 w-1/2 rounded" />
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-lg overflow-hidden mb-8">
        <div className="px-8 py-10 text-white">
          <h1 className="text-3xl font-bold mb-3">System Environment</h1>
          <div className="opacity-90 max-w-2xl mb-6">
            View and manage system environment variables
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-1 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      <Card className="border-0 shadow-md rounded-xl overflow-hidden">
        <CardHeader className="bg-gray-50 py-3">
          <h3 className="text-lg font-medium flex items-center gap-2">
            Environment Variables
            <span className="cursor-help text-muted-foreground">
              <Info className="h-4 w-4" />
            </span>
          </h3>
        </CardHeader>
        <CardBody className="p-6">
          <div className="space-y-4">
            {envVars &&
              Object.entries(envVars).map(([key, value]) => (
                <div
                  key={key}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <Chip color="primary" variant="flat" className="mb-1">
                      {key}
                    </Chip>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-100 px-3 py-1 rounded text-sm font-mono">
                      {hiddenValues[key] ? "••••••••••••" : value}
                    </code>
                    <button
                      onClick={() => toggleValueVisibility(key)}
                      className="p-1 hover:bg-gray-200 rounded"
                      title={hiddenValues[key] ? "Show value" : "Hide value"}
                    >
                      {hiddenValues[key] ? (
                        <Eye className="h-4 w-4 text-gray-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
